import { useCallback, useEffect, useState } from "react";
import type { CollectedEvidence, Player, SharedFinding, ShareResult } from "@case-zero/shared";
import { socket } from "./socket";
import type { ProgressStorage } from "./caseProgress";

/** Gleiche Grenze wie auf dem Server (engine/team.ts). */
export const MAX_NAME_LENGTH = 24;

/**
 * Prueft einen Namen, bevor er an den Server geht (#22).
 * `null` heisst "in Ordnung". Der Server prueft trotzdem nochmal — das hier
 * spart nur den Umweg fuer die offensichtlichen Faelle.
 */
export function nameError(rawName: string): string | null {
  const name = rawName.trim();
  if (!name) return "Bitte gib einen Namen ein.";
  if (name.length > MAX_NAME_LENGTH) {
    return `Der Name darf hoechstens ${MAX_NAME_LENGTH} Zeichen haben.`;
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
      return "Dieser Fund gehoert nicht zum Fall.";
    case "invalid-room":
      return "Die Team-Session gibt es nicht mehr.";
  }
}

/**
 * Der eigene Name liegt im sessionStorage, pro Team-Code.
 *
 * sessionStorage statt localStorage, weil er pro Tab gilt: zwei Tabs im selben
 * Browser sind dann zwei Teammitglieder — so laesst sich #22 allein testen.
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
  const [myId, setMyId] = useState<string | undefined>(socket.id);
  const [error, setError] = useState<string | null>(null);
  // Mit dem Team geteilte Funde (#23), live vom Server.
  const [findings, setFindings] = useState<SharedFinding[]>([]);

  useEffect(() => {
    function onUpdate(list: Player[]) {
      setPlayers(list);
    }
    function onFindings(list: SharedFinding[]) {
      setFindings(list);
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
    socket.on("connect", join);
    if (socket.connected) join();
    return () => {
      socket.off("team:update", onUpdate);
      socket.off("team:findings", onFindings);
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

  return { name, players, myId, error, joinAs, findings, share };
}
