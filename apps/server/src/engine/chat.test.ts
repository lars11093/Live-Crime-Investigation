import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { joinTeam, chooseRole } from "./team.js";
import { CHAT_HISTORY_MAX, CHAT_TEXT_MAX, addChatMessage, caseChannel } from "./chat.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;
const now = new Date("2026-10-26T20:00:00Z");

describe("Team-Chat (#49)", () => {
  it("nutzt den Socket-Room case:<code>", () => {
    expect(caseChannel("7K4-XP9")).toBe("case:7K4-XP9");
  });

  it("nimmt eine Nachricht an und legt sie im Verlauf ab", () => {
    const room = createRoom(caseDef);
    const result = addChatMessage(room, "anna", "Anna", "  Habt ihr das Badge-Protokoll?  ", now, "m1");
    expect(result).toEqual({
      ok: true,
      message: {
        id: "m1",
        playerId: "anna",
        name: "Anna",
        role: null,
        text: "Habt ihr das Badge-Protokoll?",
        sentAt: "2026-10-26T20:00:00.000Z",
      },
    });
    expect(room.chat).toHaveLength(1);
  });

  it("nimmt Name und Rolle aus dem Team", () => {
    const room = createRoom(caseDef);
    joinTeam(room, "anna", "Anna");
    chooseRole(room, "anna", "anna", "cyber");
    const result = addChatMessage(room, "anna", "Jemand anderes", "Hallo", now);
    expect(result.ok && result.message).toMatchObject({ name: "Anna", role: "cyber" });
  });

  it("weist leere und zu lange Nachrichten ab", () => {
    const room = createRoom(caseDef);
    expect(addChatMessage(room, "anna", "Anna", "   ", now).ok).toBe(false);
    expect(addChatMessage(room, "anna", "Anna", "x".repeat(CHAT_TEXT_MAX + 1), now).ok).toBe(false);
    expect(addChatMessage(room, "", "Anna", "Hallo", now).ok).toBe(false);
    expect(room.chat ?? []).toHaveLength(0);
  });

  it("behaelt nur die letzten Nachrichten", () => {
    const room = createRoom(caseDef);
    for (let i = 0; i < CHAT_HISTORY_MAX + 5; i++) {
      addChatMessage(room, "anna", "Anna", `Nachricht ${i}`, now, `m${i}`);
    }
    expect(room.chat).toHaveLength(CHAT_HISTORY_MAX);
    expect(room.chat?.[0].id).toBe("m5");
  });
});
