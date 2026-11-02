import { customAlphabet } from "nanoid";
import type {
  AccusationReceipt,
  CaseDefinition,
  RoomState,
  SharedFinding,
  TeamDiscovery,
  ActivityEntry,
  TeamChatMessage,
  TeamTask,
} from "@case-zero/shared";

/**
 * In-Memory Room Store (Story #5).
 *
 * Entscheidung zur offenen Frage im Issue ("Wie wird eine Session
 * serverseitig gehalten?"): im Server-Prozess, ohne Datenbank — so steht es
 * in CLAUDE.md für die MVP-Phase. Konsequenz, die das Team kennen muss:
 * ein Server-Neustart verwirft alle laufenden Sessions.
 */
export interface Room {
  state: RoomState;
  caseDef: CaseDefinition;
  scenario: CaseDefinition["scenarios"][number];
  /** Mit dem Team geteilte Funde (#23), in der Reihenfolge des Teilens. */
  findings: SharedFinding[];
  /** Live gemeldete Funde (#75), pro Beweis nur der erste Fund. */
  discoveries: TeamDiscovery[];
  /** Aktivitätsprotokoll des Teams (#76), der älteste Eintrag zuerst. */
  activity: ActivityEntry[];
  /** Die abgesendete Anklage des Teams (#27). Fehlt, solange niemand abgesendet hat. */
  accusation?: AccusationReceipt;
  /** Teamleiter (#48) — der erste Spieler, der dem Team beitritt. */
  leaderId?: string;
  /** Server-Konten, die während der Session im Team waren (#77). */
  accountIds: Set<string>;
  /** Verlauf des Team-Chats (#49), die älteste Nachricht zuerst. */
  chat?: TeamChatMessage[];
  /** Gemeinsame Aufgabenliste (#50). */
  tasks?: TeamTask[];
  /** Wann die Session angelegt wurde — für den Tempobonus (#54). */
  createdAt: Date;
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
  // Bei 32^6 Kombinationen praktisch nie nötig, aber billiger als ein
  // überschriebener Raum mit fremden Spielern darin.
  while (rooms.has(code)) {
    code = `${nanoid()}-${nanoid()}`;
  }

  const room: Room = {
    createdAt: new Date(),
    caseDef,
    scenario: pickScenario(caseDef),
    findings: [],
    discoveries: [],
    activity: [],
    accountIds: new Set(),
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
