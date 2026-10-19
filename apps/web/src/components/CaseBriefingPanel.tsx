import type { CaseBriefing } from "@case-zero/shared";

interface Props {
  title: string;
  briefing?: CaseBriefing;
  /** Fuehrt in den Tatort (#7). */
  onOpenScene: () => void;
  /** Schliesst das Briefing, ohne den Spielstand anzufassen. */
  onClose: () => void;
}

/**
 * Story #6 — Fall-Briefing.
 * Zeigt Falltitel, Tatzeit, Tatort und den Briefing-Text. Fehlt das Briefing
 * im Fall, steht hier "Kein Briefing verfuegbar" statt einer leeren Box.
 */
export function CaseBriefingPanel({ title, briefing, onOpenScene, onClose }: Props) {
  return (
    <section className="panel briefing">
      <p className="terminal-title">Fall-Briefing</p>
      <h1 className="case-title">{title}</h1>

      {briefing ? (
        <>
          <dl className="briefing__facts">
            <div>
              <dt>Tatzeit</dt>
              <dd>{briefing.timeOfCrime}</dd>
            </div>
            <div>
              <dt>Tatort</dt>
              <dd>{briefing.location}</dd>
            </div>
          </dl>
          <p className="briefing__text">{briefing.text}</p>
        </>
      ) : (
        <p className="briefing__empty">Kein Briefing verfuegbar</p>
      )}

      <div className="case-status__actions">
        <button className="button--primary" onClick={onOpenScene}>
          Zum Tatort
        </button>
        <button onClick={onClose}>Briefing schliessen</button>
      </div>
    </section>
  );
}
