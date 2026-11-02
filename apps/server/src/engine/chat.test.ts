import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { joinTeam, chooseRole } from "./team.js";
import { CHAT_HISTORY_MAX, CHAT_TEXT_MAX, addChatMessage } from "./chat.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;
const now = new Date("2026-10-26T20:00:00Z");

function roomWithAnna() {
  const room = createRoom(caseDef);
  joinTeam(room, "socket-anna", "Anna");
  return room;
}

describe("Team-Chat (#49)", () => {
  it("nimmt eine Nachricht an und legt sie im Verlauf ab", () => {
    const room = roomWithAnna();
    const result = addChatMessage(room, "socket-anna", "  Habt ihr das Badge-Protokoll?  ", now, "m1");
    expect(result).toEqual({
      ok: true,
      message: {
        id: "m1",
        playerId: "socket-anna",
        name: "Anna",
        role: null,
        text: "Habt ihr das Badge-Protokoll?",
        sentAt: "2026-10-26T20:00:00.000Z",
      },
    });
    expect(room.chat).toHaveLength(1);
  });

  it("nimmt Name und Rolle aus dem Team", () => {
    const room = roomWithAnna();
    chooseRole(room, "socket-anna", "cyber");
    const result = addChatMessage(room, "socket-anna", "Hallo", now);
    expect(result.ok && result.message).toMatchObject({ name: "Anna", role: "cyber" });
  });

  it("lässt nur Teammitglieder schreiben", () => {
    const room = roomWithAnna();
    expect(addChatMessage(room, "socket-fremd", "Hallo", now)).toEqual({
      ok: false,
      reason: "Tritt zuerst dem Team bei.",
    });
    expect(room.chat ?? []).toHaveLength(0);
  });

  it("weist leere und zu lange Nachrichten ab", () => {
    const room = roomWithAnna();
    expect(addChatMessage(room, "socket-anna", "   ", now).ok).toBe(false);
    expect(addChatMessage(room, "socket-anna", "x".repeat(CHAT_TEXT_MAX + 1), now).ok).toBe(false);
    expect(room.chat ?? []).toHaveLength(0);
  });

  it("behält nur die letzten Nachrichten", () => {
    const room = roomWithAnna();
    for (let i = 0; i < CHAT_HISTORY_MAX + 5; i++) {
      addChatMessage(room, "socket-anna", `Nachricht ${i}`, now, `m${i}`);
    }
    expect(room.chat).toHaveLength(CHAT_HISTORY_MAX);
    expect(room.chat?.[0].id).toBe("m5");
  });
});
