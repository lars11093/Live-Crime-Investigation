import { useCallback, useEffect, useState } from "react";
import type {
  CollectedEvidence,
  NoteShareResult,
  Player,
  Role,
  SharedFinding,
  SharedNote,
  TeamDiscovery,
  ActivityEntry,
  ShareResult,
  TeamJoinResult,
  TeamState,
} from "@case-zero/shared";
import { socket } from "./socket";
import type { ProgressStorage } from "./caseProgress";

/** Gleiche Grenze wie auf dem Server (engine/team.ts). */
export const MAX_NAME_LENGTH = 24;

/**
 * Prüft einen Namen, bevor er an den Server geht (#22).
 * `null` heisst "in Ordnung". Der Server prüft trotzdem nochmal — das hier
 * spart nur den Umweg für die offensichtlichen Fälle.
 */
export function nameError(rawName: string): string | null {
  const name = rawName.trim();
  if (!name) return "Bitte gib einen Namen ein.";
  if (name.length > MAX_NAME_LENGTH) {
    return `Der Name darf höchstens ${MAX_NAME_LENGTH} Zeichen haben.`;
  }
  return null;
}

/** Was der Spieler nach einem Teilen-Versuch liest (#23). */
export function shareMessage(result: ShareResult): string {
  if (result.ok) return "Mit dem Team geteilt.";
  switch (result.reason) {
    case "not-in-team":
      return "Tritt zuerst in der Fallakte dem Team bei.";
    case "already-shared":
      return "Diesen Fund hat schon jemand geteilt.";
    case "unknown-evidence":
      return "Dieser Fund gehört nicht zum Fall.";
    case "invalid-room":
      return "Die Team-Session gibt es nicht mehr.";
  }
}

/**
 * Der eigene Name liegt im sessionStorage, pro Team-Code.
 *
 * sessionStorage statt localStorage, weil er pro Tab gilt: zwei Tabs im selben
 * Browser sind dann zwei Teammitglieder — so lässt sich #22 allein testen.
 */
function nameKey(roomCode: string): string {
  return `case-zero:name:${roomCode}`;
}

export function loadName(storage: ProgressStorage, roomCode: string): string {
  try {
    return storage.getItem(nameKey(roomCode)) ?? "";
  } catch {
    return "";
  }
}

export function saveName(storage: ProgressStorage, roomCode: string, name: string): void {
  try {
    storage.setItem(nameKey(roomCode), name);
  } catch {
    // Gesperrter Storage: dann fragt die Seite nach einem Neuladen erneut.
  }
}

function sessionStore(): ProgressStorage {
  try {
    if (typeof sessionStorage !== "undefined") return sessionStorage;
  } catch {
    // Zugriff kann schon beim Lesen der Variable werfen.
  }
  return { getItem: () => null, setItem: () => {} };
}

/** Den Namen für eine Session vormerken, damit dort automatisch beigetreten wird (#57). */
export function rememberName(roomCode: string, name: string): void {
  saveName(sessionStore(), roomCode, name);
}

/**
 * Story #22 — das Team einer Session, live vom Server.
 *
 * Tritt bei, sobald ein Name da ist, und nach jedem Wiederverbinden erneut:
 * eine neue Verbindung hat eine neue ID, die alte hat der Server beim
 * Trennen schon aus der Liste genommen.
 */
