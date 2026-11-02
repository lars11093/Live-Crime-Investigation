import type { ImageMetadata } from "@case-zero/shared";

/** Eine Zeile der Metadaten-Anzeige (#45). */
export interface MetadataRow {
  label: string;
  value: string;
}

/** Koordinaten wie in einem EXIF-Viewer: 47.38912° N, 8.51574° E. */
export function formatGps(lat: number, lng: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(5)}° ${ns}, ${Math.abs(lng).toFixed(5)}° ${ew}`;
}

/**
 * Die Metadaten eines Bildes als Tabelle (Story #45).
 *
 * Nur, was im Bild steht: fehlt ein Feld, fehlt die Zeile — ein leeres
 * "Ort: –" waere selbst schon eine Aussage ("GPS war aus"), die der Fall
 * dann explizit machen muss (`gpsDisabled`).
 */
export function metadataRows(meta: ImageMetadata): MetadataRow[] {
  const rows: MetadataRow[] = [{ label: "Aufnahmezeit", value: meta.takenAt }];
  if (meta.camera) rows.push({ label: "Geraet", value: meta.camera });
  if (meta.gps) {
    rows.push({
      label: "GPS",
      value: meta.gps.place
        ? `${formatGps(meta.gps.lat, meta.gps.lng)} (${meta.gps.place})`
        : formatGps(meta.gps.lat, meta.gps.lng),
    });
  } else if (meta.gpsDisabled) {
    rows.push({ label: "GPS", value: "nicht aufgezeichnet" });
  }
  if (meta.resolution) rows.push({ label: "Aufloesung", value: meta.resolution });
  if (meta.software) rows.push({ label: "Software", value: meta.software });
  return rows;
}

/** Kurzfassung fuer die Beweisakte, z. B. "aufgenommen 12.09. 20:44 · Pixel 7". */
export function metadataSummary(meta: ImageMetadata): string {
  return [
    `aufgenommen ${meta.takenAt}`,
    meta.camera,
    meta.gps?.place,
  ]
    .filter(Boolean)
    .join(" · ");
}
