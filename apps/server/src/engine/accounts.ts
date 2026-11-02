import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { AccusationScore, LeaderboardEntry } from "@case-zero/shared";

export const NAME_MIN = 2;
export const NAME_MAX = 24;
export const PASSWORD_MIN = 6;
/** Ein Spielstand ist JSON aus dem Browser; unter dem 100-KB-Limit von express.json(). */
export const PROGRESS_MAX_BYTES = 90_000;

interface StoredAccount {
  id: string;
  name: string;
  salt: string;
  hash: string;
  /** Team-Code -> gespeicherter Fortschritt (JSON-Text aus dem Browser). */
  progress: Record<string, string>;
  /** Bestes Ergebnis je Fall. Ältere Kontodateien haben dieses Feld nicht. */
  scores?: StoredScore[];
}

interface StoredScore {
  roomCode: string;
  caseId: string;
  caseTitle: string;
  points: number;
  maxPoints: number;
  scoreRank: string;
  achievedAt: string;
}

export type AccountResult =
  | { ok: true; token: string; account: { id: string; name: string } }
  | { ok: false; error: string };

/** Gleiche Regel wie im Client (web/src/lib/account.ts): derselbe Name ist dasselbe Konto. */
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

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 32).toString("hex");
}

/**
 * Story #55 — Konten, die einen Browserwechsel überleben.
 *
 * Passwörter liegen nur als scrypt-Hash mit Salt vor. Angemeldet wird über
 * ein zufälliges Token (im Speicher, nicht in der Datei), danach lässt sich
 * pro Team-Code ein Spielstand ablegen und von jedem Gerät wieder holen.
 *
 * Gespeichert wird in einer JSON-Datei, wenn ein Pfad gesetzt ist. Das ist
 * bewusst keine Datenbank (CLAUDE.md, MVP), reicht aber, damit Konten einen
 * Server-Neustart überleben. Ohne Pfad (Tests) bleibt alles im Speicher.
 */
export class AccountStore {
  private accounts = new Map<string, StoredAccount>();
  private tokens = new Map<string, string>();

  constructor(private readonly file?: string) {
    if (file && existsSync(file)) {
      try {
        const list = JSON.parse(readFileSync(file, "utf-8")) as StoredAccount[];
        for (const account of list) this.accounts.set(account.id, account);
      } catch {
        // Kaputte Datei: lieber leer starten als den Server nicht hochzufahren.
      }
    }
  }

  private persist(): void {
    if (!this.file) return;
    mkdirSync(dirname(this.file), { recursive: true });
    writeFileSync(this.file, JSON.stringify([...this.accounts.values()], null, 2));
  }

  private issueToken(account: StoredAccount): AccountResult {
    const token = randomBytes(24).toString("hex");
    this.tokens.set(token, account.id);
    return { ok: true, token, account: { id: account.id, name: account.name } };
  }

  register(rawName: unknown, password: unknown): AccountResult {
    const name = typeof rawName === "string" ? rawName.trim() : "";
    if (name.length < NAME_MIN || name.length > NAME_MAX || !accountIdFor(name)) {
      return { ok: false, error: `Der Name braucht ${NAME_MIN} bis ${NAME_MAX} Zeichen.` };
    }
    if (typeof password !== "string" || password.length < PASSWORD_MIN) {
      return { ok: false, error: `Das Passwort braucht mindestens ${PASSWORD_MIN} Zeichen.` };
    }
    const id = accountIdFor(name);
    if (this.accounts.has(id)) return { ok: false, error: "Dieser Name ist schon vergeben." };
    const salt = randomBytes(16).toString("hex");
    const account: StoredAccount = { id, name, salt, hash: hashPassword(password, salt), progress: {} };
    this.accounts.set(id, account);
    this.persist();
    return this.issueToken(account);
  }

  login(rawName: unknown, password: unknown): AccountResult {
    const account = typeof rawName === "string" ? this.accounts.get(accountIdFor(rawName)) : undefined;
    const fail: AccountResult = { ok: false, error: "Name oder Passwort falsch." };
    if (!account || typeof password !== "string") return fail;
    const expected = Buffer.from(account.hash, "hex");
    const actual = Buffer.from(hashPassword(password, account.salt), "hex");
    return timingSafeEqual(expected, actual) ? this.issueToken(account) : fail;
  }

  private byToken(token: string | undefined): StoredAccount | undefined {
    const id = token ? this.tokens.get(token) : undefined;
    return id ? this.accounts.get(id) : undefined;
  }

  identityForToken(token: string | undefined): { id: string; name: string } | undefined {
    const account = this.byToken(token);
    return account ? { id: account.id, name: account.name } : undefined;
  }

  /** `undefined` heisst: Token ungültig. `null`: noch kein Stand für diesen Code. */
  getProgress(token: string | undefined, roomCode: string): string | null | undefined {
    const account = this.byToken(token);
    if (!account) return undefined;
    return account.progress[roomCode] ?? null;
  }

  saveProgress(token: string | undefined, roomCode: string, progress: unknown): "ok" | "unauthorized" | "invalid" {
    const account = this.byToken(token);
    if (!account) return "unauthorized";
    if (typeof progress !== "string" || progress.length > PROGRESS_MAX_BYTES) return "invalid";
    try {
      JSON.parse(progress);
    } catch {
      return "invalid";
    }
    account.progress[roomCode] = progress;
    this.persist();
    return "ok";
  }

  /** Speichert ausschliesslich den serverseitig berechneten Score (#77). */
  recordScoreForAccount(
    accountId: string,
    roomCode: string,
    caseId: string,
    caseTitle: string,
    score: AccusationScore,
    achievedAt: string
  ): boolean {
    const account = this.accounts.get(accountId);
    if (!account) return false;

    const scores = account.scores ?? [];
    const previous = scores.find((entry) => entry.caseId === caseId);
    if (previous && previous.points >= score.points) return true;

    account.scores = [
      ...scores.filter((entry) => entry.caseId !== caseId),
      {
        roomCode,
        caseId,
        caseTitle,
        points: score.points,
        maxPoints: score.maxPoints,
        scoreRank: score.rank,
        achievedAt,
      },
    ];
    this.persist();
    return true;
  }

  /** Öffentliche Rangliste: pro Konto nur der persönliche Bestwert je Fall. */
  leaderboard(): LeaderboardEntry[] {
    return [...this.accounts.values()]
      .flatMap((account) =>
        (account.scores ?? []).map(({ caseId, caseTitle, points, maxPoints, scoreRank, achievedAt }) => ({
          playerName: account.name,
          caseId,
          caseTitle,
          points,
          maxPoints,
          scoreRank,
          achievedAt,
        }))
      )
      .sort(
        (a, b) =>
          b.points - a.points ||
          a.achievedAt.localeCompare(b.achievedAt) ||
          a.playerName.localeCompare(b.playerName, "de")
      )
      .slice(0, 100);
  }
}
