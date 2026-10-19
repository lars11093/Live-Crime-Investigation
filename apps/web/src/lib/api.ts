import type { PublicCase } from "@case-zero/shared";

export const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4000";

/**
 * Laedt einen Fall vom Server (Story #2).
 *
 * Wirft bei jedem Fehlschlag — Netzwerk, 404, kaputtes JSON. Die Seite
 * unterscheidet die Ursachen nicht: fuer den Spieler ist jeder Fall derselbe
 * ("Fall konnte nicht geladen werden" + "Erneut versuchen").
 */
export async function fetchCase(caseId: string): Promise<PublicCase> {
  const response = await fetch(`${SERVER_URL}/api/cases/${caseId}`);
  if (!response.ok) {
    throw new Error(`Fall ${caseId} konnte nicht geladen werden (HTTP ${response.status})`);
  }
  return (await response.json()) as PublicCase;
}
