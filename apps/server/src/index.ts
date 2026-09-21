import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import type {
  Accusation,
  CaseDefinition,
  ClientToServerEvents,
  ScoreResult,
  ServerToClientEvents,
  Role,
} from "@case-zero/shared";
import case01 from "./data/case-01.json" with { type: "json" };
import { toPublicCase } from "./engine/caseView.js";
import { combineEvidence } from "./engine/combine.js";
import {
  allRooms,
  createRoom,
  getRoom,
  isValidRoomCode,
  normalizeRoomCode,
  roomCount,
  type Room,
} from "./engine/rooms.js";

const CASES: Record<string, CaseDefinition> = {
  "case-01": case01 as CaseDefinition,
};

function scoreAccusation(room: Room, accusation: Accusation): ScoreResult {
  const total = room.scenario.requiredEdgeIds.length;
  const matchedEdges = room.state.board.edges.filter(
    (e) => e.correct && room.scenario.requiredEdgeIds.includes(e.id)
  ).length;
  const correct =
    accusation.suspectId === room.scenario.suspectId &&
    accusation.weapon === room.scenario.weapon &&
    accusation.timeOfCrime === room.scenario.timeOfCrime;
  return {
    correct,
    accuracy: total === 0 ? 1 : Math.round((matchedEdges / total) * 100) / 100,
    evidenceMatched: matchedEdges,
    evidenceTotal: total,
  };
}

const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true, rooms: roomCount() }));

// Story #2 — Fall laden. Liefert den Fall ohne die Loesung (siehe engine/caseView.ts).
app.get("/api/cases/:caseId", (req, res) => {
  const caseDef = CASES[req.params.caseId];
  if (!caseDef) {
    return res.status(404).json({ error: "Fall nicht gefunden" });
  }
  return res.json(toPublicCase(caseDef));
});

// Story #5 — Team-Session anlegen. Der Code ist das, was im Team geteilt wird.
app.post("/api/rooms", (req, res) => {
  const caseId = typeof req.body?.caseId === "string" ? req.body.caseId : "case-01";
  const caseDef = CASES[caseId];
  if (!caseDef) {
    return res.status(404).json({ error: "Fall nicht gefunden" });
  }
  const room = createRoom(caseDef);
  return res.status(201).json({ code: room.state.code, caseId, caseTitle: caseDef.title });
});

// Story #13 — zwei Beweise kombinieren. Die Regeln bleiben auf dem Server:
// der Client schickt zwei IDs und bekommt die Erkenntnis oder eine Absage,
// nie die Liste der Moeglichkeiten.
app.post("/api/cases/:caseId/combine", (req, res) => {
  const caseDef = CASES[req.params.caseId];
  if (!caseDef) {
    return res.status(404).json({ error: "Fall nicht gefunden" });
  }
  const { evidenceIds, foundInsightIds } = req.body ?? {};
  if (!Array.isArray(evidenceIds) || evidenceIds.length !== 2) {
    return res.status(400).json({ ok: false, reason: "invalid" });
  }
  const found = Array.isArray(foundInsightIds) ? foundInsightIds.filter((x) => typeof x === "string") : [];
  return res.json(combineEvidence(caseDef, String(evidenceIds[0]), String(evidenceIds[1]), found));
});

// Story #5 — Team-Code pruefen. Falsches Format und unbekannter Code sind fuer
// den Spieler derselbe Fall: "Ungueltiger Team-Code".
app.get("/api/rooms/:code", (req, res) => {
  const code = normalizeRoomCode(req.params.code);
  if (!isValidRoomCode(code)) {
    return res.status(400).json({ error: "Ungueltiger Team-Code" });
  }
  const room = getRoom(code);
  if (!room) {
    return res.status(404).json({ error: "Ungueltiger Team-Code" });
  }
  return res.json({
    code: room.state.code,
    caseId: room.state.caseId,
    caseTitle: room.caseDef.title,
  });
});

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  socket.on("room:create", ({ caseId, playerName }, cb) => {
    const caseDef = CASES[caseId];
    if (!caseDef) return;
    const room = createRoom(caseDef);
    const code = room.state.code;
    room.state.players.push({ id: socket.id, name: playerName, role: null });
    socket.join(code);
    cb(code);
    io.to(code).emit("room:state", room.state);
  });

  socket.on("room:join", ({ code, playerName, role }) => {
    const room = getRoom(code);
    if (!room) {
      socket.emit("error:message", "Ungueltiger Team-Code");
      return;
    }
    if (room.state.players.some((p) => p.role === role)) {
      socket.emit("error:message", `Role "${role}" is already taken.`);
      return;
    }
    room.state.players.push({ id: socket.id, name: playerName, role });
    socket.join(code);
    io.to(code).emit("room:state", room.state);
  });

  socket.on("room:start", ({ code }) => {
    const room = getRoom(code);
    if (!room) return;
    room.state.started = true;
    io.to(code).emit("room:state", room.state);
    scheduleTimeline(room);
  });

  socket.on("board:addNode", ({ code, node }) => {
    const room = getRoom(code);
    if (!room) return;
    room.state.board.nodes.push(node);
    io.to(code).emit("board:update", room.state.board);
  });

  socket.on("board:moveNode", ({ code, nodeId, x, y }) => {
    const room = getRoom(code);
    if (!room) return;
    const node = room.state.board.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    node.x = x;
    node.y = y;
    io.to(code).emit("board:update", room.state.board);
  });

  socket.on("board:connect", ({ code, fromId, toId }) => {
    const room = getRoom(code);
    if (!room) return;
    const edgeId = `edge-${fromId}-${toId}`;
    const correct = room.scenario.requiredEdgeIds.includes(edgeId);
    room.state.board.edges.push({ id: edgeId, fromId, toId, correct });
    io.to(code).emit("board:update", room.state.board);
  });

  socket.on("case:accuse", ({ code, accusation }, cb) => {
    const room = getRoom(code);
    if (!room) return;
    cb(scoreAccusation(room, accusation));
  });

  socket.on("disconnect", () => {
    for (const room of allRooms()) {
      room.state.players = room.state.players.filter((p) => p.id !== socket.id);
    }
  });
});

function scheduleTimeline(room: Room) {
  for (const event of room.caseDef.timeline) {
    setTimeout(() => {
      const targets = room.state.players.filter((p) =>
        (event.visibleTo as Role[]).includes(p.role as Role)
      );
      for (const target of targets) {
        io.to(target.id).emit("event:new", event);
      }
    }, event.atSeconds * 1000);
  }
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
httpServer.listen(PORT, () => {
  console.log(`CASE//ZERO server listening on :${PORT}`);
});
