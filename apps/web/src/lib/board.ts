import type { CollectedEvidence, Insight } from "@case-zero/shared";
import type { ProgressStorage } from "./caseProgress";

/** Ein Faden zwischen zwei Beweisen (#65). */
export interface Thread {
  a: string;
  b: string;
  /** "insight" = vom Server bestätigte Verknüpfung (#13), "own" = eigene Vermutung. */
  kind: "insight" | "own";
  label?: string;
}

/** Was die Tafel speichert: welche Paare welche Erkenntnis ergaben, und eigene Fäden. */
export interface BoardState {
  /** Erkenntnis-ID -> die zwei Beweise, aus denen sie entstand. */
  insightPairs: Record<string, [string, string]>;
  own: [string, string][];
}

export const EMPTY_BOARD: BoardState = { insightPairs: {}, own: [] };

function storageKey(roomCode: string): string {
  return `case-zero:board:${roomCode}`;
}

const isPair = (v: unknown): v is [string, string] =>
  Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === "string");

export function loadBoard(storage: ProgressStorage, roomCode: string): BoardState {
  try {
    const parsed = JSON.parse(storage.getItem(storageKey(roomCode)) ?? "null") as Partial<BoardState> | null;
    if (!parsed || typeof parsed !== "object") return EMPTY_BOARD;
    const insightPairs: BoardState["insightPairs"] = {};
    for (const [id, pair] of Object.entries(parsed.insightPairs ?? {})) if (isPair(pair)) insightPairs[id] = pair;
    return { insightPairs, own: Array.isArray(parsed.own) ? parsed.own.filter(isPair) : [] };
  } catch {
    return EMPTY_BOARD;
  }
}

export function saveBoard(storage: ProgressStorage, roomCode: string, board: BoardState): void {
  try {
    storage.setItem(storageKey(roomCode), JSON.stringify(board));
  } catch {
    // Gesperrter Storage: dann gilt die Tafel nur bis zum Neuladen.
  }
}

const samePair = (p: [string, string], a: string, b: string) =>
  (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a);

/** Spannt einen eigenen Faden oder nimmt ihn wieder ab. */
export function toggleOwnThread(board: BoardState, a: string, b: string): BoardState {
  if (a === b) return board;
  const exists = board.own.some((p) => samePair(p, a, b));
  return { ...board, own: exists ? board.own.filter((p) => !samePair(p, a, b)) : [...board.own, [a, b]] };
}

/** Merkt sich, aus welchem Paar eine Erkenntnis entstand (#13 -> #65). */
export function recordInsight(board: BoardState, insightId: string, a: string, b: string): BoardState {
  return { ...board, insightPairs: { ...board.insightPairs, [insightId]: [a, b] } };
}

/**
 * Alle Fäden, die auf der Tafel sichtbar sind — nur zwischen Beweisen, die
 * in der Akte liegen. Eine eigene Vermutung, die der Server inzwischen
 * bestätigt hat, erscheint nur einmal, als bestätigter Faden.
 */
export function threadsFor(board: BoardState, evidence: CollectedEvidence[], insights: Insight[]): Thread[] {
  const present = new Set(evidence.map((e) => e.id));
  const threads: Thread[] = [];
  for (const insight of insights) {
    const pair = board.insightPairs[insight.id];
    if (pair && present.has(pair[0]) && present.has(pair[1])) {
      threads.push({ a: pair[0], b: pair[1], kind: "insight", label: insight.title });
    }
  }
  for (const [a, b] of board.own) {
    if (!present.has(a) || !present.has(b)) continue;
    if (threads.some((t) => samePair([t.a, t.b], a, b))) continue;
    threads.push({ a, b, kind: "own" });
  }
  return threads;
}

/** Karten im Kreis um die Mitte, in Prozent der Tafel — stabil, solange die Akte gleich bleibt. */
export function layoutCards(evidence: CollectedEvidence[]): Record<string, { x: number; y: number }> {
  const result: Record<string, { x: number; y: number }> = {};
  const n = evidence.length;
  evidence.forEach((e, i) => {
    if (n === 1) {
      result[e.id] = { x: 50, y: 50 };
      return;
    }
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    result[e.id] = { x: 50 + 38 * Math.cos(angle), y: 50 + 36 * Math.sin(angle) };
  });
  return result;
}
