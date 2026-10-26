import { ROLES, type Role, type TeamView } from "@case-zero/shared";
import { ROLE_FOCUS, ROLE_LABEL, type PlayerIdentity } from "../lib/player";

interface Props {
  me: PlayerIdentity;
  team: TeamView | null;
  /** Fehler aus dem letzten Versuch, z. B. "Die Rolle ist schon vergeben". */
  error: string | null;
  onChoose: (role: Role | null) => void;
  onRefresh: () => void;
  onBack: () => void;
}

/**
 * Story #31 — im Team eine Rolle waehlen.
 *
 * Alle fuenf Rollen mit dem, was sie exklusiv sehen. Vergebene Rollen zeigen,
 * wer sie hat, und sind fuer alle anderen gesperrt.
 */
export function TeamRoles({ me, team, error, onChoose, onRefresh, onBack }: Props) {
  const players = team?.players ?? [];
  const myRole = players.find((p) => p.id === me.id)?.role ?? null;

  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Team · Rollen
        </p>
        <div className="case-status__actions" style={{ margin: 0 }}>
          <button onClick={onRefresh}>Aktualisieren</button>
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
      </p>

      {!team ? (
        <p className="briefing__empty">Team wird geladen&hellip;</p>
      ) : (
        <ul className="role-list">
          {ROLES.map((role) => {
            const holder = players.find((p) => p.role === role);
            const mine = holder?.id === me.id;
            return (
              <li key={role} className={`role-card${mine ? " role-card--mine" : ""}`}>
                <span className="role-card__name">{ROLE_LABEL[role]}</span>
                <span className="role-card__focus">{ROLE_FOCUS[role]}</span>
                <span className="role-card__holder">
                  {holder ? (mine ? "Das bist du" : `Vergeben an ${holder.name}`) : "Frei"}
                </span>
                {mine ? (
                  <button onClick={() => onChoose(null)}>Rolle abgeben</button>
                ) : (
                  <button
                    className={holder ? "" : "button--primary"}
                    disabled={Boolean(holder)}
                    onClick={() => onChoose(role)}
                  >
                    {holder ? "Vergeben" : "Diese Rolle uebernehmen"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p className="team-code__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
