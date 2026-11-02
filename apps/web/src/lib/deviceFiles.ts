import type { DeviceFile } from "@case-zero/shared";

/**
 * Story #20 — wie sich eine Datei öffnen lässt.
 *
 * Verlässt sich nicht blind auf `type`: eine "text"-Datei ohne Inhalt oder
 * ein "image" ohne Pfad wäre im Client eine leere Box. Beides gilt deshalb
 * als nicht lesbar und bekommt einen Hinweis — so führt ein Tippfehler im
 * Case-JSON zu einer verständlichen Meldung statt zu einem leeren Fenster.
 */
export type OpenedFile =
  | { kind: "text"; content: string }
  | { kind: "image"; imagePath: string; caption?: string }
  | { kind: "unreadable"; reason: string };

const DEFAULT_REASON = "Die Datei ist beschädigt oder hat ein unbekanntes Format.";

export function openFile(file: DeviceFile): OpenedFile {
  if (file.type === "text" && file.content) {
    return { kind: "text", content: file.content };
  }
  if (file.type === "image" && file.imagePath) {
    return { kind: "image", imagePath: file.imagePath, caption: file.caption };
  }
  return { kind: "unreadable", reason: file.unreadableReason ?? DEFAULT_REASON };
}

/** Kurzbezeichnung für die Dateiliste. */
export const FILE_TYPE_LABEL: Record<DeviceFile["type"], string> = {
  text: "Text",
  image: "Bild",
  unreadable: "Nicht lesbar",
};
