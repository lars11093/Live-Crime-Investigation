import type { Difficulty } from "@case-zero/shared";

/** Was die Stufen bedeuten (#56) — steht so auch bei der Auswahl. */
export const DIFFICULTY_INFO: Record<Difficulty, { label: string; text: string }> = {
  leicht: {
    label: "Leicht",
    text: "Stellen mit einem Fund sind im Tatort markiert. Gut für den ersten Fall.",
  },
  normal: {
    label: "Normal",
    text: "Alle Stellen sind beschriftet, Funde muss man selbst entdecken.",
  },
  schwer: {
    label: "Schwer",
    text: "Stellen zeigen ihren Namen erst beim Darüberfahren, und der Tatort verrät nicht, wie viele Stellen es gibt.",
  },
};

/** Fortschritt im Tatort, je nach Stufe mit oder ohne Gesamtzahl. */
export function sceneProgressText(difficulty: Difficulty, investigated: number, total: number): string {
  return difficulty === "schwer" ? `${investigated} untersucht` : `${investigated} / ${total} untersucht`;
}
