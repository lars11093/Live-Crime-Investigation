import { describe, expect, it } from "vitest";
import type { TeamChatMessage } from "@case-zero/shared";
import { appendMessage, formatChatTime, unreadCount } from "./teamChat";

const msg = (id: string, playerId: string): TeamChatMessage => ({
  id,
  playerId,
  name: playerId,
  role: null,
  text: "Hallo",
  sentAt: "2026-10-26T20:41:00.000Z",
});

describe("Team-Chat im Client (#49)", () => {
  it("haengt neue Nachrichten an, doppelte nicht", () => {
    const list = appendMessage([], msg("1", "anna"));
    expect(appendMessage(list, msg("1", "anna"))).toBe(list);
    expect(appendMessage(list, msg("2", "ben"))).toHaveLength(2);
  });

  it("zaehlt nur ungelesene Nachrichten anderer", () => {
    const list = [msg("1", "anna"), msg("2", "ben"), msg("3", "anna"), msg("4", "ben")];
    expect(unreadCount(list, "anna", 0)).toBe(2);
    expect(unreadCount(list, "anna", 3)).toBe(1);
    expect(unreadCount(list, "anna", 4)).toBe(0);
  });

  it("zeigt die Uhrzeit, Unsinn wird leer", () => {
    expect(formatChatTime("2026-10-26T20:41:00.000Z")).toMatch(/^\d{2}:\d{2}$/);
    expect(formatChatTime("kaputt")).toBe("");
  });
});
