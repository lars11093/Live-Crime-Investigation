import { ROLES, type Player, type Role } from "@case-zero/shared";
import { ROLE_FOCUS, ROLE_LABEL } from "../lib/roles";

interface Props {
  /** Verbindungs-ID des eigenen Eintrags; die Liste kommt live vom Server (#22). */
  myId: string | undefined;
  players: Player[];
  /** Socket-ID der Teamleitung (#48). */
  leaderId: string | null;
  /** Erst nach dem Beitritt (#22) kann man eine Rolle waehlen. */
  joined: boolean;
  /** Fehler aus dem letzten Versuch, z. B. "Die Rolle ist schon vergeben". */
  error: string | null;
  /** Rolle eines Spielers setzen — die eigene (#31) oder als Teamleitung fuer andere (#48). */
  onAssign: (playerId: string, role: Role | null) => void;
  onBack: () => void;
}

/**
 * Story #31 — im Team eine Rolle waehlen.
 *
 * Alle fuenf Rollen mit dem, was sie exklusiv sehen. Vergebene Rollen zeigen,
 * wer sie hat, und sind fuer alle anderen gesperrt.
 *
 * Story #48 — die Teamleitung vergibt Rollen. Wer das Team leitet, sieht
 * zusaetzlich alle Mitspieler mit einer Rollenauswahl. Die Regel "jede Rolle
 * einmal" gilt auch hier; der Server setzt sie durch.
 */
export function TeamRoles({ myId, players, leaderId, joined, error, onAssign, onBack }: Props) {
  const myRole = players.find((p) => p.id === myId)?.role ?? null;
  const leader = players.find((p) => p.id === leaderId);
  const iAmLeader = joined && myId !== undefined && leaderId === myId;

  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Team · Rollen
        </p>
        <div className="case-status__actions" style={{ margin: 0 }}>
          <button onClick={onBack}>Zurueck zur Fallakte</button>
        </div>
      </div>

      <p className="case-status__hint">
        {myRole ? (
          <>
            Deine Rolle: <strong>{ROLE_LABEL[myRole]}</strong>
          </>
        ) : (
          "Du hast noch keine Rolle. Waehle, welchen Teil der Ermittlung du uebernimmst."
        )}
        {leader && (
          <>
            {" "}
            &middot; Teamleitung: <strong>{leader.id === myId ? "du" : leader.name}</strong>
          </>
        )}
      </p>

      {!joined ? (
        <p className="briefing__empty">Tritt zuerst in der Fallakte dem Team bei.</p>
      ) : (
        <>
          {iAmLeader && (
            <div className="team-assign">
              <p className="team-code__label">Rollen vergeben · {players.length} im Team</p>
              <ul className="team-assign__list">
                {players.map((player) => (
                  <li key={player.id} className="team-assign__row">
                    <label htmlFor={`assign-${player.id}`}>
                      {player.name}
                      {player.id === myId && " (du)"}
                    </label>
                    <select
                      id={`assign-${player.id}`}
                      value={player.role ?? ""}
                      onChange={(e) => onAssign(player.id, (e.target.value || null) as Role | null)}
                    >
                      <option value="">— keine Rolle —</option>
                      {ROLES.map((role) => {
                        const holder = players.find((p) => p.role === role);
                        const takenByOther = Boolean(holder && holder.id !== player.id);
                        return (
                          <option key={role} value={role} disabled={takenByOther}>
                            {ROLE_LABEL[role]}
                            {takenByOther ? ` (${holder!.name})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ul className="role-list">
            {ROLES.map((role) => {
              const holder = players.find((p) => p.role === role);
              const mine = holder?.id === myId;
              return (
                <li key={role} className={`role-card${mine ? " role-card--mine" : ""}`}>
                  <span className="role-card__name">{ROLE_LABEL[role]}</span>
                  <span className="role-card__focus">{ROLE_FOCUS[role]}</span>
                  <span className="role-card__holder">
                    {holder ? (mine ? "Das bist du" : `Vergeben an ${holder.name}`) : "Frei"}
                  </span>
                  {mine ? (
                    <button onClick={() => onAssign(myId!, null)}>Rolle abgeben</button>
                  ) : (
                    <button
                      className={holder ? "" : "button--primary"}
                      disabled={Boolean(holder) || !myId}
                      onClick={() => onAssign(myId!, role)}
                    >
                      {holder ? "Vergeben" : "Diese Rolle uebernehmen"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {error && (
        <p className="team-code__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
