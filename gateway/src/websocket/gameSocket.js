/**
 * WebSocket Server — Real-time game events
 * Handles live game state broadcasting, move notifications,
 * player presence, and spectator mode.
 */

const WebSocket = require("ws");

// Connected clients: Map<gameId, Set<ws>>
const gameRooms = new Map();
// Online players: Map<userId, ws>
const onlinePlayers = new Map();
// Analytics
const stats = { totalConnections: 0, activeConnections: 0, messagesSent: 0 };

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: "/ws" });
  const HEARTBEAT = parseInt(process.env.WS_HEARTBEAT_INTERVAL) || 30000;

  wss.on("connection", (ws, req) => {
    stats.totalConnections++;
    stats.activeConnections++;
    ws.isAlive = true;
    ws.userId = null;
    ws.gameId = null;

    console.log(`[WS] New connection (active: ${stats.activeConnections})`);

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data);
        handleMessage(ws, message);
      } catch (err) {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      }
    });

    ws.on("close", () => {
      stats.activeConnections--;
      handleDisconnect(ws);
      console.log(`[WS] Disconnected (active: ${stats.activeConnections})`);
    });

    // Welcome message
    ws.send(
      JSON.stringify({
        type: "connected",
        message: "Connected to ChessMaster real-time server",
        timestamp: new Date().toISOString(),
      })
    );
  });

  // Heartbeat to detect stale connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, HEARTBEAT);

  wss.on("close", () => clearInterval(interval));

  console.log("[WS] WebSocket server initialized");
  return wss;
}

// ──────────────── Message Handler ────────────────

function handleMessage(ws, message) {
  switch (message.type) {
    case "auth":
      handleAuth(ws, message);
      break;
    case "join_game":
      handleJoinGame(ws, message);
      break;
    case "leave_game":
      handleLeaveGame(ws);
      break;
    case "move":
      handleMove(ws, message);
      break;
    case "chat":
      handleChat(ws, message);
      break;
    case "spectate":
      handleSpectate(ws, message);
      break;
    case "game_event":
      handleGameEvent(ws, message);
      break;
    default:
      ws.send(JSON.stringify({ type: "error", message: `Unknown type: ${message.type}` }));
  }
}

// ──────────────── Auth ────────────────

function handleAuth(ws, { userId, username }) {
  ws.userId = userId;
  ws.username = username || "Anonymous";
  onlinePlayers.set(userId, ws);

  ws.send(
    JSON.stringify({
      type: "auth_success",
      userId,
      onlinePlayers: onlinePlayers.size,
    })
  );

  // Broadcast player count update
  broadcastGlobal({
    type: "players_online",
    count: onlinePlayers.size,
  });
}

// ──────────────── Game Room ────────────────

function handleJoinGame(ws, { gameId }) {
  if (!gameId) return;

  // Leave previous game if any
  if (ws.gameId) handleLeaveGame(ws);

  ws.gameId = gameId;
  if (!gameRooms.has(gameId)) {
    gameRooms.set(gameId, new Set());
  }
  gameRooms.get(gameId).add(ws);

  const room = gameRooms.get(gameId);
  broadcastToRoom(gameId, {
    type: "player_joined",
    userId: ws.userId,
    username: ws.username,
    playersInRoom: room.size,
    gameId,
  });
}

function handleLeaveGame(ws) {
  const { gameId } = ws;
  if (!gameId) return;

  const room = gameRooms.get(gameId);
  if (room) {
    room.delete(ws);
    if (room.size === 0) {
      gameRooms.delete(gameId);
    } else {
      broadcastToRoom(gameId, {
        type: "player_left",
        userId: ws.userId,
        username: ws.username,
        playersInRoom: room.size,
      });
    }
  }
  ws.gameId = null;
}

// ──────────────── Move Broadcasting ────────────────

function handleMove(ws, { gameId, move, fen, evaluation }) {
  stats.messagesSent++;
  broadcastToRoom(
    gameId || ws.gameId,
    {
      type: "move",
      userId: ws.userId,
      username: ws.username,
      move,
      fen,
      evaluation,
      timestamp: new Date().toISOString(),
    },
    ws // exclude sender
  );
}

// ──────────────── Chat ────────────────

function handleChat(ws, { gameId, text }) {
  if (!text || text.trim().length === 0) return;
  broadcastToRoom(gameId || ws.gameId, {
    type: "chat",
    userId: ws.userId,
    username: ws.username,
    text: text.substring(0, 500), // Limit length
    timestamp: new Date().toISOString(),
  });
}

// ──────────────── Spectate ────────────────

function handleSpectate(ws, { gameId }) {
  handleJoinGame(ws, { gameId });
  ws.isSpectator = true;
  ws.send(
    JSON.stringify({
      type: "spectating",
      gameId,
      message: "You are now spectating this game",
    })
  );
}

// ──────────────── Game Events ────────────────

function handleGameEvent(ws, { gameId, event, data }) {
  broadcastToRoom(gameId || ws.gameId, {
    type: "game_event",
    event, // "check", "checkmate", "draw", "resign", "time_out"
    data,
    userId: ws.userId,
    timestamp: new Date().toISOString(),
  });
}

// ──────────────── Disconnect ────────────────

function handleDisconnect(ws) {
  handleLeaveGame(ws);
  if (ws.userId) {
    onlinePlayers.delete(ws.userId);
    broadcastGlobal({
      type: "players_online",
      count: onlinePlayers.size,
    });
  }
}

// ──────────────── Broadcast Helpers ────────────────

function broadcastToRoom(gameId, message, exclude = null) {
  const room = gameRooms.get(gameId);
  if (!room) return;
  const payload = JSON.stringify(message);
  room.forEach((client) => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function broadcastGlobal(message) {
  const payload = JSON.stringify(message);
  onlinePlayers.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// ──────────────── Exports ────────────────

function getStats() {
  return {
    ...stats,
    activeRooms: gameRooms.size,
    onlinePlayers: onlinePlayers.size,
  };
}

module.exports = { setupWebSocket, getStats, broadcastToRoom, broadcastGlobal };
