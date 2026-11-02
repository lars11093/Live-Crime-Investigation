import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { joinTeam } from "./team.js";
import { notesOf, shareNote } from "./noteSharing.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;
const note = (text: string) => ({ evidenceId: "tasse-lippenstift", evidenceLabel: "Tasse", text });

describe("Notiz mit dem Team teilen (#64)", () => {
  it("teilt die Notiz mit Urheber und Zeitpunkt", () => {
    const room = createRoom(caseDef);
    joinTeam(room, "s1", "Loris");
    const at = new Date("2026-11-01T20:00:00Z");
    expect(shareNote(room, "s1", note("  Lippenstift = Monica? "), at)).toEqual({ ok: true });
    expect(notesOf(room)).toEqual([
      {
        evidenceId: "tasse-lippenstift",
        evidenceLabel: "Tasse",
        text: "Lippenstift = Monica?",
        sharedBy: "Loris",
        sharedById: "s1",
        sharedAt: "2026-11-01T20:00:00.000Z",
      },
    ]);
  });

  it("ersetzt die eigene Notiz zum selben Beweis, lässt fremde stehen", () => {
    const room = createRoom(caseDef);
    joinTeam(room, "s1", "Loris");
    joinTeam(room, "s2", "Lars");
    shareNote(room, "s1", note("erste"));
    shareNote(room, "s2", note("andere Person"));
    shareNote(room, "s1", note("zweite"));
    expect(notesOf(room).map((n) => n.text)).toEqual(["andere Person", "zweite"]);
  });

  it("prüft Team, Beweis und Text", () => {
    const room = createRoom(caseDef);
    joinTeam(room, "s1", "Loris");
    expect(shareNote(room, "fremd", note("x"))).toEqual({ ok: false, reason: "not-in-team" });
    expect(shareNote(room, "s1", { ...note("x"), evidenceId: "erfunden" })).toEqual({
      ok: false,
      reason: "unknown-evidence",
    });
    expect(shareNote(room, "s1", note("   "))).toEqual({ ok: false, reason: "invalid-text" });
    expect(shareNote(room, "s1", note("x".repeat(501)))).toEqual({ ok: false, reason: "invalid-text" });
  });
});
