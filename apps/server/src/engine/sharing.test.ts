import { describe, expect, it } from "vitest";
import type { CaseDefinition, CollectedEvidence } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { joinTeam } from "./team.js";
import { collectableIds, shareFinding } from "./sharing.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

const tasse: CollectedEvidence = {
  id: "tasse-lippenstift",
  label: "Tasse mit Lippenstiftabdruck",
  kind: "object",
  description: "Halbvolle, kalte Tasse.",
  foundAt: { sceneName: "Buero 4.12 - Fundort", hotspotLabel: "Tasse auf der Ablage" },
};

function roomWithTeam() {
  const room = createRoom(caseDef);
  joinTeam(room, "socket-a", "Loris");
  joinTeam(room, "socket-b", "Lars");
  return room;
}

describe("Einsammelbare Beweise", () => {
  it("kennt Funde aus dem Tatort und Chatnachrichten", () => {
    const ids = collectableIds(caseDef);
    expect(ids.has("tasse-lippenstift")).toBe(true);
    expect(ids.has("msg-vogt-05")).toBe(true);
  });
});

describe("Fund teilen", () => {
  it("teilt einen Fund mit Namen des Urhebers", () => {
    const room = roomWithTeam();
    expect(shareFinding(room, "socket-a", tasse)).toEqual({ ok: true });
    expect(room.findings).toHaveLength(1);
    expect(room.findings[0].sharedBy).toBe("Loris");
    expect(room.findings[0].evidence.id).toBe("tasse-lippenstift");
  });

  it("laesst nur Teammitglieder teilen", () => {
    const room = roomWithTeam();
    expect(shareFinding(room, "socket-x", tasse)).toEqual({ ok: false, reason: "not-in-team" });
    expect(room.findings).toEqual([]);
  });

  it("weist erfundene Beweise ab", () => {
    const room = roomWithTeam();
    const fake = { ...tasse, id: "gestaendnis", label: "Gestaendnis von Monica" };
    expect(shareFinding(room, "socket-a", fake)).toEqual({ ok: false, reason: "unknown-evidence" });
  });

  it("teilt denselben Beweis nur einmal und behaelt den ersten Urheber", () => {
    const room = roomWithTeam();
    shareFinding(room, "socket-a", tasse);
    expect(shareFinding(room, "socket-b", tasse)).toEqual({ ok: false, reason: "already-shared" });
    expect(room.findings).toHaveLength(1);
    expect(room.findings[0].sharedBy).toBe("Loris");
  });

  it("nimmt aus dem Client nur die Beweisfelder mit", () => {
    const room = roomWithTeam();
    const withExtra = { ...tasse, secret: "x" } as CollectedEvidence;
    shareFinding(room, "socket-a", withExtra);
    expect("secret" in room.findings[0].evidence).toBe(false);
  });

  it("teilt auch eine gesicherte Chatnachricht", () => {
    const room = roomWithTeam();
    const message: CollectedEvidence = {
      id: "msg-vogt-05",
      label: "Nachricht von Thomas Vogt",
      kind: "message",
      description: "«Meet me at the office. 22:30.»",
      foundAt: { sceneName: "Smartphone Thomas Vogt", hotspotLabel: "Chat · 12.09. 20:30" },
    };
    expect(shareFinding(room, "socket-b", message)).toEqual({ ok: true });
  });
});
