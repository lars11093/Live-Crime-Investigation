/**
 * Ein Tatortfoto eines Fundes (Story #35).
 *
 * Kein Bild im Speicher: echte Bild-Assets gibt es im Repo bewusst nicht
 * (CLAUDE.md), und Pixel im localStorage waeren schnell zu viel. Das Foto
 * merkt sich stattdessen, *wo* es aufgenommen wurde — Szenenbild, Stelle und
 * Zoom. Daraus zeichnet die Akte den Ausschnitt jederzeit neu.
 */
export interface EvidencePhoto {
  evidenceId: string;
  /** ISO-Zeitpunkt der Aufnahme. */
  takenAt: string;
  sceneName: string;
  /** Szenenbild, aus dem der Ausschnitt stammt. */
  sceneImagePath: string;
  hotspotLabel: string;
  /** Position der Stelle in Prozent der Szene (wie Hotspot.x/y). */
  x: number;
  y: number;
  /** Zoomstufe bei der Aufnahme (#33) — bestimmt den Bildausschnitt. */
  zoom: number;
}

/** Legt ein Foto ab. Ein neues Foto desselben Fundes ersetzt das alte. */
export function storePhoto(
  photos: Record<string, EvidencePhoto>,
  photo: EvidencePhoto
): Record<string, EvidencePhoto> {
  return { ...photos, [photo.evidenceId]: photo };
}

/**
 * CSS fuer den Ausschnitt: das Szenenbild vergroessert und auf die Stelle
 * geschoben. Mindestens 3x, damit es nach Nahaufnahme aussieht — bei hoeherem
 * Zoom entsprechend mehr.
 */
export function photoCrop(photo: EvidencePhoto): { backgroundSize: string; backgroundPosition: string } {
  const scale = Math.max(3, photo.zoom * 2) * 100;
  return {
    backgroundSize: `${scale}% auto`,
    backgroundPosition: `${photo.x}% ${photo.y}%`,
  };
}

/** Liest gespeicherte Fotos robust ein; Unvollstaendiges faellt weg. */
export function parsePhotos(raw: unknown): Record<string, EvidencePhoto> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: Record<string, EvidencePhoto> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    const p = value as Partial<EvidencePhoto> | null;
    if (
      p &&
      typeof p.takenAt === "string" &&
      typeof p.sceneName === "string" &&
      typeof p.hotspotLabel === "string" &&
      typeof p.x === "number" &&
      typeof p.y === "number"
    ) {
      result[id] = {
        evidenceId: id,
        takenAt: p.takenAt,
        sceneName: p.sceneName,
        sceneImagePath: typeof p.sceneImagePath === "string" ? p.sceneImagePath : "",
        hotspotLabel: p.hotspotLabel,
        x: p.x,
        y: p.y,
        zoom: typeof p.zoom === "number" ? p.zoom : 1,
      };
    }
  }
  return result;
}
