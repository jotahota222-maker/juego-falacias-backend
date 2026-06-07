/**
 * GAME STATE MANAGER
 * Central state machine that orchestrates the full game lifecycle.
 *
 * States:  LOBBY → MUTATOR_SELECTION → QUESTION → REVEAL → GAME_OVER
 *
 * This module is framework-agnostic. It exports a pure class that can be
 * wrapped by Socket.IO, Express, or any other transport layer.
 */

const { generateQuestionDeck } = require("./questionEngine");
const {
  processRoundAnswers,
  applyStealMutator,
  calculateFinalPodium,
  getTop5,
  pickMutatorPlayer,
  getMutatorOptions,
} = require("./scoringEngine");

// ─── Game Phase Constants ──────────────────────────────────────────────────────
const PHASE = {
  LOBBY:             "LOBBY",
  MUTATOR_SELECTION: "MUTATOR_SELECTION",
  QUESTION:          "QUESTION",
  REVEAL:            "REVEAL",
  GAME_OVER:         "GAME_OVER",
};

// ─── GameRoom Class ────────────────────────────────────────────────────────────
class GameRoom {
  /**
   * @param {Object} config
   * @param {string}  config.roomId
   * @param {string}  config.adminId
   * @param {number}  config.maxPlayers  - minimum 10
   * @param {number}  config.totalRounds - minimum 5
   * @param {boolean} config.mutatorsEnabled
   * @param {number}  [config.questionTimeSec=30] - seconds per question
   */
  constructor({ roomId, adminId, maxPlayers, totalRounds, mutatorsEnabled, questionTimeSec = 30 }) {
    // Validate config
    if (maxPlayers < 10)  throw new Error("maxPlayers must be >= 10");
    if (totalRounds < 5)  throw new Error("totalRounds must be >= 5");

    this.roomId          = roomId;
    this.adminId         = adminId;
    this.maxPlayers      = maxPlayers;
    this.totalRounds     = totalRounds;
    this.mutatorsEnabled = mutatorsEnabled;
    this.questionTimeSec = questionTimeSec;

    // Players: Map<playerId, PlayerState>
    this.players = new Map();

    // Questions deck generated at game start
    this.questionDeck = [];

    // Current round index (0-based)
    this.currentRound = 0;

    // Current phase
    this.phase = PHASE.LOBBY;

    // Current round state
    this.roundState = null;

    // Timer reference (Node.js setInterval / setTimeout handle)
    this._questionTimer = null;

    // Event emitter callback — set externally (e.g., by Socket.IO handler)
    // Signature: (event: string, payload: Object) => void
    this.onEvent = null;
  }

  // ─── Player Management ──────────────────────────────────────────────────────

