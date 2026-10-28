import type { ProgressStorage } from "./caseProgress";

/**
 * Ein Ermittler-Konto (Story #29).
 *
 * Bewusst ohne Server und Passwort: CLAUDE.md sieht fuer die MVP-Phase keine
 * Datenbank vor, und "Konto erstellen" mit dauerhafter Speicherung ist eine
 * eigene Story (#55). Das Konto ordnet den Fortschritt einem Namen zu — wer
 * sich mit demselben Namen wieder anmeldet, findet seinen Stand wieder.
 */
export interface Account {
  /** Aus dem Namen abgeleitet, damit derselbe Name dasselbe Konto ist. */
  id: string;
  name: string;
}

export const NAME_MIN = 2;
export const NAME_MAX = 24;

const ACCOUNT_KEY = "case-zero:account";

/** Kleinbuchstaben, Umlaute ausgeschrieben, alles andere wird zu "-". */
export function accountIdFor(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Leer heisst gueltig; sonst der Grund, warum der Name nicht geht. */
export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < NAME_MIN) return `Der Name braucht mindestens ${NAME_MIN} Zeichen.`;
  if (trimmed.length > NAME_MAX) return `Der Name darf hoechstens ${NAME_MAX} Zeichen haben.`;
  if (!accountIdFor(trimmed)) return "Der Name braucht mindestens einen Buchstaben oder eine Ziffer.";
  return null;
}

export function loadAccount(storage: ProgressStorage): Account | null {
  try {
    const raw = storage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Account>;
    if (typeof parsed.name !== "string" || validateName(parsed.name)) return null;
    return { id: accountIdFor(parsed.name), name: parsed.name.trim() };
  } catch {
    return null;
  }
}

/** Meldet an. Wirft nicht — ein ungueltiger Name kommt als `null` zurueck. */
export function login(storage: ProgressStorage, name: string): Account | null {
  if (validateName(name)) return null;
  const account: Account = { id: accountIdFor(name), name: name.trim() };
  try {
    storage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    // Ohne Storage gilt die Anmeldung nur bis zum Neuladen.
  }
  return account;
}

export function logout(storage: ProgressStorage): void {
  try {
    storage.setItem(ACCOUNT_KEY, "");
  } catch {
    // Nichts zu tun.
  }
}
