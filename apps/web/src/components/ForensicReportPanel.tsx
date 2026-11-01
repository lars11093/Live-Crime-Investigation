import type { ForensicReport } from "../lib/forensicReport";

interface Props {
  report: ForensicReport;
  onDownload: () => void;
}

/**
 * Story #73 — Forensik-Report: alle digitalen Funde auf einen Blick, pro
 * Geraet, und als Datei zum Vorlegen.
 */
export function ForensicReportPanel({ report, onDownload }: Props) {
  const empty = report.securedCount === 0 && report.markedCount === 0;
  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Forensik-Report · {report.securedCount} gesichert · {report.markedCount} markiert
        </p>
        <button onClick={onDownload} disabled={empty}>
          Report herunterladen
        </button>
      </div>
      {empty ? (
        <p className="evidence-list__empty">
          Noch keine digitalen Funde. Markiere oder sichere Nachrichten auf einem Gerät.
        </p>
      ) : (
        <ul className="evidence-list__items">
          {report.devices
            .filter((d) => d.secured.length > 0 || d.marked.length > 0)
            .map(({ device, secured, marked }) => (
              <li key={device.id} className="evidence-list__item">
                <span className="evidence-list__head">
                  <span className="evidence-list__label">{device.label}</span>
                  <span className="evidence-list__kind">
                    {secured.length} gesichert · {marked.length} markiert
                  </span>
                </span>
                {secured.map((e) => (
                  <span key={e.id} className="evidence-list__description">
                    {e.foundAt.hotspotLabel}: {e.description}
                  </span>
                ))}
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
