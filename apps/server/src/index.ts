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
import { toCaseSummaries, toPublicCase } from "./engine/caseView.js";
import { combineEvidence } from "./engine/combine.js";
import { submitAccusation } from "./engine/accusation.js";
import { hintState, revealHint } from "./engine/hints.js";
import { unlockDevice } from "./engine/unlock.js";
import { recoverDeleted } from "./engine/recover.js";
import {
  allRooms,
  createRoom,
  getRoom,
  isValidRoomCode,
  normalizeRoomCode,
  roomCount,
  type Room,
} from "./engine/rooms.js";
import { chooseRole, joinTeam, leaveTeam, teamStateOf } from "./engine/team.js";
import { shareFinding } from "./engine/sharing.js";
import { AccountStore } from "./engine/accounts.js";
import { difficultyOf, parseDifficulty, setDifficulty } from "./engine/difficulty.js";
import { notesOf, shareNote } from "./engine/noteSharing.js";
import { canMoveTeam } from "./engine/teamMove.js";

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

// Story #55 — Konten. Die Datei liegt ausserhalb von src und ist in .gitignore.
const accounts = new AccountStore(process.env.ACCOUNTS_FILE ?? ".data/accounts.json");

function bearer(header: string | undefined): string | undefined {
  return header?.startsWith("Bearer ") ? header.slice(7) : undefined;
}

const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true, rooms: roomCount() }));

// Story #30 — Uebersicht der verfuegbaren Faelle. Ohne Loesung, wie ueberall.
app.get("/api/cases", (_req, res) => {
  res.json(toCaseSummaries(Object.values(CASES)));
});

// Story #2 — Fall laden. Liefert den Fall ohne die Loesung (siehe engine/caseView.ts).
app.get("/api/cases/:caseId", (req, res) => {
  const caseDef = CASES[req.params.caseId];
  if (!caseDef) {
    return res.status(404).json({ error: "Fall nicht gefunden" });
  }
  return res.json(toPublicCase(caseDef));
});

// Story #55 — Konto erstellen und anmelden.
app.post("/api/accounts", (req, res) => {
  const result = accounts.register(req.body?.name, req.body?.password);
  return res.status(result.ok ? 201 : 400).json(result);
});

app.post("/api/accounts/login", (req, res) => {
  const result = accounts.login(req.body?.name, req.body?.password);
  return res.status(result.ok ? 200 : 401).json(result);
});

// Story #55 — Spielstand eines Kontos pro Team-Code, von jedem Geraet aus.
app.get("/api/accounts/me/progress/:code", (req, res) => {
  const progress = accounts.getProgress(bearer(req.headers.authorization), normalizeRoomCode(req.params.code));
  if (progress === undefined) return res.status(401).json({ error: "Nicht angemeldet" });
  return res.json({ progress });
});

app.put("/api/accounts/me/progress/:code", (req, res) => {
  const result = accounts.saveProgress(
    bearer(req.headers.authorization),
    normalizeRoomCode(req.params.code),
    req.body?.progress
  );
  if (result === "unauthorized") return res.status(401).json({ error: "Nicht angemeldet" });
  if (result === "invalid") return res.status(400).json({ error: "Ungueltiger Spielstand" });
  return res.status(204).end();
});

// Story #5 — Team-Session anlegen. Der Code ist das, was im Team geteilt wird.
app.post("/api/rooms", (req, res) => {
  const caseId = typeof req.body?.caseId === "string" ? req.body.caseId : "case-01";
  const caseDef = CASES[caseId];
  if (!caseDef) {
    return res.status(404).json({ error: "Fall nicht gefunden" });
  }
  const room = createRoom(caseDef);
  // Story #56 — die Stufe gilt fuer die ganze Session, alle im Team spielen gleich.
  const difficulty = parseDifficulty(req.body?.difficulty);
  setDifficulty(room, difficulty);
  return res.status(201).json({ code: room.state.code, caseId, caseTitle: caseDef.title, difficulty });
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

// Story #71 — geloeschte Nachrichten eines Geraets wiederherstellen.
app.post("/api/cases/:caseId/devices/:deviceId/recover", (req, res) => {
  const caseDef = CASES[req.params.caseId];
  if (!caseDef) {
    return res.status(404).json({ error: "Fall nicht gefunden" });
  }
  const result = recoverDeleted(caseDef, req.params.deviceId);
  if (result.ok) return res.json(result);
  return res.status(result.reason === "unknown-device" ? 404 : 400).json(result);
});

// Story #70 — gesperrtes Geraet entsperren. PIN/Passwort bleiben auf dem
// Server; der Client bekommt den Inhalt nur bei richtigem Versuch.
app.post("/api/cases/:caseId/devices/:deviceId/unlock", (req, res) => {
  const caseDef = CASES[req.params.caseId];
  if (!caseDef) {
    return res.status(404).json({ error: "Fall nicht gefunden" });
  }
  const result = unlockDevice(caseDef, req.params.deviceId, req.body?.secret);
  if (result.ok) return res.json(result);
  return res.status(result.reason === "unknown-device" ? 404 : 400).json(result);
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
    difficulty: difficultyOf(room),
  });
});

