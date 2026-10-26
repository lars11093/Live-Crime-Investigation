import { useState } from "react";
import type { CollectedEvidence, Suspect } from "@case-zero/shared";
import { missingForAccusation, type AccusationDraft } from "../lib/accusation";
import { KIND_LABEL } from "./evidenceKind";
import { CaseResolution } from "./CaseResolution";
import { AccusationReview } from "./AccusationReview";
import type { ReviewFinding } from "../lib/accusationReview";

interface Props {
  draft: AccusationDraft;
  suspects: Suspect[];
  /** Alle Beweise aus der Akte — nur die koennen angehaengt werden. */
  evidence: CollectedEvidence[];
  onAttach: (evidenceId: string) => void;
  onDetach: (evidenceId: string) => void;
  /** Fuehrt zur Verdaechtigenliste mit Profilen und Vergleich (#25). */
  onChooseSuspect: () => void;
  /** Taeter direkt hier wechseln oder mit `null` aufheben (#51). */
  onChangeSuspect: (suspectId: string | null) => void;
  /**
   * Sendet die Anklage ab (#27). Liefert `null` bei Erfolg, sonst den
   * Fehlertext fuer den Spieler.
   */
  onSubmit: () => Promise<string | null>;
  /** Ergebnis der Pruefung auf offensichtliche Luecken (#52), laufend aktuell. */
  review: ReviewFinding[];
  onBack: () => void;
}

/** Zeitpunkt der Quittung, wie er im Terminal steht. */
function formatSubmittedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("de-CH", { dateStyle: "short", timeStyle: "short" });
}

/**
 * Story #26 — der Anklage Beweise anhaengen.
 *
 * Zeigt den ausgewaehlten Taeter (#25), die angehaengten Beweise mit
 * "Entfernen" und darunter, was aus der Akte noch angehaengt werden kann.
 *
 * Story #27 — Anklage absenden. Nur mit Taeter und mindestens einem Beweis;
 * danach zeigt das Panel die Bestaetigung und nichts laesst sich mehr aendern.
 */
export function AccusationPanel({
  draft,
  suspects,
  evidence,
  onAttach,
  onDetach,
  onChooseSuspect,
  onChangeSuspect,
  onSubmit,
  review,
  onBack,
}: Props) {
  const [sending, setSending] = useState(false);
  // #52 — die Pruefung erscheint erst auf Wunsch und rechnet dann bei jeder Aenderung neu.
  const [showReview, setShowReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suspect = suspects.find((s) => s.id === draft.suspectId);
  const attached = draft.evidenceIds
    .map((id) => evidence.find((e) => e.id === id))
    .filter((e): e is CollectedEvidence => Boolean(e));
  const available = evidence.filter((e) => !draft.evidenceIds.includes(e.id));
  const missing = missingForAccusation(draft);
  const receipt = draft.receipt;

  async function submit() {
    setSending(true);
    setError(null);
    const problem = await onSubmit();
    setSending(false);
    setError(problem);
  }

  if (receipt) {
    return (
      <section className="panel accusation">
        <div className="evidence-list__bar">
          <p className="terminal-title" style={{ margin: 0 }}>
            Anklage abgesendet
          </p>
          <button onClick={onBack}>Zurueck zur Fallakte</button>
        </div>
        <p className="accusation__confirmation" role="status">
          Die Anklage wurde am {formatSubmittedAt(receipt.submittedAt)} an die Staatsanwaltschaft
          uebermittelt. Sie kann nicht mehr geaendert werden.
        </p>
        <div className="accusation__block">
          <p className="team-code__label">Angeklagt</p>
          <p className="accusation__suspect">
            <strong>{suspect?.name ?? receipt.suspectId}</strong>
          </p>
        </div>
        <div className="accusation__block">
          <p className="team-code__label">Angehaengte Beweise · {receipt.evidenceIds.length}</p>
          <ul className="accusation__list">
            {receipt.evidenceIds.map((id) => (
              <li key={id} className="accusation__item">
                {evidence.find((e) => e.id === id)?.label ?? id}
              </li>
            ))}
          </ul>
        </div>
        <div className="accusation__block">
          <p className="terminal-title" style={{ margin: 0 }}>
            Aufloesung
          </p>
          <CaseResolution verdict={receipt.verdict} />
        </div>
      </section>
    );
  }

  return (
    <section className="panel accusation">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Anklage vorbereiten
        </p>
        <button onClick={onBack}>Zurueck zur Fallakte</button>
      </div>

      <div className="accusation__block">
        <p className="team-code__label">Taeter</p>
        {suspect ? (
          <p className="accusation__suspect">
            <strong>{suspect.name}</strong> · {suspect.relationToVictim}
          </p>
        ) : (
          <p className="briefing__empty">Noch kein Taeter ausgewaehlt.</p>
        )}
        {/* #51 — bis zum Absenden jederzeit aenderbar, ohne die Ansicht zu verlassen. */}
        <div className="case-status__actions" style={{ margin: 0 }}>
          <select
            aria-label="Taeter aendern"
            value={draft.suspectId ?? ""}
            onChange={(e) => onChangeSuspect(e.target.value || null)}
          >
            <option value="">— niemand ausgewaehlt —</option>
            {suspects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {suspect && <button onClick={() => onChangeSuspect(null)}>Auswahl aufheben</button>}
          <button onClick={onChooseSuspect}>Zu den Verdaechtigen</button>
        </div>
      </div>

      <div className="accusation__block">
        <p className="team-code__label">Angehaengte Beweise · {attached.length}</p>
        {attached.length === 0 ? (
          <p className="briefing__empty">Noch kein Beweis angehaengt.</p>
        ) : (
          <ul className="accusation__list">
            {attached.map((item) => (
              <li key={item.id} className="accusation__item">
                <span>
                  {item.label}{" "}
                  <span className="evidence-list__kind">{KIND_LABEL[item.kind]}</span>
                </span>
                <button onClick={() => onDetach(item.id)} aria-label={`${item.label} entfernen`}>
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="accusation__block">
        <p className="team-code__label">Aus der Akte anhaengen</p>
        {evidence.length === 0 ? (
          <p className="briefing__empty">
            Deine Akte ist leer. Sichere zuerst Beweise im Tatort oder im Forensik-Terminal.
          </p>
        ) : available.length === 0 ? (
          <p className="briefing__empty">Alle Beweise aus der Akte sind angehaengt.</p>
        ) : (
          <ul className="accusation__list">
            {available.map((item) => (
              <li key={item.id} className="accusation__item">
                <span>
                  {item.label}{" "}
                  <span className="evidence-list__kind">{KIND_LABEL[item.kind]}</span>
                </span>
                <button onClick={() => onAttach(item.id)} aria-label={`${item.label} anhaengen`}>
                  Anhaengen
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {missing.length > 0 && (
        <ul className="accusation__missing" aria-live="polite">
          {missing.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}

      {showReview && (
        <div className="accusation__block">
          <p className="team-code__label">Pruefung</p>
          <AccusationReview findings={review} />
        </div>
      )}

      <div className="case-status__actions">
        <button onClick={() => setShowReview((prev) => !prev)} aria-expanded={showReview}>
          {showReview ? "Pruefung ausblenden" : "Anklage pruefen lassen"}
        </button>
        <button
          className="button--primary"
          onClick={submit}
          disabled={missing.length > 0 || sending}
        >
          {sending ? "Wird uebermittelt…" : "Anklage absenden"}
        </button>
      </div>
      {error && (
        <p className="team-code__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
