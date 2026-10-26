import type { DeviceFile } from "@case-zero/shared";

/**
 * Story #20 — wie sich eine Datei oeffnen laesst.
 *
 * Verlaesst sich nicht blind auf `type`: eine "text"-Datei ohne Inhalt oder
 * ein "image" ohne Pfad waere im Client eine leere Box. Beides gilt deshalb
 * als nicht lesbar und bekommt einen Hinweis — so fuehrt ein Tippfehler im
 * Case-JSON zu einer verstaendlichen Meldung statt zu einem leeren Fenster.
 */
export type OpenedFile =
  | { kind: "text"; content: string }
  | { kind: "image"; imagePath: string; caption?: string }
  | { kind: "unreadable"; reason: string };

const DEFAULT_REASON = "Die Datei ist beschaedigt oder hat ein unbekanntes Format.";

export function openFile(file: DeviceFile): OpenedFile {
  if (file.type === "text" && file.content) {
    return { kind: "text", content: file.content };
  }
  if (file.type === "image" && file.imagePath) {
    return { kind: "image", imagePath: file.imagePath, caption: file.caption };
  }
  return { kind: "unreadable", reason: file.unreadableReason ?? DEFAULT_REASON };
}

/** Kurzbezeichnung fuer die Dateiliste. */
export const FILE_TYPE_LABEL: Record<DeviceFile["type"], string> = {
  text: "Text",
  image: "Bild",
  unreadable: "Nicht lesbar",
};
