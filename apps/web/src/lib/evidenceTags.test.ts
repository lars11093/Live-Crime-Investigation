import { describe, expect, it } from "vitest";
import type { CollectedEvidence } from "@case-zero/shared";
import { addTag, allTags, filterByTag, loadTags, normalizeTag, removeTag, saveTags } from "./evidenceTags";

const evidence = (id: string): CollectedEvidence => ({
  id,
  label: id,
  kind: "object",
  description: "",
  foundAt: { sceneName: "Buero", hotspotLabel: "Tisch" },
});

describe("Beweise taggen (#62)", () => {
  it("vereinheitlicht Tags", () => {
    expect(normalizeTag("  #Monica  Alibi ")).toBe("monica alibi");
    expect(normalizeTag("x".repeat(40))).toHaveLength(20);
  });

  it("fuegt hinzu, ohne Doppelte oder Leere", () => {
    let tags = addTag({}, "tasse", "Monica");
    tags = addTag(tags, "tasse", "monica");
    tags = addTag(tags, "tasse", "   ");
    expect(tags).toEqual({ tasse: ["monica"] });
  });

  it("entfernt Tags und raeumt leere Eintraege auf", () => {
    expect(removeTag({ tasse: ["monica", "tatzeit"] }, "tasse", "monica")).toEqual({ tasse: ["tatzeit"] });
    expect(removeTag({ tasse: ["monica"] }, "tasse", "monica")).toEqual({});
  });

  it("filtert die Akte nach einem Tag", () => {
    const list = [evidence("tasse"), evidence("zettel")];
    const tags = { tasse: ["monica"] };
    expect(filterByTag(list, tags, "monica").map((e) => e.id)).toEqual(["tasse"]);
    expect(filterByTag(list, tags, null)).toEqual(list);
    expect(allTags({ a: ["zeit", "alibi"], b: ["alibi"] })).toEqual(["alibi", "zeit"]);
  });

  it("speichert pro Team-Code", () => {
    const data = new Map<string, string>();
    const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
    saveTags(storage, "ABC-DEF", { tasse: ["monica"] });
    expect(loadTags(storage, "ABC-DEF")).toEqual({ tasse: ["monica"] });
    data.set("case-zero:tags:ABC-DEF", JSON.stringify({ tasse: [1, ""] }));
    expect(loadTags(storage, "ABC-DEF")).toEqual({});
  });
});
