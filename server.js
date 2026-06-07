/**
 * SOCKET.IO SERVER — Integration Layer
 * Wraps GameRoom with real-time transport via Socket.IO.
 *
 * Run:  node server.js
 * Deps: npm install express socket.io
 *
 * Event flow (client → server):
 *   join_room       { roomId, playerName }
 *   start_game      { roomId }
 *   choose_mutator  { roomId, mutatorId }
 *   submit_answer   { roomId, answer }
 *   next_round      { roomId }
 *   create_room     { maxPlayers, totalRounds, mutatorsEnabled }
 *   get_snapshot    { roomId }
 *
 * Event flow (server → client, broadcast to roomId):
 *   PLAYER_JOINED | PLAYER_LEFT
 *   MUTATOR_SELECTION | MUTATOR_CHOSEN | STEAL_APPLIED
 *   QUESTION_START | ANSWER_RECEIVED
 *   ROUND_RESULT
 *   GAME_OVER
 *   ERROR  { message }
 */

const express = require("express");
const http    = require("http");
const { Server } = require("socket.io");
const { GameRoom } = require("./gameStateManager");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

// ─── Room Registry ─────────────────────────────────────────────────────────────
// Map<roomId, GameRoom>
const rooms = new Map();

/** Generate a short unique room code */
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── REST: Create Room ─────────────────────────────────────────────────────────
app.post("/api/create-room", (req, res) => {
  const { maxPlayers = 10, totalRounds = 5, mutatorsEnabled = false } = req.body;

  try {
    const roomId  = generateRoomId();
    const adminId = `admin_${roomId}`;          // Admin gets a token; handle auth properly in production

    const room = new GameRoom({ roomId, adminId, maxPlayers, totalRounds, mutatorsEnabled });

    // Wire up event broadcasting
    room.onEvent = (event, payload) => {
      io.to(roomId).emit(event, payload);
    };

    rooms.set(roomId, room);

    res.json({ ok: true, roomId, adminId });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ─── REST: Room Snapshot ───────────────────────────────────────────────────────
app.get("/api/room/:roomId/snapshot", (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ ok: false, error: "Room not found." });
  res.json({ ok: true, snapshot: room.getSnapshot() });
});

// ─── Socket.IO ─────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[CONNECT] ${socket.id}`);

  // Helper: send error only to this socket
  const err = (msg) => socket.emit("ERROR", { message: msg });

  // ── Join Room ──────────────────────────────────────────────────────────────
  socket.on("join_room", ({ roomId, playerName }) => {
    const room = rooms.get(roomId);
    if (!room) return err("Room not found.");

    const result = room.addPlayer(socket.id, playerName);
    if (!result.ok) return err(result.error);

    socket.join(roomId);
    socket.data.roomId     = roomId;
    socket.data.playerName = playerName;

    // Send current snapshot to the joining player only
    socket.emit("ROOM_JOINED", { roomId, snapshot: room.getSnapshot() });
  });

  // ── Start Game (admin) ─────────────────────────────────────────────────────
  socket.on("start_game", ({ roomId, adminId }) => {
    const room = rooms.get(roomId);
    if (!room) return err("Room not found.");

    const result = room.startGame(adminId);
    if (!result.ok) return err(result.error);
  });

  // ── Choose Mutator ─────────────────────────────────────────────────────────
  socket.on("choose_mutator", ({ roomId, mutatorId }) => {
    const room = rooms.get(roomId);
    if (!room) return err("Room not found.");

    const result = room.chooseMutator(socket.id, mutatorId);
    if (!result.ok) return err(result.error);
  });

  // ── Submit Answer ──────────────────────────────────────────────────────────
  socket.on("submit_answer", ({ roomId, answer }) => {
    const room = rooms.get(roomId);
    if (!room) return err("Room not found.");

    const result = room.submitAnswer(socket.id, answer);
    if (!result.ok) return err(result.error);
  });

  // ── Next Round (admin) ─────────────────────────────────────────────────────
  socket.on("next_round", ({ roomId, adminId }) => {
    const room = rooms.get(roomId);
    if (!room) return err("Room not found.");

    const result = room.nextRound(adminId);
    if (!result.ok) return err(result.error);
  });

  // ── Get Snapshot ───────────────────────────────────────────────────────────
  socket.on("get_snapshot", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return err("Room not found.");
    socket.emit("SNAPSHOT", room.getSnapshot());
  });

  // ── Disconnect ─────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const { roomId } = socket.data;
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) room.removePlayer(socket.id);
    }
    console.log(`[DISCONNECT] ${socket.id}`);
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎮 Falacia Game Server running on http://localhost:${PORT}`);
});

module.exports = { app, server };
