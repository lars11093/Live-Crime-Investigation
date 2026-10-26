import { useState } from "react";
import type { Suspect } from "@case-zero/shared";
import { searchStatements } from "../lib/statementSearch";

interface Props {
  suspects: Suspect[];
  /** Oeffnet das Profil der Person (#15). */
  onOpen: (suspectId: string) => void;
}

/**
 * Story #41 — Aussagen nach Stichwort filtern.
 *
 * Ein Suchfeld ueber alle Aussagen. Treffer sind ganze Saetze mit markiertem
 * Stichwort; ein Klick auf den Namen oeffnet das Profil mit der vollen Aussage.
 */
export function StatementSearch({ suspects, onOpen }: Props) {
  const [query, setQuery] = useState("");
  const hits = searchStatements(suspects, query);
  const searching = query.trim().length > 0;

  return (
    <section className="panel statement-search">
      <p className="terminal-title">Aussagen durchsuchen</p>
      <input
        type="search"
        className="evidence-filter__query"
        placeholder="Stichwort oder Uhrzeit, z. B. 22:40"
        aria-label="Aussagen durchsuchen"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {searching && (
        <p className="case-status__hint" aria-live="polite">
          {hits.length === 0
            ? "Kein Satz in den Aussagen passt zu diesem Stichwort."
            : `${hits.length} ${hits.length === 1 ? "Satz" : "Saetze"} gefunden`}
        </p>
      )}

      {hits.length > 0 && (
        <ul className="statement-search__hits">
          {hits.map((hit) => (
            <li key={`${hit.suspectId}:${hit.sentenceIndex}`} className="statement-search__hit">
              <button className="statement-search__who" onClick={() => onOpen(hit.suspectId)}>
                {hit.suspectName}
              </button>
              <span>
                {hit.segments.map((segment, index) =>
                  segment.hit ? (
                    <mark key={index} className="statement-search__mark">
                      {segment.text}
                    </mark>
                  ) : (
                    <span key={index}>{segment.text}</span>
                  )
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
