import type {
  AccusationSubmission,
  CaseSummary,
  CombineResult,
  Difficulty,
  HintState,
  LeaderboardEntry,
  PublicCase,
  RecoverResult,
  SubmitAccusationResult,
  UnlockResult,
} from "@case-zero/shared";

/** Antwort auf Konto erstellen/anmelden (#55). */
export type AccountResponse =
  | { ok: true; token: string; account: { id: string; name: string } }
  | { ok: false; error: string };

export const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4000";

/**
 * Lädt einen Fall vom Server (Story #2).
 *
 * Wirft bei jedem Fehlschlag — Netzwerk, 404, kaputtes JSON. Die Seite
 * unterscheidet die Ursachen nicht: für den Spieler ist jeder Fall derselbe
 * ("Fall konnte nicht geladen werden" + "Erneut versuchen").
 */
export async function fetchCase(caseId: string): Promise<PublicCase> {
  const response = await fetch(`${SERVER_URL}/api/cases/${caseId}`);
  if (!response.ok) {
    throw new Error(`Fall ${caseId} konnte nicht geladen werden (HTTP ${response.status})`);
  }
  return (await response.json()) as PublicCase;
}

/** Alle Fälle für die Auswahl (#30). Wirft, wenn der Server nicht antwortet. */
export async function fetchCaseList(): Promise<CaseSummary[]> {
  const response = await fetch(`${SERVER_URL}/api/cases`);
  if (!response.ok) {
    throw new Error(`Fallliste konnte nicht geladen werden (HTTP ${response.status})`);
  }
  return (await response.json()) as CaseSummary[];
}

export interface RoomSummary {
  code: string;
  caseId: string;
  caseTitle: string;
  /** Schwierigkeitsstufe der Session (#56). Fehlt bei älteren Servern. */
  difficulty?: Difficulty;
}

/** Code-Format aus CLAUDE.md, gespiegelt vom Server (engine/rooms.ts). */
export const ROOM_CODE_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;

export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_PATTERN.test(code);
}

/** Legt eine neue Team-Session an und gibt den teilbaren Code zurück (#5). */
export async function createRoom(caseId: string, difficulty?: Difficulty): Promise<RoomSummary> {
  const response = await fetch(`${SERVER_URL}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseId, difficulty }),
  });
  if (!response.ok) {
    throw new Error(`Team-Session konnte nicht angelegt werden (HTTP ${response.status})`);
  }
  return (await response.json()) as RoomSummary;
}

/**
 * Prüft einen Team-Code (#5).
 *
 * `null` heisst "ungültiger Code" — falsches Format und unbekannter Code
 * sehen für den Spieler gleich aus. Ein `throw` heisst dagegen, dass der
 * Server nicht erreichbar war; das ist ein anderer Fehler und darf nicht
 * als "Ungültiger Team-Code" durchgehen.
 */
export async function findRoom(code: string): Promise<RoomSummary | null> {
  const normalized = normalizeRoomCode(code);
  if (!isValidRoomCode(normalized)) return null;

  const response = await fetch(`${SERVER_URL}/api/rooms/${normalized}`);
  if (response.status === 400 || response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Team-Code konnte nicht geprüft werden (HTTP ${response.status})`);
  }
  return (await response.json()) as RoomSummary;
}

/**
 * Kombiniert zwei Beweise (#13).
 *
 * Die Prüfung passiert auf dem Server — die Kombinationsliste ist Teil der
 * Lösung und wird dem Client nie ausgeliefert.
 */
export async function combineEvidence(
  caseId: string,
  evidenceIds: [string, string],
  foundInsightIds: string[]
): Promise<CombineResult> {
  const response = await fetch(`${SERVER_URL}/api/cases/${caseId}/combine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evidenceIds, foundInsightIds }),
  });
  if (!response.ok && response.status !== 400) {
    throw new Error(`Kombination fehlgeschlagen (HTTP ${response.status})`);
  }
  return (await response.json()) as CombineResult;
}

/**
 * Sendet die Anklage der Team-Session ab (#27).
 *
 * "Schon abgesendet" und "ungültig" sind Antworten, keine Fehler — sie kommen
 * als Ergebnis zurück. Geworfen wird nur, wenn der Server nicht antwortet.
 */
export async function submitAccusation(
  code: string,
  submission: AccusationSubmission
): Promise<SubmitAccusationResult> {
  const response = await fetch(`${SERVER_URL}/api/rooms/${normalizeRoomCode(code)}/accusation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });
  if (![201, 400, 409].includes(response.status)) {
    throw new Error(`Anklage konnte nicht abgesendet werden (HTTP ${response.status})`);
  }
  return (await response.json()) as SubmitAccusationResult;
}

