import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { toCaseSummaries, toPublicCase } from "./caseView.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

describe("toPublicCase", () => {
  it("entfernt die Lösung aus dem Fall", () => {
    const view = toPublicCase(caseDef);
    expect("scenarios" in view).toBe(false);
  });

  it("behält die Daten, die der Spieler zum Ermitteln braucht", () => {
    const view = toPublicCase(caseDef);
    expect(view.id).toBe(caseDef.id);
    expect(view.title).toBe(caseDef.title);
    expect(view.suspects).toEqual(caseDef.suspects);
    expect(view.seedEvidence).toEqual(caseDef.seedEvidence);
    // Der Chatverlauf ist Ermittlungsmaterial, keine Lösung (#19).
    // Gelöschte Nachrichten (#71) gehen nur als Anzahl mit, der Rest unverändert.
    const openDevices = caseDef.devices
      ?.filter((d) => !d.locked)
      .map(({ deletedMessages: _deleted, ...d }) => d);
    const publicOpen = view.devices
      ?.filter((d) => !d.locked)
      .map(({ deletedCount: _count, ...d }) => d);
    expect(publicOpen).toEqual(openDevices);
  });

  // Das Forensik-Terminal listet gesperrte Geräte auf (#18), ihr Inhalt
  // bleibt aber auf dem Server, bis sie entsperrt sind.
  it("listet gesperrte Geräte ohne ihre Nachrichten und Dateien", () => {
    const view = toPublicCase(caseDef);
    const locked = caseDef.devices?.filter((d) => d.locked) ?? [];
    expect(locked.length).toBeGreaterThan(0);
    for (const device of locked) {
      const publicDevice = view.devices?.find((d) => d.id === device.id);
      expect(publicDevice?.label).toBe(device.label);
      expect(publicDevice?.locked).toBe(true);
      expect(publicDevice?.messages).toEqual([]);
      expect(publicDevice?.files ?? []).toEqual([]);
      expect(publicDevice?.locations ?? []).toEqual([]);
    }
    const serialized = JSON.stringify(view);
    for (const message of locked.flatMap((d) => d.messages)) {
      expect(serialized).not.toContain(message.text);
    }
    for (const file of locked.flatMap((d) => d.files ?? [])) {
      expect(serialized).not.toContain(file.name);
    }
  });

  // Die Verdächtigen-Liste ist öffentlich — der Spieler muss sie sehen.
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

describe("Fallauswahl (#30)", () => {
  it("listet jeden Fall mit Titel, Tatort, Tatzeit und Verdächtigen", () => {
    expect(toCaseSummaries([caseDef])).toEqual([
      {
        id: "case-01",
        title: caseDef.title,
        location: caseDef.briefing?.location,
        timeOfCrime: caseDef.briefing?.timeOfCrime,
        suspectCount: caseDef.suspects.length,
      },
    ]);
  });

  it("sortiert nach Titel und kommt ohne Briefing aus", () => {
    const other: CaseDefinition = { ...caseDef, id: "case-00", title: "A Quiet Night", briefing: undefined };
    const list = toCaseSummaries([caseDef, other]);
    expect(list.map((c) => c.id)).toEqual(["case-00", "case-01"]);
    expect(list[0].location).toBeUndefined();
  });

  it("verrät nichts aus der Lösung", () => {
    const json = JSON.stringify(toCaseSummaries([caseDef]));
    for (const scenario of caseDef.scenarios) {
      expect(json).not.toContain(scenario.resolution);
    }
  });
});

describe("Ermittlungsziel (#32)", () => {
  it("geht an den Client, weil es jederzeit sichtbar sein soll", () => {
    expect(toPublicCase(caseDef).objective).toBe(caseDef.objective);
    expect(caseDef.objective).toBeTruthy();
  });

  it("nennt keinen Täter", () => {
    for (const scenario of caseDef.scenarios) {
      const culprit = caseDef.suspects.find((s) => s.id === scenario.suspectId)!;
      expect(caseDef.objective).not.toContain(culprit.name);
    }
  });
});

describe("Systemprotokolle (#46)", () => {
  it("liefert das Protokoll offener Geräte aus", () => {
    const open = toPublicCase(caseDef).devices?.find((d) => d.id === "smartphone-vogt");
    expect(open?.systemLog?.length).toBeGreaterThan(0);
  });

  it("schickt kein Protokoll gesperrter Geräte an den Client", () => {
    const view = toPublicCase(caseDef);
    const lockedWithLog = caseDef.devices?.filter((d) => d.locked && d.systemLog?.length) ?? [];
    expect(lockedWithLog.length).toBeGreaterThan(0);
    for (const device of lockedWithLog) {
      expect(view.devices?.find((d) => d.id === device.id)?.systemLog).toEqual([]);
    }
    // Gezielt auf einen Protokolleintrag des gesperrten Laptops prüfen: das
    // Wort "Revisionsstelle" allein kommt inzwischen auch in einer Befragung (#67) vor.
    expect(JSON.stringify(view)).not.toContain("Mail-Entwurf gespeichert: An Revisionsstelle");
  });
});
