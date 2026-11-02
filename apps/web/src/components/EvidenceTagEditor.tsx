import { useState } from "react";
import { TAG_MAX_LENGTH } from "../lib/evidenceTags";

interface Props {
  tags: string[];
  /** Bereits vergebene Tags anderer Beweise — als Vorschläge. */
  suggestions: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

/** Story #62 — eigene Tags an einem Beweis vergeben und entfernen. */
export function EvidenceTagEditor({ tags, suggestions, onAdd, onRemove }: Props) {
  const [draft, setDraft] = useState("");
  const offered = suggestions.filter((s) => !tags.includes(s));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft("");
  }

  return (
    <section className="panel evidence-tags">
      <p className="terminal-title">Meine Tags</p>
      {tags.length === 0 ? (
        <p className="briefing__empty">Noch keine Tags. Ordne den Beweis nach deiner eigenen Logik.</p>
      ) : (
        <ul className="evidence-tags__list">
          {tags.map((tag) => (
            <li key={tag} className="evidence-tags__tag">
              #{tag}
              <button aria-label={`Tag ${tag} entfernen`} onClick={() => onRemove(tag)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="unlock__row" onSubmit={submit}>
        <input
          aria-label="Neuer Tag"
          placeholder="z. B. alibi, tatzeit, monica"
          maxLength={TAG_MAX_LENGTH + 1}
          value={draft}
          list="evidence-tag-suggestions"
          onChange={(e) => setDraft(e.target.value)}
        />
        <datalist id="evidence-tag-suggestions">
          {offered.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
        <button type="submit" disabled={!draft.trim()}>
          Tag hinzufügen
        </button>
      </form>
    </section>
  );
}
