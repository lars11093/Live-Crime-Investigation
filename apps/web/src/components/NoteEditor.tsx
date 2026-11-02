import { useEffect, useState } from "react";

interface Props {
  /** Fuer die Zuordnung von Label und Feld. */
  evidenceId: string;
  /** Gespeicherte Notiz, leer wenn keine da ist (#12). */
  note: string;
  /** Wann die Notiz zuletzt gespeichert wurde (#38). */
  editedAt?: string;
  /** Leerer Text loescht die Notiz (siehe setNote). */
  onSave: (text: string) => void;
}

function formatEditedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("de-CH", { dateStyle: "short", timeStyle: "short" });
}

/**
 * Story #12 — Notiz zu einem Beweis; Story #38 — eine bestehende Notiz bearbeiten.
 *
 * Ohne Notiz: direkt ein Eingabefeld. Mit Notiz: zuerst die Notiz zum Lesen,
 * dann "Bearbeiten" — mit "Abbrechen", das den gespeicherten Stand
 * zurueckholt, und "Loeschen". So wird eine Ueberlegung nicht aus Versehen
 * ueberschrieben, wenn man den Beweis nur ansehen will.
 */
export function NoteEditor({ evidenceId, note, editedAt, onSave }: Props) {
  const [editing, setEditing] = useState(!note);
  const [draft, setDraft] = useState(note);
  const [saved, setSaved] = useState(false);

  // Nur beim Wechsel auf einen anderen Beweis zuruecksetzen — nicht, wenn sich
  // die Notiz durch das eigene Speichern aendert, sonst verschwaende
  // "Gespeichert" sofort wieder.
  useEffect(() => {
    setDraft(note);
    setEditing(!note);
    setSaved(false);
  }, [evidenceId]);

  const dirty = draft.trim() !== note.trim();
  const fieldId = `note-${evidenceId}`;

  function save() {
    onSave(draft);
    setSaved(true);
    setEditing(!draft.trim());
  }

  function cancel() {
    setDraft(note);
    setEditing(!note);
  }

  function remove() {
    onSave("");
    setDraft("");
    setSaved(false);
    setEditing(true);
  }

  if (!editing) {
    return (
      <div className="evidence-note">
        <p className="team-code__label">Meine Notiz</p>
        <p className="evidence-note__text">{note}</p>
        {editedAt && formatEditedAt(editedAt) && (
          <p className="evidence-note__meta">Zuletzt geaendert {formatEditedAt(editedAt)}</p>
        )}
        <div className="case-status__actions">
          <button onClick={() => setEditing(true)}>Bearbeiten</button>
          <button onClick={remove}>Loeschen</button>
          {saved && (
            <span className="evidence-note__saved" role="status">
              Gespeichert
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="evidence-note">
      <label className="team-code__label" htmlFor={fieldId}>
        {note ? "Notiz bearbeiten" : "Meine Notiz"}
      </label>
      <textarea
        id={fieldId}
        className="evidence-note__input"
        value={draft}
        rows={4}
        placeholder="Was faellt dir an diesem Beweis auf?"
        autoFocus={Boolean(note)}
        onChange={(e) => {
          setDraft(e.target.value);
          setSaved(false);
        }}
      />
      <div className="case-status__actions">
        <button className="button--primary" onClick={save} disabled={!dirty}>
          {note ? "Aenderungen speichern" : "Notiz speichern"}
        </button>
        {note && <button onClick={cancel}>Abbrechen</button>}
      </div>
    </div>
  );
}
