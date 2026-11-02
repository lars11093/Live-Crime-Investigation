import { describe, expect, it, vi } from "vitest";
import { restartCase } from "./restart";

function deps(over: Partial<Parameters<typeof restartCase>[2]> = {}) {
  return {
    createRoom: vi.fn(async () => ({ code: "NEU-123" })),
    skipIntro: vi.fn(),
    go: vi.fn(),
    ...over,
  };
}

describe("Fall neu starten (#79)", () => {
  it("legt eine neue Session mit derselben Schwierigkeit an und wechselt dorthin", async () => {
    const d = deps();
    expect(await restartCase("case-01", "schwer", d)).toBeNull();
    expect(d.createRoom).toHaveBeenCalledWith("case-01", "schwer");
    expect(d.skipIntro).toHaveBeenCalledWith("NEU-123");
    expect(d.go).toHaveBeenCalledWith("NEU-123");
  });

  it("nimmt das Team mit, statt allein zu wechseln", async () => {
    const d = deps({ moveTeam: vi.fn(async () => ({ ok: true })) });
    await restartCase("case-01", "normal", d);
    expect(d.moveTeam).toHaveBeenCalledWith("NEU-123");
    expect(d.go).not.toHaveBeenCalled();
  });

  it("wechselt allein, wenn das Team nicht mitkommt", async () => {
    const d = deps({ moveTeam: vi.fn(async () => ({ ok: false })) });
    await restartCase("case-01", "normal", d);
    expect(d.go).toHaveBeenCalledWith("NEU-123");
  });

  it("meldet einen nicht erreichbaren Server", async () => {
    const d = deps({ createRoom: vi.fn(async () => Promise.reject(new Error("offline"))) });
    expect(await restartCase("case-01", "normal", d)).toContain("nicht erreichbar");
    expect(d.go).not.toHaveBeenCalled();
  });
});
