import { describe, expect, it } from "vitest";
import type { DeviceFile } from "@case-zero/shared";
import { openFile } from "./deviceFiles";

const base = { id: "f", name: "datei", modifiedAt: "12.09. 21:58" };

describe("Datei oeffnen", () => {
  it("zeigt eine Textdatei als Text", () => {
    const file: DeviceFile = { ...base, type: "text", content: "Hallo" };
    expect(openFile(file)).toEqual({ kind: "text", content: "Hallo" });
  });

  it("zeigt ein Bild mit Beschreibung", () => {
    const file: DeviceFile = { ...base, type: "image", imagePath: "/a.jpg", caption: "Whiteboard" };
    expect(openFile(file)).toEqual({ kind: "image", imagePath: "/a.jpg", caption: "Whiteboard" });
  });

  it("nennt bei einer nicht lesbaren Datei den Grund", () => {
    const file: DeviceFile = { ...base, type: "unreadable", unreadableReason: "Verschluesselt" };
    expect(openFile(file)).toEqual({ kind: "unreadable", reason: "Verschluesselt" });
  });

  it("hat auch ohne Grund einen Hinweis", () => {
    const opened = openFile({ ...base, type: "unreadable" });
    expect(opened.kind).toBe("unreadable");
    expect(opened.kind === "unreadable" && opened.reason.length).toBeGreaterThan(0);
  });

  // Fehler im Case-JSON sollen nicht als leere Box enden.
  it("behandelt eine Textdatei ohne Inhalt als nicht lesbar", () => {
    expect(openFile({ ...base, type: "text" }).kind).toBe("unreadable");
  });

  it("behandelt ein Bild ohne Pfad als nicht lesbar", () => {
    expect(openFile({ ...base, type: "image" }).kind).toBe("unreadable");
  });
});
