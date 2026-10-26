import type { CrimeWindow, Suspect } from "@case-zero/shared";
import { AlibiCheck } from "./AlibiCheck";
import type { AlibiVerdict } from "../lib/alibi";
import { SuspectPortrait } from "./SuspectPortrait";
import { StatementView } from "./StatementView";

interface Props {
  suspect: Suspect;
  /** Satznummern der markierten Widersprueche dieser Person (#17). */
  markedIndices: number[];
  onToggleSentence: (sentenceIndex: number, text: string) => void;
  /** Tatzeitfenster aus dem Briefing, fuer die Alibi-Pruefung (#42). */
  crimeWindow?: CrimeWindow;
  alibiVerdict?: AlibiVerdict;
  onAlibiVerdict: (verdict: AlibiVerdict) => void;
  onBack: () => void;
}

/**
 * Story #15 — das Profil eines Verdaechtigen.
 * Name, Alter, Beziehung zum Opfer und — sofern bekannt — das Motiv.
 *
 * `knownMotive` ist das oeffentlich bekannte Motiv, nicht die Loesung: die
 * steht in `Scenario` und verlaesst den Server nie (engine/caseView.ts).
 */
export function SuspectProfile({
  suspect,
  markedIndices,
  onToggleSentence,
  crimeWindow,
  alibiVerdict,
  onAlibiVerdict,
  onBack,
}: Props) {
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

      <StatementView
        statement={suspect.statement}
        markedIndices={markedIndices}
        onToggleSentence={onToggleSentence}
      />

      <AlibiCheck
        statement={suspect.statement}
        crimeWindow={crimeWindow}
        verdict={alibiVerdict}
        onVerdict={onAlibiVerdict}
      />
    </section>
  );
}
