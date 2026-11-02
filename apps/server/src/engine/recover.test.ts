import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { recoverDeleted } from "./recover.js";
import { toPublicCase } from "./caseView.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

describe("Gelöschte Daten wiederherstellen (#71)", () => {
  it("liefert die gelöschten Nachrichten als wiederhergestellt", () => {
    const result = recoverDeleted(caseDef, "smartphone-vogt");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.messages.length).toBeGreaterThan(0);
    expect(result.messages.every((m) => m.recovered)).toBe(true);
  });

  it("verweigert gesperrte und unbekannte Geräte", () => {
    expect(recoverDeleted(caseDef, "smartphone-fischer")).toEqual({ ok: false, reason: "locked" });
    expect(recoverDeleted(caseDef, "gibt-es-nicht")).toEqual({ ok: false, reason: "unknown-device" });
  });

  it("schickt vor dem Wiederherstellen nur die Anzahl an den Client", () => {
    const view = toPublicCase(caseDef);
    const phone = view.devices?.find((d) => d.id === "smartphone-vogt");
    const deleted = caseDef.devices?.find((d) => d.id === "smartphone-vogt")?.deletedMessages ?? [];
    expect(phone?.deletedCount).toBe(deleted.length);
    const serialized = JSON.stringify(view);
    expect(serialized).not.toContain("deletedMessages");
    for (const message of deleted) expect(serialized).not.toContain(message.text);
  });
});
