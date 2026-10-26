import { describe, expect, it } from "vitest";
import { parsePhotos, photoCrop, storePhoto, type EvidencePhoto } from "./photos";

const photo: EvidencePhoto = {
  evidenceId: "tasse-lippenstift",
  takenAt: "2026-10-26T10:00:00.000Z",
  sceneName: "Buero 4.12",
  sceneImagePath: "/scenes/case-01/buero-412.jpg",
  hotspotLabel: "Tasse auf der Ablage",
  x: 55,
  y: 66,
  zoom: 1,
};

describe("Fund fotografieren (#35)", () => {
  it("legt ein Foto pro Fund ab und ersetzt ein altes", () => {
    const first = storePhoto({}, photo);
    const second = storePhoto(first, { ...photo, zoom: 2 });
    expect(Object.keys(second)).toEqual(["tasse-lippenstift"]);
    expect(second["tasse-lippenstift"].zoom).toBe(2);
  });

  it("schneidet auf die Stelle zu, bei mehr Zoom enger", () => {
    expect(photoCrop(photo)).toEqual({ backgroundSize: "300% auto", backgroundPosition: "55% 66%" });
    expect(photoCrop({ ...photo, zoom: 3 }).backgroundSize).toBe("600% auto");
  });

  it("uebersteht Speichern und Laden, Kaputtes faellt weg", () => {
    const stored = JSON.parse(JSON.stringify({ a: photo, b: { x: "kaputt" } }));
    expect(parsePhotos(stored)).toEqual({ a: { ...photo, evidenceId: "a" } });
    expect(parsePhotos(null)).toEqual({});
    expect(parsePhotos([photo])).toEqual({});
  });
});