// Story #74 — Hinweise der Team-Session lesen und den naechsten freigeben.
app.get("/api/rooms/:code/hints", (req, res) => {
  const room = getRoom(req.params.code);
  if (!room) return res.status(404).json({ error: "Ungueltiger Team-Code" });
  return res.json(hintState(room));
});

app.post("/api/rooms/:code/hints", (req, res) => {
  const room = getRoom(req.params.code);
  if (!room) return res.status(404).json({ error: "Ungueltiger Team-Code" });
  const result = revealHint(room);
  return res.status(result.ok ? 201 : 409).json(result.state);
});

// Story #27 — Anklage absenden. Einmal pro Team-Session; danach gesperrt.
app.post("/api/rooms/:code/accusation", (req, res) => {
  const room = getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ error: "Ungueltiger Team-Code" });
  }
  const result = submitAccusation(room, req.body);
  if (result.ok) return res.status(201).json(result);
  return res.status(result.reason === "already-submitted" ? 409 : 400).json(result);
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

  // Story #22 — Team beitreten. Die neue Liste geht an alle im Raum, damit
  // jede Teamliste ohne Neuladen aktuell ist.
  socket.on("team:join", ({ code, playerName }, cb) => {
    const room = getRoom(code);
    if (!room) {
      cb({ ok: false, error: "Ungueltiger Team-Code" });
      return;
    }
    const result = joinTeam(room, socket.id, String(playerName ?? ""));
    cb(result);
    if (!result.ok) return;
    socket.join(room.state.code);
    io.to(room.state.code).emit("team:update", teamStateOf(room));
    // Wer spaeter dazukommt, sieht trotzdem alles, was schon geteilt wurde (#23).
    socket.emit("team:findings", room.findings);
    socket.emit("team:notes", notesOf(room));
  });

  // Story #31 — eigene Rolle waehlen, #48 — als Teamleitung fuer andere.
  // Die neue Liste geht an alle im Raum.
  socket.on("team:role", ({ code, role, playerId }, cb) => {
    const room = getRoom(String(code ?? ""));
    if (!room) {
      cb({ ok: false, error: "Ungueltiger Team-Code" });
      return;
    }
    const target = typeof playerId === "string" ? playerId : socket.id;
    const result = chooseRole(room, socket.id, role, target);
    cb(result);
    if (result.ok) io.to(room.state.code).emit("team:update", teamStateOf(room));
  });

  // Story #64 — Notiz teilen. Gepruefte Notiz geht an alle im Raum.
  socket.on("note:share", ({ code, evidenceId, evidenceLabel, text }, cb) => {
    const room = getRoom(String(code ?? ""));
    if (!room) {
      cb({ ok: false, reason: "invalid-room" });
      return;
    }
    const result = shareNote(room, socket.id, { evidenceId, evidenceLabel, text });
    cb(result);
    if (result.ok) io.to(room.state.code).emit("team:notes", notesOf(room));
  });

  // Story #23 — Fund teilen. Gepruefter Fund geht an alle im Raum.
  socket.on("evidence:share", ({ code, evidence }, cb) => {
    const room = getRoom(code);
    if (!room) {
      cb({ ok: false, reason: "invalid-room" });
      return;
    }
    const result = shareFinding(room, socket.id, evidence);
    cb(result);
    if (result.ok) io.to(room.state.code).emit("team:findings", room.findings);
  });

  // Story #57 — das Team in den naechsten Fall mitnehmen. Alle im alten Raum
  // bekommen den neuen Code und treten dort mit ihrem Namen bei.
  socket.on("team:next", ({ code, newCode }, cb) => {
    const from = getRoom(String(code ?? ""));
    const to = getRoom(String(newCode ?? ""));
    const result = canMoveTeam(from, to, socket.id);
    if (!result.ok) {
      cb({ ok: false, error: result.error });
      return;
    }
    cb({ ok: true });
    io.to(from!.state.code).emit("team:moved", { code: to!.state.code, by: result.by });
  });

  socket.on("disconnect", () => {
    for (const room of allRooms()) {
      // Wer geht, verschwindet auch aus den Teamlisten der anderen (#22).
      if (leaveTeam(room, socket.id)) {
        io.to(room.state.code).emit("team:update", teamStateOf(room));
      }
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
