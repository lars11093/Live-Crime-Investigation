import { describe, expect, it } from "vitest";
import type { Suspect } from "@case-zero/shared";
import { parseSuspicion, primeSuspect, setSuspicion } from "./suspicion";

const s = (id: string): Suspect => ({ id, name: id, age: 30, relationToVictim: "" });
const suspects = [s("daniel"), s("monica"), s("leo")];

describe("Verdachtsgrad (#43)", () => {
  it("setzt, aendert und nimmt den Verdachtsgrad zurueck", () => {
    const once = setSuspicion({}, "monica", 3);
    expect(once).toEqual({ monica: 3 });
    expect(setSuspicion(once, "monica", 4)).toEqual({ monica: 4 });
    expect(setSuspicion(once, "monica", 3)).toEqual({});
  });

  it("nennt die Person, die eindeutig vorne liegt", () => {
    expect(primeSuspect(suspects, { daniel: 2, monica: 4 })?.id).toBe("monica");
  });

  it("nennt bei Gleichstand oder ohne Einschaetzung niemanden", () => {
    expect(primeSuspect(suspects, { daniel: 3, monica: 3 })).toBeNull();
    expect(primeSuspect(suspects, {})).toBeNull();
  });

  it("liest nur gueltige Grade ein", () => {
    expect(parseSuspicion({ a: 4, b: 0, c: "hoch" })).toEqual({ a: 4 });
  });
});
