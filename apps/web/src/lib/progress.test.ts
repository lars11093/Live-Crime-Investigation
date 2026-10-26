import { describe, expect, it } from "vitest";
import type { Scene } from "@case-zero/shared";
import { summarizeProgress } from "./progress";

const evidence = (id: string) => ({ id, label: id, kind: "object" as const, description: id });

const buero: Scene = {
  id: "buero",
  name: "Buero",
  imagePath: "/b.jpg",
  hotspots: [
    { id: "tisch", label: "Schreibtisch", x: 0, y: 0, detail: "", evidence: evidence("notebook") },
    { id: "tasse", label: "Tasse", x: 0, y: 0, detail: "", evidence: evidence("tasse") },
    { id: "kamera", label: "Kamera", x: 0, y: 0, detail: "" },
  ],
};

const flur: Scene = {
  id: "flur",
  name: "Flur",
  imagePath: "/f.jpg",
  hotspots: [{ id: "badge", label: "Badge-Leser", x: 0, y: 0, detail: "", evidence: evidence("protokoll") }],
};

describe("Ermittlungsfortschritt", () => {
  it("startet bei null", () => {
    const summary = summarizeProgress([buero, flur], [], []);
    expect(summary).toMatchObject({ found: 0, total: 3, percent: 0 });
  });

  it("zaehlt nur Beweise, nicht Stellen ohne Beweis", () => {
    expect(summarizeProgress([buero], [], []).total).toBe(2);
  });

  it("rechnet den Anteil in Prozent", () => {
    expect(summarizeProgress([buero, flur], ["notebook"], []).percent).toBe(33);
  });

  it("ignoriert gefundene IDs, die keine Tatort-Beweise sind", () => {
    // z. B. eine gesicherte Chatnachricht (#21)
    expect(summarizeProgress([buero], ["msg-vogt-05"], []).found).toBe(0);
  });

  it("nennt die offenen Stellen pro Bereich", () => {
    const [area] = summarizeProgress([buero], [], ["kamera"]).areas;
    expect(area.openHotspots).toEqual(["Schreibtisch", "Tasse"]);
    expect(area.done).toBe(false);
  });

  // Hat jemand im Team den Beweis geteilt (#23), ist die Stelle fuer alle erledigt.
  it("zaehlt eine Stelle mit gefundenem Beweis als erledigt", () => {
    const [area] = summarizeProgress([buero], ["tasse"], []).areas;
    expect(area.openHotspots).toEqual(["Schreibtisch", "Kamera"]);
  });

  it("meldet einen Bereich als erledigt, wenn alles gefunden und angesehen ist", () => {
    const [area] = summarizeProgress([buero], ["notebook", "tasse"], ["kamera"]).areas;
    expect(area.done).toBe(true);
    expect(area.openHotspots).toEqual([]);
  });

  it("zeigt ohne Beweise im Fall 100 Prozent statt durch null zu teilen", () => {
    expect(summarizeProgress([], [], []).percent).toBe(100);
  });
});
