import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { toPublicCase } from "./caseView.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

describe("toPublicCase", () => {
  it("entfernt die Loesung aus dem Fall", () => {
    const view = toPublicCase(caseDef);
    expect("scenarios" in view).toBe(false);
  });

  it("behaelt die Daten, die der Spieler zum Ermitteln braucht", () => {
    const view = toPublicCase(caseDef);
    expect(view.id).toBe(caseDef.id);
    expect(view.title).toBe(caseDef.title);
    expect(view.suspects).toEqual(caseDef.suspects);
    expect(view.seedEvidence).toEqual(caseDef.seedEvidence);
    // Der Chatverlauf ist Ermittlungsmaterial, keine Loesung (#19).
    const openDevices = caseDef.devices?.filter((d) => !d.locked);
    expect(view.devices?.filter((d) => !d.locked)).toEqual(openDevices);
  });

  // Das Forensik-Terminal listet gesperrte Geraete auf (#18), ihr Inhalt
  // bleibt aber auf dem Server, bis sie entsperrt sind.
  it("listet gesperrte Geraete ohne ihre Nachrichten", () => {
    const view = toPublicCase(caseDef);
    const locked = caseDef.devices?.filter((d) => d.locked) ?? [];
    expect(locked.length).toBeGreaterThan(0);
    for (const device of locked) {
      const publicDevice = view.devices?.find((d) => d.id === device.id);
      expect(publicDevice?.label).toBe(device.label);
      expect(publicDevice?.locked).toBe(true);
      expect(publicDevice?.messages).toEqual([]);
    }
    const serialized = JSON.stringify(view);
    for (const message of locked.flatMap((d) => d.messages)) {
      expect(serialized).not.toContain(message.text);
    }
  });

  // Die Verdaechtigen-Liste ist oeffentlich — der Spieler muss sie sehen.
  // Geheim ist, *welcher* davon es war, mit welcher Waffe und wann.
  it("gibt Motiv, Waffe, Tatzeit und Beweiskette nicht preis", () => {
    const serialized = JSON.stringify(toPublicCase(caseDef));
    for (const scenario of caseDef.scenarios) {
      expect(serialized).not.toContain(scenario.id);
      expect(serialized).not.toContain(scenario.motive);
      expect(serialized).not.toContain(scenario.weapon);
      expect(serialized).not.toContain(scenario.timeOfCrime);
      for (const edgeId of scenario.requiredEdgeIds) {
        expect(serialized).not.toContain(edgeId);
      }
    }
  });
});
