import { useCallback, useEffect, useState } from "react";
import type { Player } from "@case-zero/shared";
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

  useEffect(() => {
    function onUpdate(list: Player[]) {
      setPlayers(list);
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
    socket.on("connect", join);
    if (socket.connected) join();
    return () => {
      socket.off("team:update", onUpdate);
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

  return { name, players, myId, error, joinAs };
}
