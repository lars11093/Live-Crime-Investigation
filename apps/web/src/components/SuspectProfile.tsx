import type { Suspect } from "@case-zero/shared";
import { SuspectPortrait } from "./SuspectPortrait";
import { StatementView } from "./StatementView";

interface Props {
  suspect: Suspect;
  onBack: () => void;
}

/**
 * Story #15 — das Profil eines Verdaechtigen.
 * Name, Alter, Beziehung zum Opfer und — sofern bekannt — das Motiv.
 *
 * `knownMotive` ist das oeffentlich bekannte Motiv, nicht die Loesung: die
 * steht in `Scenario` und verlaesst den Server nie (engine/caseView.ts).
 */
export function SuspectProfile({ suspect, onBack }: Props) {
  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Verdaechtiger
        </p>
        <button onClick={onBack}>Zurueck zur Liste</button>
      </div>

      <div className="suspect-profile__head">
        <SuspectPortrait suspect={suspect} size="large" />
        <div>
          <h1 className="evidence-detail__title" style={{ margin: 0 }}>
            {suspect.name}
          </h1>
        </div>
      </div>

      <dl className="briefing__facts">
        <div>
          <dt>Alter</dt>
          <dd>{suspect.age} Jahre</dd>
        </div>
        <div>
          <dt>Beziehung zum Opfer</dt>
          <dd>{suspect.relationToVictim}</dd>
        </div>
      </dl>

      <div className="suspect-profile__motive">
        <p className="team-code__label" style={{ marginBottom: "0.4rem" }}>
          Bekanntes Motiv
        </p>
        {suspect.knownMotive ? (
          <p className="suspect-profile__motive-text">{suspect.knownMotive}</p>
        ) : (
          <p className="briefing__empty" style={{ margin: 0 }}>
            Kein Motiv bekannt
          </p>
        )}
      </div>

      <StatementView statement={suspect.statement} />
    </section>
  );
}
