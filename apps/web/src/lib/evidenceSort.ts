import type { CollectedEvidence } from "@case-zero/shared";
import { KIND_LABEL } from "../components/evidenceKind";

/** Wie die Akte geordnet ist (#37). */
export type EvidenceSort = "found-asc" | "found-desc" | "kind" | "name";

export const SORT_LABEL: Record<EvidenceSort, string> = {
  "found-asc": "Fundzeit (aelteste zuerst)",
  "found-desc": "Fundzeit (neueste zuerst)",
  kind: "Art",
  name: "Name (A–Z)",
};

/**
 * Sortiert die Akte (Story #37), ohne die gespeicherte Reihenfolge anzufassen.
 *
 * Die Akte liegt bereits in Fundreihenfolge vor — `collectEvidence` haengt
 * hinten an. Fuer "Fundzeit" ist das die Grundlage, nicht `collectedAt`:
 * Funde aus der Zeit vor #37 haben keinen Zeitstempel und wuerden sonst
 * irgendwo landen. Bei gleicher Art bzw. gleichem Namen bleibt die
 * Fundreihenfolge erhalten.
 */
export function sortEvidence(list: CollectedEvidence[], sort: EvidenceSort): CollectedEvidence[] {
  const indexed = list.map((item, index) => ({ item, index }));
  const byFound = (a: { index: number }, b: { index: number }) => a.index - b.index;
  const compare = (a: string, b: string) => a.localeCompare(b, "de", { sensitivity: "base" });

  switch (sort) {
    case "found-asc":
      return [...list];
    case "found-desc":
      return [...list].reverse();
    case "kind":
      return indexed
        .sort((a, b) => compare(KIND_LABEL[a.item.kind], KIND_LABEL[b.item.kind]) || byFound(a, b))
        .map(({ item }) => item);
    case "name":
      return indexed
        .sort((a, b) => compare(a.item.label, b.item.label) || byFound(a, b))
        .map(({ item }) => item);
  }
}

/** Uhrzeit der Sicherung fuer die Liste, z. B. "21:47". Leer ohne Zeitstempel. */
export function formatCollectedAt(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}
