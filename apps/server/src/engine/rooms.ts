import { customAlphabet } from "nanoid";
import type { CaseDefinition, RoomState } from "@case-zero/shared";

/**
 * In-Memory Room Store (Story #5).
 *
 * Entscheidung zur offenen Frage im Issue ("Wie wird eine Session
 * serverseitig gehalten?"): im Server-Prozess, ohne Datenbank — so steht es
 * in CLAUDE.md fuer die MVP-Phase. Konsequenz, die das Team kennen muss:
 * ein Server-Neustart verwirft alle laufenden Sessions.
 */
export interface Room {
  state: RoomState;
  caseDef: CaseDefinition;
  scenario: CaseDefinition["scenarios"][number];
}

/** Ohne I, O, 0 und 1 — die verwechselt man beim Vorlesen im Team. */
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 3);

/** Code-Format aus CLAUDE.md: drei alphanumerische Zeichen, Bindestrich, drei. */
export const ROOM_CODE_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;

export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_PATTERN.test(code);
}

/** Vereinheitlicht Eingaben: Kleinbuchstaben und Randleerzeichen. */
export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase();
}

const rooms = new Map<string, Room>();

function pickScenario(caseDef: CaseDefinition) {
  return caseDef.scenarios[Math.floor(Math.random() * caseDef.scenarios.length)];
}

export function createRoom(caseDef: CaseDefinition): Room {
  let code = `${nanoid()}-${nanoid()}`;
  // Bei 32^6 Kombinationen praktisch nie noetig, aber billiger als ein
  // ueberschriebener Raum mit fremden Spielern darin.
  while (rooms.has(code)) {
    code = `${nanoid()}-${nanoid()}`;
  }

  const room: Room = {
    caseDef,
    scenario: pickScenario(caseDef),
    state: {
      code,
      caseId: caseDef.id,
      started: false,
      players: [],
      board: { nodes: [...caseDef.seedEvidence], edges: [] },
    },
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(normalizeRoomCode(code));
}

export function roomCount(): number {
  return rooms.size;
}

export function allRooms(): Iterable<Room> {
  return rooms.values();
}
