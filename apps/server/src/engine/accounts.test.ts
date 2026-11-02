import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AccountStore } from "./accounts.js";

describe("Konto erstellen (#55)", () => {
  it("legt ein Konto an und meldet mit dem Passwort wieder an", () => {
    const store = new AccountStore();
    const created = store.register("Kommissarin Frei", "geheim123");
    expect(created.ok).toBe(true);
    expect(store.login("kommissarin frei", "geheim123").ok).toBe(true);
    expect(store.login("Kommissarin Frei", "falsch")).toEqual({ ok: false, error: "Name oder Passwort falsch." });
  });

  it("prüft Name, Passwort und doppelte Konten", () => {
    const store = new AccountStore();
    expect(store.register("A", "geheim123").ok).toBe(false);
    expect(store.register("Loris", "kurz").ok).toBe(false);
    store.register("Loris", "geheim123");
    expect(store.register("loris", "anderes123")).toEqual({ ok: false, error: "Dieser Name ist schon vergeben." });
  });

  it("speichert den Spielstand pro Team-Code und nur mit gültigem Token", () => {
    const store = new AccountStore();
    const created = store.register("Loris", "geheim123");
    if (!created.ok) throw new Error("Konto fehlt");
    expect(store.getProgress(created.token, "ABC-DEF")).toBeNull();
    expect(store.saveProgress(created.token, "ABC-DEF", '{"notes":{}}')).toBe("ok");
    expect(store.getProgress(created.token, "ABC-DEF")).toBe('{"notes":{}}');
    expect(store.saveProgress("falsch", "ABC-DEF", "{}")).toBe("unauthorized");
    expect(store.saveProgress(created.token, "ABC-DEF", "kein json")).toBe("invalid");
    expect(store.getProgress(undefined, "ABC-DEF")).toBeUndefined();
  });

  it("überlebt einen Neustart über die Datei, ohne Klartext-Passwort", () => {
    const file = join(mkdtempSync(join(tmpdir(), "accounts-")), "accounts.json");
    new AccountStore(file).register("Loris", "geheim123");
    expect(readFileSync(file, "utf-8")).not.toContain("geheim123");
    expect(new AccountStore(file).login("Loris", "geheim123").ok).toBe(true);
  });
});
