import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { unlockDevice } from "./unlock.js";
import { toPublicCase } from "./caseView.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

describe("Geraet entsperren (#70)", () => {
  it("entsperrt das Smartphone mit der richtigen PIN und liefert die Nachrichten", () => {
    const result = unlockDevice(caseDef, "smartphone-fischer", "0417");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.device.locked).toBe(false);
    expect(result.device.messages.length).toBeGreaterThan(0);
    expect("unlockSecret" in result.device).toBe(false);
  });

  it("lehnt eine falsche PIN ab", () => {
    expect(unlockDevice(caseDef, "smartphone-fischer", "1234")).toEqual({
      ok: false,
      reason: "wrong-secret",
    });
  });

  it("nimmt das Passwort unabhaengig von Gross/klein und Trennzeichen an", () => {
    expect(unlockDevice(caseDef, "laptop-vogt", "Finanzen-Q3-Original").ok).toBe(true);
  });

  it("antwortet bei unbekannten oder offenen Geraeten ohne Inhalt", () => {
    expect(unlockDevice(caseDef, "gibt-es-nicht", "0417")).toEqual({ ok: false, reason: "unknown-device" });
    expect(unlockDevice(caseDef, "smartphone-vogt", "0417")).toEqual({ ok: false, reason: "not-locked" });
    expect(unlockDevice(caseDef, "smartphone-fischer", 417)).toEqual({ ok: false, reason: "wrong-secret" });
  });

  it("schickt PIN und Passwort nie an den Client", () => {
    const serialized = JSON.stringify(toPublicCase(caseDef));
    expect(serialized).not.toContain("unlockSecret");
    for (const device of caseDef.devices ?? []) {
      if (device.unlockSecret) expect(serialized).not.toContain(`"${device.unlockSecret}"`);
    }
  });
});
