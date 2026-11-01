import { describe, expect, it } from "vitest";
import type { Hotspot } from "@case-zero/shared";
import { toolsIn, visibleHotspots } from "./sceneTools";

const hotspot = (id: string, uv = false): Hotspot => ({
  id,
  label: id,
  x: 10,
  y: 10,
  detail: "",
  ...(uv ? { requiresTool: "uv" as const } : {}),
});

describe("Werkzeuge im Tatort (#60)", () => {
  const spots = [hotspot("tisch"), hotspot("boden", true)];

  it("zeigt UV-Spuren nur mit eingeschalteter Lampe", () => {
    expect(visibleHotspots(spots, null).map((h) => h.id)).toEqual(["tisch"]);
    expect(visibleHotspots(spots, "uv").map((h) => h.id)).toEqual(["tisch", "boden"]);
  });

  it("laesst gefundene UV-Spuren auch ohne Lampe sichtbar", () => {
    expect(visibleHotspots(spots, null, ["boden"]).map((h) => h.id)).toEqual(["tisch", "boden"]);
  });

  it("bietet nur Werkzeuge an, die in der Szene etwas bringen", () => {
    expect(toolsIn(spots)).toEqual(["uv"]);
    expect(toolsIn([hotspot("tisch")])).toEqual([]);
  });
});
