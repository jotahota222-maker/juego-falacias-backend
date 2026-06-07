/**
 * SCORING ENGINE
 * Handles all scoring logic: base points, mutator multipliers,
 * leaderboard calculation, and tie-detection.
 */

// ─── Constants ────────────────────────────────────────────────────────────────
const POINTS = {
  CORRECT: 20,
  INCORRECT: -5,
};

const MUTATORS = {
  DOUBLE: { id: "DOUBLE", label: "Puntos x2", description: "Todos los puntos de esta ronda se multiplican por 2." },
  TEN: { id: "TEN", label: "Puntos x10", description: "Todos los puntos de esta ronda se multiplican por 10." },
  TWENTY: { id: "TWENTY", label: "Puntos x20", description: "Todos los puntos de esta ronda se multiplican por 20." },
  STEAL: {
    id: "STEAL",
    label: "Quitarle 20 al Top 1",
    description: "Se restan 20 puntos al jugador con más puntos al inicio de la ronda.",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sort players by score descending.
 * @param {Map<string, PlayerState>} playersMap
 * @returns {PlayerState[]} sorted array
 */
function sortedLeaderboard(playersMap) {
  return [...playersMap.values()].sort((a, b) => b.score - a.score);
}

/**
 * Get multiplier factor for a mutator (not applicable to STEAL).
 * @param {string|null} mutatorId
 * @returns {number}
 */
function getMultiplier(mutatorId) {
  switch (mutatorId) {
    case "DOUBLE": return 2;
    case "TEN":    return 10;
    case "TWENTY": return 20;
    default:       return 1;
  }
}

// ─── Core Scoring ─────────────────────────────────────────────────────────────

/**
 * Apply the STEAL mutator before round answers are processed.
 * Deducts 20 points from the current Top 1 player.
 *
 * @param {Map<string, PlayerState>} playersMap  - mutable player state map
 * @returns {{ targetId: string|null, targetName: string|null }}
 */
function applyStealMutator(playersMap) {
  const board = sortedLeaderboard(playersMap);
  if (board.length === 0) return { targetId: null, targetName: null };

  const top = board[0];
  top.score -= 20;
  playersMap.set(top.id, top);

  return { targetId: top.id, targetName: top.name };
}

/**
 * Calculate delta points for a single answer.
 *
 * @param {boolean} isCorrect
 * @param {string|null} mutatorId  - active mutator for this round
 * @returns {number}
 */
function calculateDelta(isCorrect, mutatorId) {
  if (mutatorId === "STEAL") {
    // STEAL only affects pre-round deduction; answer scoring is normal
    return isCorrect ? POINTS.CORRECT : POINTS.INCORRECT;
  }
  const base = isCorrect ? POINTS.CORRECT : POINTS.INCORRECT;
  return base * getMultiplier(mutatorId);
}

/**
 * Process all answers submitted in a round and update player scores.
 *
 * @param {Map<string, PlayerState>} playersMap   - mutable player state map
 * @param {Map<string, string>}      answers      - playerId → submitted answer string
 * @param {string}                   correctAnswer
 * @param {string|null}              mutatorId    - active mutator (null if no mutators)
 * @returns {RoundResult}
 */
function processRoundAnswers(playersMap, answers, correctAnswer, mutatorId) {
  const roundResults = [];

  for (const [playerId, submittedAnswer] of answers.entries()) {
    const player = playersMap.get(playerId);
    if (!player) continue;

    const isCorrect = submittedAnswer === correctAnswer;
    const delta = calculateDelta(isCorrect, mutatorId);

    player.score += delta;
    player.roundHistory.push({ isCorrect, delta, mutatorId });
    playersMap.set(playerId, player);

    roundResults.push({
      playerId,
      playerName: player.name,
      isCorrect,
      submittedAnswer,
      delta,
      newScore: player.score,
    });
  }

  return {
    correctAnswer,
    mutatorId,
    playerResults: roundResults,
    leaderboard: getTop5(playersMap),
  };
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

/**
 * Return the top 5 players sorted by score.
 * @param {Map<string, PlayerState>} playersMap
 * @returns {LeaderboardEntry[]}
 */
function getTop5(playersMap) {
  return sortedLeaderboard(playersMap).slice(0, 5).map((p, i) => ({
    rank: i + 1,
    id: p.id,
    name: p.name,
    score: p.score,
  }));
}

/**
 * Calculate final podium with tie detection.
 * All players tied for 1st are returned as co-winners.
 *
 * @param {Map<string, PlayerState>} playersMap
 * @returns {FinalResult}
 */
function calculateFinalPodium(playersMap) {
  const sorted = sortedLeaderboard(playersMap);
  if (sorted.length === 0) return { winners: [], podium: [] };

  const topScore = sorted[0].score;

  // All players with the top score are co-winners
  const winners = sorted
    .filter((p) => p.score === topScore)
    .map((p) => ({ id: p.id, name: p.name, score: p.score }));

  // Full podium (up to 3 positions, respecting ties per position)
  const podium = [];
  let currentRank = 1;
  let i = 0;

  while (i < sorted.length && currentRank <= 3) {
    const groupScore = sorted[i].score;
    const group = [];

    while (i < sorted.length && sorted[i].score === groupScore) {
      group.push({ id: sorted[i].id, name: sorted[i].name, score: sorted[i].score });
      i++;
    }

    podium.push({ rank: currentRank, players: group, score: groupScore });
    currentRank += group.length;
  }

  return { winners, podium, fullLeaderboard: sorted };
}

// ─── Mutator Selection ────────────────────────────────────────────────────────

/**
 * Pick a random player to be the mutator chooser for the round.
 * @param {Map<string, PlayerState>} playersMap
 * @returns {string|null} playerId
 */
function pickMutatorPlayer(playersMap) {
  const ids = [...playersMap.keys()];
  if (ids.length === 0) return null;
  return ids[Math.floor(Math.random() * ids.length)];
}

/**
 * Return the list of available mutators for the chooser to pick from.
 * @returns {Mutator[]}
 */
function getMutatorOptions() {
  return Object.values(MUTATORS);
}

module.exports = {
  POINTS,
  MUTATORS,
  processRoundAnswers,
  applyStealMutator,
  calculateDelta,
  getTop5,
  calculateFinalPodium,
  pickMutatorPlayer,
  getMutatorOptions,
  sortedLeaderboard,
};