/** Die besten Ergebnisse serverseitiger Konten (#77). */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${SERVER_URL}/api/leaderboard`);
  if (!response.ok) throw new Error(`Rangliste nicht verfügbar (HTTP ${response.status})`);
  return (await response.json()) as LeaderboardEntry[];
}

/** Konto erstellen (#55) oder anmelden. Fehler wie "Name vergeben" kommen als Ergebnis. */
export async function accountRequest(
  mode: "register" | "login",
  name: string,
  password: string
): Promise<AccountResponse> {
  const response = await fetch(`${SERVER_URL}/api/accounts${mode === "login" ? "/login" : ""}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password }),
  });
  if (![200, 201, 400, 401].includes(response.status)) {
    throw new Error(`Konto-Anfrage fehlgeschlagen (HTTP ${response.status})`);
  }
  return (await response.json()) as AccountResponse;
}

/** Gespeicherter Spielstand eines Kontos (#55). `null`: noch keiner für diesen Code. */
export async function fetchAccountProgress(token: string, code: string): Promise<string | null> {
  const response = await fetch(`${SERVER_URL}/api/accounts/me/progress/${normalizeRoomCode(code)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Spielstand nicht verfügbar (HTTP ${response.status})`);
  return ((await response.json()) as { progress: string | null }).progress;
}

export async function saveAccountProgress(token: string, code: string, progress: string): Promise<void> {
  const response = await fetch(`${SERVER_URL}/api/accounts/me/progress/${normalizeRoomCode(code)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ progress }),
  });
  if (!response.ok) throw new Error(`Spielstand nicht gespeichert (HTTP ${response.status})`);
}

/** Freigegebene Hinweise der Team-Session (#74). */
export async function fetchHints(code: string): Promise<HintState> {
  const response = await fetch(`${SERVER_URL}/api/rooms/${normalizeRoomCode(code)}/hints`);
  if (!response.ok) throw new Error(`Hinweise nicht verfügbar (HTTP ${response.status})`);
  return (await response.json()) as HintState;
}

/** Gibt den nächsten Hinweis für das Team frei (#74). 409 heisst: keine mehr. */
export async function requestHint(code: string): Promise<{ ok: boolean; state: HintState }> {
  const response = await fetch(`${SERVER_URL}/api/rooms/${normalizeRoomCode(code)}/hints`, { method: "POST" });
  if (response.status !== 201 && response.status !== 409) {
    throw new Error(`Hinweis konnte nicht angefordert werden (HTTP ${response.status})`);
  }
  return { ok: response.status === 201, state: (await response.json()) as HintState };
}

/** Stellt die gelöschten Nachrichten eines Geräts wieder her (#71). Wirft nur ohne Server. */
export async function recoverDeleted(caseId: string, deviceId: string): Promise<RecoverResult> {
  const response = await fetch(`${SERVER_URL}/api/cases/${caseId}/devices/${deviceId}/recover`, {
    method: "POST",
  });
  if (![200, 400, 404].includes(response.status)) {
    throw new Error(`Wiederherstellen fehlgeschlagen (HTTP ${response.status})`);
  }
  return (await response.json()) as RecoverResult;
}

/**
 * Versucht, ein gesperrtes Gerät zu entsperren (#70).
 *
 * Die Prüfung passiert auf dem Server — PIN und Passwort kennt der Browser
 * nie. "Falsche PIN" ist eine Antwort, kein Fehler; geworfen wird nur, wenn
 * der Server nicht erreichbar ist.
 */
export async function unlockDevice(
  caseId: string,
  deviceId: string,
  secret: string
): Promise<UnlockResult> {
  const response = await fetch(`${SERVER_URL}/api/cases/${caseId}/devices/${deviceId}/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret }),
  });
  if (![200, 400, 404].includes(response.status)) {
    throw new Error(`Entsperren fehlgeschlagen (HTTP ${response.status})`);
  }
  return (await response.json()) as UnlockResult;
}