export function useTeam(roomCode: string) {
  const [name, setName] = useState(() => loadName(sessionStore(), roomCode));
  const [players, setPlayers] = useState<Player[]>([]);
  // Wer das Team leitet (#48) — Socket-ID wie `myId`.
  const [leaderId, setLeaderId] = useState<string | null>(null);
  const [myId, setMyId] = useState<string | undefined>(socket.id);
  const [error, setError] = useState<string | null>(null);
  // Mit dem Team geteilte Funde (#23), live vom Server.
  const [findings, setFindings] = useState<SharedFinding[]>([]);
  // Live gemeldete Funde des Teams (#75).
  const [discoveries, setDiscoveries] = useState<TeamDiscovery[]>([]);
  // Aktivitätsprotokoll des Teams (#76).
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  // Mit dem Team geteilte Notizen (#64), live vom Server.
  const [notes, setNotes] = useState<SharedNote[]>([]);
  // Das Team ist in eine neue Session umgezogen (#57).
  const [movedTo, setMovedTo] = useState<{ code: string; by: string } | null>(null);

  useEffect(() => {
    function onUpdate(team: TeamState) {
      setPlayers(team.players);
      setLeaderId(team.leaderId);
    }
    function onFindings(list: SharedFinding[]) {
      setFindings(list);
    }
    function onActivity(list: ActivityEntry[]) {
      setActivity(list);
    }
    function onDiscoveries(list: TeamDiscovery[]) {
      setDiscoveries(list);
    }
    function onNotes(list: SharedNote[]) {
      setNotes(list);
    }

    function onMoved(target: { code: string; by: string }) {
      // Mit demselben Namen in der neuen Session weitermachen (#57).
      if (name) rememberName(target.code, name);
      setMovedTo(target);
    }
    function join() {
      if (!name) return;
      socket.emit("team:join", { code: roomCode, playerName: name }, (result) => {
        if (result.ok) {
          setError(null);
          setMyId(socket.id);
        } else {
          setError(result.error);
        }
      });
    }

    socket.on("team:update", onUpdate);
    socket.on("team:findings", onFindings);
    socket.on("team:discoveries", onDiscoveries);
    socket.on("team:activity", onActivity);
    socket.on("team:notes", onNotes);
    socket.on("team:moved", onMoved);
    socket.on("connect", join);
    if (socket.connected) join();
    return () => {
      socket.off("team:update", onUpdate);
      socket.off("team:findings", onFindings);
      socket.off("team:discoveries", onDiscoveries);
      socket.off("team:activity", onActivity);
      socket.off("team:notes", onNotes);
      socket.off("team:moved", onMoved);
      socket.off("connect", join);
    };
  }, [roomCode, name]);

  const joinAs = useCallback(
    (rawName: string) => {
      const problem = nameError(rawName);
      if (problem) {
        setError(problem);
        return;
      }
      const trimmed = rawName.trim();
      saveName(sessionStore(), roomCode, trimmed);
      setName(trimmed);
    },
    [roomCode]
  );

  /**
   * Teilt einen Fund (#23). Die Antwort kommt vom Server, die neue Liste per
   * `team:findings`. Mit Timeout: ohne Verbindung puffert Socket.IO das Event
   * sonst still, und der Button wartet ewig.
   */
  const share = useCallback(
    (evidence: CollectedEvidence) =>
      new Promise<ShareResult>((resolve, reject) => {
        socket
          .timeout(5000)
          .emit("evidence:share", { code: roomCode, evidence }, (err, result) =>
            err ? reject(err) : resolve(result)
          );
      }),
    [roomCode]
  );

  /**
   * Meldet einen eingesammelten Fund live ans Team (#75). Ohne Beitritt gibt es
   * kein Team, dann passiert nichts. Eine Ablehnung (z. B. schon gefunden) ist
   * kein Fehler — der erste Finder bleibt einfach stehen.
   */
  const reportFound = useCallback(
    (evidence: CollectedEvidence) => {
      if (!name) return;
      socket.emit("evidence:found", { code: roomCode, evidence }, () => {});
    },
    [roomCode, name]
  );

  /** Teilt eine Notiz (#64); die neue Liste kommt per `team:notes`. */
  const shareNote = useCallback(
    (evidence: CollectedEvidence, text: string) =>
      new Promise<NoteShareResult>((resolve, reject) => {
        socket
          .timeout(5000)
          .emit(
            "note:share",
            { code: roomCode, evidenceId: evidence.id, evidenceLabel: evidence.label, text },
            (err, result) => (err ? reject(err) : resolve(result))
          );
      }),
    [roomCode]
  );

  /**
   * Setzt eine Rolle: die eigene (#31) oder als Teamleitung die eines anderen
   * (#48). Die neue Liste kommt per `team:update`.
   */
  const chooseRole = useCallback(
    (role: Role | null, playerId?: string) =>
      new Promise<TeamJoinResult>((resolve, reject) => {
        socket
          .timeout(5000)
          .emit("team:role", { code: roomCode, role, playerId }, (err, result) =>
            err ? reject(err) : resolve(result)
          );
      }),
    [roomCode]
  );

  /** Nimmt das Team in die neue Session mit (#57). */
  const moveTo = useCallback(
    (newCode: string) =>
      new Promise<TeamJoinResult>((resolve, reject) => {
        socket
          .timeout(5000)
          .emit("team:next", { code: roomCode, newCode }, (err, result) =>
            err ? reject(err) : resolve(result)
          );
      }),
    [roomCode]
  );

  return { name, players, leaderId, myId, error, joinAs, chooseRole, findings,
    discoveries,
    reportFound,
    activity, share, notes, shareNote, movedTo, moveTo };
}
