import { useState, type FormEvent } from "react";
import type { Player } from "@case-zero/shared";
import { MAX_NAME_LENGTH } from "../lib/team";

interface Props {
  /** Eigener Name — leer, solange man noch nicht beigetreten ist. */
  name: string;
  players: Player[];
  /** Verbindungs-ID des eigenen Eintrags, damit er hervorgehoben werden kann. */
  myId: string | undefined;
  error: string | null;
  onJoin: (name: string) => void;
}

/**
 * Story #22 — sehen, wer im Team ist.
 *
 * Ohne Namen zuerst das Namensfeld, danach die Liste. Der eigene Eintrag ist
 * hervorgehoben und mit "du" markiert; die Liste kommt live vom Server und
 * aendert sich, sobald jemand beitritt oder geht.
 */
export function TeamPanel({ name, players, myId, error, onJoin }: Props) {
  const [draft, setDraft] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    onJoin(draft);
  }

  return (
    <section className="panel team">
      <p className="terminal-title" style={{ margin: 0 }}>
        Team · {players.length}
      </p>

      {!name ? (
        <form className="team-code" onSubmit={submit} noValidate>
          <label className="team-code__label" htmlFor="team-name-input">
            Dein Name
          </label>
          <div className="team-code__row">
            <input
              id="team-name-input"
              className="team-code__input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="z. B. Loris"
              maxLength={MAX_NAME_LENGTH}
              autoComplete="nickname"
              aria-invalid={error !== null}
            />
            <button type="submit" disabled={!draft.trim()}>
              Dem Team beitreten
            </button>
          </div>
          <p className="case-status__hint" style={{ margin: 0 }}>
            Mit deinem Namen sieht dein Team, dass du mitermittelst.
          </p>
        </form>
      ) : null}

      {error && (
        <p className="team-code__error" role="alert">
          {error}
        </p>
      )}

      {players.length === 0 ? (
        <p className="evidence-list__empty">
          {name ? "Verbinde mit dem Team…" : "Noch niemand beigetreten."}
        </p>
      ) : (
        <ul className="team__list">
          {players.map((player) => {
            const isMe = player.id === myId;
            return (
              <li key={player.id} className={`team__member${isMe ? " team__member--me" : ""}`}>
                <span className="team__name">{player.name}</span>
                {isMe && <span className="team__you">du</span>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
