import type { Suspect } from "@case-zero/shared";
import { SuspectPortrait } from "./SuspectPortrait";

interface Props {
  suspect: Suspect;
  onBack: () => void;
}

/**
 * Story #14 — das Profil, in das die Liste fuehrt.
 * Zeigt hier nur Name und Portraet; Alter, Beziehung zum Opfer und Motiv
 * kommen mit #15, die Aussage mit #16.
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
    </section>
  );
}
