import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { customAlphabet } from "nanoid";
import type {
  Accusation,
  CaseDefinition,
  ClientToServerEvents,
  RoomState,
  ScoreResult,
  ServerToClientEvents,
  Role,
} from "@case-zero/shared";
import case01 from "./data/case-01.json" with { type: "json" };

const CASES: Record<string, CaseDefinition> = {
  "case-01": case01 as CaseDefinition,
};

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 3);
const makeRoomCode = () => `${nanoid()}-${nanoid()}`;

interface Room {
  state: RoomState;
  caseDef: CaseDefinition;
  scenario: CaseDefinition["scenarios"][number];
}

const rooms = new Map<string, Room>();

function pickScenario(caseDef: CaseDefinition) {
  return caseDef.scenarios[Math.floor(Math.random() * caseDef.scenarios.length)];
}

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
app.get("/health", (_req, res) => res.json({ ok: true, rooms: rooms.size }));

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  socket.on("room:create", ({ caseId, playerName }, cb) => {
    const caseDef = CASES[caseId];
    if (!caseDef) return;
    const code = makeRoomCode();
    const room: Room = {
      caseDef,
      scenario: pickScenario(caseDef),
      state: {
        code,
        caseId,
        started: false,
        players: [{ id: socket.id, name: playerName, role: null }],
        board: { nodes: caseDef.seedEvidence, edges: [] },
      },
    };
    rooms.set(code, room);
    socket.join(code);
    cb(code);
    io.to(code).emit("room:state", room.state);
  });

  socket.on("room:join", ({ code, playerName, role }) => {
    const room = rooms.get(code);
    if (!room) {
      socket.emit("error:message", "Case code not found.");
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
    const room = rooms.get(code);
    if (!room) return;
    room.state.started = true;
    io.to(code).emit("room:state", room.state);
    scheduleTimeline(code, room);
  });

  socket.on("board:addNode", ({ code, node }) => {
    const room = rooms.get(code);
    if (!room) return;
    room.state.board.nodes.push(node);
    io.to(code).emit("board:update", room.state.board);
  });

  socket.on("board:moveNode", ({ code, nodeId, x, y }) => {
    const room = rooms.get(code);
    if (!room) return;
    const node = room.state.board.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    node.x = x;
    node.y = y;
    io.to(code).emit("board:update", room.state.board);
  });

  socket.on("board:connect", ({ code, fromId, toId }) => {
    const room = rooms.get(code);
    if (!room) return;
    const edgeId = `edge-${fromId}-${toId}`;
    const correct = room.scenario.requiredEdgeIds.includes(edgeId);
    room.state.board.edges.push({ id: edgeId, fromId, toId, correct });
    io.to(code).emit("board:update", room.state.board);
  });

  socket.on("case:accuse", ({ code, accusation }, cb) => {
    const room = rooms.get(code);
    if (!room) return;
    cb(scoreAccusation(room, accusation));
  });

  socket.on("disconnect", () => {
    for (const room of rooms.values()) {
      room.state.players = room.state.players.filter((p) => p.id !== socket.id);
    }
  });
});

function scheduleTimeline(code: string, room: Room) {
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
