import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { hintState, revealHint } from "./hints.js";
import { toPublicCase } from "./caseView.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

describe("Hinweis anfordern (#74)", () => {
  it("gibt die Hinweise einzeln und der Reihe nach frei", () => {
    const room = createRoom(caseDef);
    const all = caseDef.hints ?? [];
    expect(all.length).toBeGreaterThan(1);
    expect(hintState(room)).toEqual({ revealed: [], total: all.length });
    expect(revealHint(room).state.revealed).toEqual([all[0]]);
    expect(revealHint(room).state.revealed).toEqual([all[0], all[1]]);
  });

  it("ist nach dem letzten Hinweis erschöpft", () => {
    const room = createRoom(caseDef);
    for (const _ of caseDef.hints ?? []) revealHint(room);
    expect(revealHint(room).ok).toBe(false);
  });

  it("gilt pro Team-Session", () => {
    const a = createRoom(caseDef);
    revealHint(a);
    expect(hintState(createRoom(caseDef)).revealed).toEqual([]);
  });

  it("schickt die Hinweise nicht mit dem Fall an den Client", () => {
    const serialized = JSON.stringify(toPublicCase(caseDef));
    for (const hint of caseDef.hints ?? []) expect(serialized).not.toContain(hint);
  });
});
