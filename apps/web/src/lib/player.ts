import type { Role } from "@case-zero/shared";
import type { Account } from "./account";
import type { ProgressStorage } from "./caseProgress";

/** Wer im Team auftritt: mit Konto (#29) dessen ID und Name, sonst als Gast. */
export interface PlayerIdentity {
  id: string;
  name: string;
}

const GUEST_KEY = "case-zero:guest-id";

/**
 * Die Identitaet fuer Team-Funktionen (#31).
 *
 * Gaeste bekommen eine zufaellige ID, die im Browser bleibt — sonst waere man
 * nach jedem Neuladen eine neue Person im Team.
 */
export function playerIdentity(
  storage: ProgressStorage,
  account: Account | null,
  random: () => string = () => Math.random().toString(36).slice(2, 8)
): PlayerIdentity {
  if (account) return { id: account.id, name: account.name };
  let guestId: string | null = null;
  try {
    guestId = storage.getItem(GUEST_KEY);
  } catch {
    // Kein Storage: dann eben eine ID nur fuer diesen Besuch.
  }
  if (!guestId) {
    guestId = `gast-${random()}`;
    try {
      storage.setItem(GUEST_KEY, guestId);
    } catch {
      // Siehe oben.
    }
  }
  return { id: guestId, name: `Gast ${guestId.slice(5, 9).toUpperCase()}` };
}

/** Die Rollen aus README Abschnitt 1, so wie sie im UI heissen. */
export const ROLE_LABEL: Record<Role, string> = {
  forensics: "Forensiker",
  cyber: "Cyber Investigator",
  interrogation: "Verhoer-Spezialist",
  field: "Field Detective",
  lead: "Lead Detective",
};

/** Kurz, was die Rolle exklusiv sieht (README Abschnitt 1). */
export const ROLE_FOCUS: Record<Role, string> = {
  forensics: "DNA, Fingerabdruecke, Autopsie",
  cyber: "Handys, Chats, Dateien, Metadaten",
  interrogation: "Verdaechtige befragen",
  field: "Orte, CCTV, Zeugenaussagen",
  lead: "Timeline und Evidence Board",
};
