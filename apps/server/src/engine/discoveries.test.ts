import { describe, expect, it } from "vitest";
import type { CaseDefinition, CollectedEvidence } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { joinTeam } from "./team.js";
import { recordDiscovery } from "./discoveries.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

const tasse: CollectedEvidence = {
  id: "tasse-lippenstift",
  label: "Tasse mit Lippenstiftabdruck",
  kind: "object",
  description: "Halbvolle, kalte Tasse.",
  foundAt: { sceneName: "Büro 4.12 - Fundort", hotspotLabel: "Tasse auf der Ablage" },
};

function roomWithTeam() {
  const room = createRoom(caseDef);
  joinTeam(room, "socket-a", "Loris");
  joinTeam(room, "socket-b", "Lars");
  return room;
}

describe("Funde live ans Team (#75)", () => {
  it("hält Fund, Finder und Zeitpunkt fest", () => {
    const room = roomWithTeam();
    const at = new Date("2026-11-02T10:00:00Z");
    expect(recordDiscovery(room, "socket-a", tasse, at)).toEqual({ ok: true });
    expect(room.discoveries).toEqual([
      { evidence: tasse, foundBy: "Loris", foundById: "socket-a", foundAt: "2026-11-02T10:00:00.000Z" },
    ]);
  });

  it("lässt den ersten Finder stehen, wenn jemand denselben Fund einsammelt", () => {
    const room = roomWithTeam();
    recordDiscovery(room, "socket-a", tasse);
    expect(recordDiscovery(room, "socket-b", tasse)).toEqual({ ok: false, reason: "already-shared" });
    expect(room.discoveries.map((d) => d.foundBy)).toEqual(["Loris"]);
  });

  it("nimmt nur Funde von Teammitgliedern an", () => {
    const room = roomWithTeam();
    expect(recordDiscovery(room, "socket-x", tasse)).toEqual({ ok: false, reason: "not-in-team" });
    expect(room.discoveries).toEqual([]);
  });

  it("weist Beweise ab, die es im Fall nicht gibt", () => {
    const room = roomWithTeam();
    const fake = { ...tasse, id: "gestaendnis", label: "Geständnis" };
    expect(recordDiscovery(room, "socket-a", fake)).toEqual({ ok: false, reason: "unknown-evidence" });
  });

  it("speichert nur die Felder eines Beweises", () => {
    const room = roomWithTeam();
    const extra = { ...tasse, secret: "x" } as CollectedEvidence;
    recordDiscovery(room, "socket-a", extra);
    expect(room.discoveries[0].evidence).not.toHaveProperty("secret");
  });

  it("nimmt auch gesicherte Chatnachrichten an", () => {
    const room = roomWithTeam();
    const msg: CollectedEvidence = {
      id: "msg-vogt-05",
      label: "Nachricht",
      kind: "message",
      description: "Text",
      foundAt: { sceneName: "Smartphone", hotspotLabel: "Chat" },
    };
    expect(recordDiscovery(room, "socket-b", msg).ok).toBe(true);
  });
});