  /**
   * Add a player to the lobby.
   * @param {string} playerId
   * @param {string} playerName
   * @returns {{ ok: boolean, error?: string }}
   */
  addPlayer(playerId, playerName) {
    if (this.phase !== PHASE.LOBBY) {
      return { ok: false, error: "Game already started. Cannot join." };
    }
    if (this.players.size >= this.maxPlayers) {
      return { ok: false, error: "Room is full." };
    }
    if (this.players.has(playerId)) {
      return { ok: false, error: "Player already in room." };
    }

    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      score: 0,
      roundHistory: [],
    });

    this._emit("PLAYER_JOINED", { playerId, playerName, playerCount: this.players.size });
    return { ok: true };
  }

  /**
   * Remove a player (disconnect / leave).
   * @param {string} playerId
   */
  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (!player) return;
    this.players.delete(playerId);
    this._emit("PLAYER_LEFT", { playerId, playerName: player.name });
  }

  // ─── Game Lifecycle ──────────────────────────────────────────────────────────

  /**
   * Admin starts the game. Generates question deck and moves to first round.
   * @param {string} requesterId - must be adminId
   * @returns {{ ok: boolean, error?: string }}
   */
  startGame(requesterId) {
    if (requesterId !== this.adminId) return { ok: false, error: "Only admin can start the game." };
    if (this.phase !== PHASE.LOBBY)  return { ok: false, error: "Game is not in lobby." };
    if (this.players.size < 2)       return { ok: false, error: "Need at least 2 players to start." };

    this.questionDeck = generateQuestionDeck(this.totalRounds);
    this.currentRound = 0;
    this._beginRound();
    return { ok: true };
  }

  /**
   * Initialize and broadcast a new round.
   * If mutators are enabled, first enters MUTATOR_SELECTION phase.
   */
  _beginRound() {
    const question = this.questionDeck[this.currentRound];

    this.roundState = {
      roundNumber: this.currentRound + 1,   // 1-based for display
      question,
      answers: new Map(),                    // playerId → answer string
      mutatorId: null,
      mutatorChooserId: null,
      stealTarget: null,
    };

    if (this.mutatorsEnabled) {
      this.phase = PHASE.MUTATOR_SELECTION;
      const chooserId = pickMutatorPlayer(this.players);
      this.roundState.mutatorChooserId = chooserId;

      this._emit("MUTATOR_SELECTION", {
        roundNumber:    this.roundState.roundNumber,
        chooserId,
        chooserName:    this.players.get(chooserId)?.name ?? "?",
        mutatorOptions: getMutatorOptions(),
      });
    } else {
      this._startQuestion();
    }
  }

  /**
   * The designated mutator-chooser submits their mutator choice.
   * @param {string} playerId
   * @param {string} mutatorId  - one of DOUBLE | TEN | TWENTY | STEAL
   * @returns {{ ok: boolean, error?: string }}
   */
  chooseMutator(playerId, mutatorId) {
    if (this.phase !== PHASE.MUTATOR_SELECTION) {
      return { ok: false, error: "Not in mutator selection phase." };
    }
    if (playerId !== this.roundState.mutatorChooserId) {
      return { ok: false, error: "You are not the mutator chooser this round." };
    }

    const validIds = ["DOUBLE", "TEN", "TWENTY", "STEAL"];
    if (!validIds.includes(mutatorId)) {
      return { ok: false, error: "Invalid mutator." };
    }

    this.roundState.mutatorId = mutatorId;

    // Apply STEAL immediately before question starts
    if (mutatorId === "STEAL") {
      const result = applyStealMutator(this.players);
      this.roundState.stealTarget = result;
      this._emit("STEAL_APPLIED", {
        targetId:   result.targetId,
        targetName: result.targetName,
        points:     -20,
      });
    }

    this._emit("MUTATOR_CHOSEN", {
      mutatorId,
      chooserId:   playerId,
      chooserName: this.players.get(playerId)?.name ?? "?",
    });

    this._startQuestion();
    return { ok: true };
  }

  /**
   * Transition to QUESTION phase, broadcast question, start countdown.
   */
  _startQuestion() {
    this.phase = PHASE.QUESTION;

    const { question, roundNumber, mutatorId } = this.roundState;

    this._emit("QUESTION_START", {
      roundNumber,
      totalRounds:  this.totalRounds,
      questionId:   question.id,
      scenario:     question.scenario,
      question:     question.question,
      options:      question.options,
      timeLimitSec: this.questionTimeSec,
      mutatorId,
    });

    // Auto-close answers when time expires
    this._questionTimer = setTimeout(() => {
      this._closeRound();
    }, this.questionTimeSec * 1000);
  }

  /**
   * Submit a player's answer for the current round.
   * @param {string} playerId
   * @param {string} answer - must match one of question.options exactly
   * @returns {{ ok: boolean, error?: string }}
   */
  submitAnswer(playerId, answer) {
    if (this.phase !== PHASE.QUESTION) {
      return { ok: false, error: "No active question." };
    }
    if (!this.players.has(playerId)) {
      return { ok: false, error: "Player not found." };
    }
    if (this.roundState.answers.has(playerId)) {
      return { ok: false, error: "Answer already submitted." };
    }
    if (!this.roundState.question.options.includes(answer)) {
      return { ok: false, error: "Invalid answer option." };
    }

    this.roundState.answers.set(playerId, answer);
    this._emit("ANSWER_RECEIVED", { playerId, totalAnswers: this.roundState.answers.size });

    // Auto-close if everyone answered
    if (this.roundState.answers.size === this.players.size) {
      clearTimeout(this._questionTimer);
      this._closeRound();
    }

    return { ok: true };
  }

  /**
   * Score all answers, emit results, move to next round or end game.
   */
  _closeRound() {
    this.phase = PHASE.REVEAL;

    const { answers, question, mutatorId } = this.roundState;

    // Fill in non-answerers with null (counts as wrong)
    for (const [pid] of this.players) {
      if (!answers.has(pid)) answers.set(pid, null);
    }

    const result = processRoundAnswers(this.players, answers, question.correctAnswer, mutatorId);

    this._emit("ROUND_RESULT", {
      roundNumber:   this.roundState.roundNumber,
      correctAnswer: question.correctAnswer,
      category:      question.category,
      fallacyName:   question.fallacyName,
      hint:          question.hint,
      mutatorId,
      playerResults: result.playerResults,
      top5:          result.leaderboard,
    });

    // Advance or end
    this.currentRound++;
    if (this.currentRound >= this.totalRounds) {
      this._endGame();
    }
    // Otherwise, admin triggers next round via nextRound()
  }

  /**
   * Admin manually advances to the next round (called after REVEAL).
   * @param {string} requesterId
   * @returns {{ ok: boolean, error?: string }}
   */
  nextRound(requesterId) {
    if (requesterId !== this.adminId) return { ok: false, error: "Only admin can advance rounds." };
    if (this.phase !== PHASE.REVEAL)  return { ok: false, error: "Not in reveal phase." };
    if (this.currentRound >= this.totalRounds) return { ok: false, error: "Game already over." };

    this._beginRound();
    return { ok: true };
  }

  /**
   * Calculate and emit the final podium.
   */
  _endGame() {
    this.phase = PHASE.GAME_OVER;
    const finalResult = calculateFinalPodium(this.players);

    this._emit("GAME_OVER", {
      winners:         finalResult.winners,
      podium:          finalResult.podium,
      fullLeaderboard: finalResult.fullLeaderboard.map((p) => ({
        id:    p.id,
        name:  p.name,
        score: p.score,
      })),
    });
  }

  // ─── State Snapshot ──────────────────────────────────────────────────────────

  /**
   * Return a serializable snapshot of the current game state.
   * Useful for reconnecting players or persistence.
   */
  getSnapshot() {
    return {
      roomId:          this.roomId,
      phase:           this.phase,
      currentRound:    this.currentRound,
      totalRounds:     this.totalRounds,
      mutatorsEnabled: this.mutatorsEnabled,
      players:         [...this.players.values()].map((p) => ({
        id:    p.id,
        name:  p.name,
        score: p.score,
      })),
      top5: getTop5(this.players),
    };
  }

  // ─── Internal ────────────────────────────────────────────────────────────────

  /**
   * Dispatch an event to the registered handler (e.g., Socket.IO room broadcast).
   * @param {string} event
   * @param {Object} payload
   */
  _emit(event, payload) {
    if (typeof this.onEvent === "function") {
      this.onEvent(event, { ...payload, roomId: this.roomId, timestamp: Date.now() });
    }
  }
}

module.exports = { GameRoom, PHASE };
