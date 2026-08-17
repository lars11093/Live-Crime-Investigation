import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { ROLES, type Role, type RoomState, type TimedEvent } from "@case-zero/shared";
import { socket } from "./lib/socket";
import { EvidenceBoard } from "./components/EvidenceBoard";

function JoinPage() {
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

  function createCase() {
    if (!name) return;
    socket.emit("room:create", { caseId: "case-01", playerName: name }, (code) => {
      navigate(`/case/${code}`);
    });
  }

  function joinCase() {
    if (!name || !joinCode) return;
    navigate(`/case/${joinCode.toUpperCase()}?name=${encodeURIComponent(name)}`);
  }

  return (
    <div className="app-shell">
      <div className="terminal-title">CASE//ZERO</div>
      <div className="panel" style={{ display: "grid", gap: "1rem", maxWidth: 360 }}>
        <input placeholder="Investigator name" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={createCase}>Create Case</button>
        <hr style={{ borderColor: "var(--border)", width: "100%" }} />
        <input placeholder="Case code (e.g. 7K4-XP9)" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
        <button onClick={joinCase}>Join Case</button>
      </div>
    </div>
  );
}

function CasePage() {
  const { code = "" } = useParams();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [events, setEvents] = useState<TimedEvent[]>([]);

  useEffect(() => {
    function onState(state: RoomState) {
      setRoom(state);
      const me = state.players.find((p) => p.id === socket.id);
      if (me?.role) setRole(me.role);
    }
    function onBoard(board: RoomState["board"]) {
      setRoom((prev) => (prev ? { ...prev, board } : prev));
    }
    function onEvent(event: TimedEvent) {
      setEvents((prev) => [...prev, event]);
    }
    socket.on("room:state", onState);
    socket.on("board:update", onBoard);
    socket.on("event:new", onEvent);
    return () => {
      socket.off("room:state", onState);
      socket.off("board:update", onBoard);
      socket.off("event:new", onEvent);
    };
  }, []);

  function pickRole(r: Role) {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name") ?? "Investigator";
    socket.emit("room:join", { code, playerName: name, role: r });
    setRole(r);
  }

  if (!room) {
    return (
      <div className="app-shell">
        <div className="terminal-title">CASE//ZERO — {code}</div>
        <div className="panel">Connecting…</div>
      </div>
    );
  }

  if (!role) {
    const taken = new Set(room.players.map((p) => p.role).filter(Boolean));
    return (
      <div className="app-shell">
        <div className="terminal-title">SELECT ROLE — CASE {code}</div>
        <div className="panel" style={{ display: "grid", gap: "0.5rem" }}>
          {ROLES.map((r) => (
            <button key={r} disabled={taken.has(r)} onClick={() => pickRole(r)}>
              {r} {taken.has(r) ? "(taken)" : ""}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="terminal-title">
        CASE {code} <span className="role-badge">{role.toUpperCase()}</span>
      </div>

      {!room.started && role === "lead" && (
        <button onClick={() => socket.emit("room:start", { code })}>Start Case</button>
      )}

      <div style={{ marginTop: "1rem" }} className="panel">
        <strong>Players</strong>
        <ul>
          {room.players.map((p) => (
            <li key={p.id}>
              {p.name} — {p.role ?? "choosing…"}
            </li>
          ))}
        </ul>
      </div>

      {role === "lead" && (
        <div style={{ marginTop: "1rem" }}>
          <EvidenceBoard code={code} nodes={room.board.nodes} edges={room.board.edges} />
        </div>
      )}

      <div style={{ marginTop: "1rem" }} className="panel">
        <strong>Events</strong>
        {events.length === 0 && <div style={{ color: "var(--muted)" }}>No events yet.</div>}
        {events.map((e, i) => (
          <div key={i} style={{ marginTop: "0.5rem" }}>
            <div className="terminal-title">{e.title}</div>
            <div>{e.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<JoinPage />} />
      <Route path="/case/:code" element={<CasePage />} />
    </Routes>
  );
}
