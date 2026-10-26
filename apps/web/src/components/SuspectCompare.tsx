import { useState } from "react";
import type { Suspect } from "@case-zero/shared";
import type { Contradiction } from "../lib/caseProgress";
import { compareSuspects, sharedTimes } from "../lib/suspectCompare";
import { SuspectPortrait } from "./SuspectPortrait";

interface Props {
  suspects: Suspect[];
  contradictions: Contradiction[];
}

/**
 * Story #40 — zwei Verdaechtige nebeneinander vergleichen.
 *
 * Zwei Auswahlfelder, darunter eine Tabelle mit den Angaben beider Personen.
 * Zeilen, in denen sie sich unterscheiden, sind hervorgehoben; Uhrzeiten, die
 * beide nennen, stehen extra darunter.
 */
export function SuspectCompare({ suspects, contradictions }: Props) {
  const [leftId, setLeftId] = useState(suspects[0]?.id ?? "");
  const [rightId, setRightId] = useState(suspects[1]?.id ?? "");

  if (suspects.length < 2) return null;

  const left = suspects.find((s) => s.id === leftId);
  const right = suspects.find((s) => s.id === rightId);

  const picker = (value: string, onChange: (id: string) => void, other: string, label: string) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      {suspects.map((s) => (
        <option key={s.id} value={s.id} disabled={s.id === other}>
          {s.name}
        </option>
      ))}
    </select>
  );

  return (
    <section className="panel suspect-compare">
      <p className="terminal-title">Verdaechtige vergleichen</p>

      {left && right ? (
        <>
          <table className="suspect-compare__table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="visually-hidden">Angabe</span>
                </th>
                <th scope="col">
                  <SuspectPortrait suspect={left} />
                  {picker(leftId, setLeftId, rightId, "Erste Person")}
                </th>
                <th scope="col">
                  <SuspectPortrait suspect={right} />
                  {picker(rightId, setRightId, leftId, "Zweite Person")}
                </th>
              </tr>
            </thead>
            <tbody>
              {compareSuspects(left, right, contradictions).map((row) => (
                <tr key={row.label} className={row.differs ? "suspect-compare__row--differs" : ""}>
                  <th scope="row">
                    {row.label}
                    {row.differs && <span className="visually-hidden"> (unterschiedlich)</span>}
                  </th>
                  <td>{row.left}</td>
                  <td>{row.right}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">Aussage</th>
                <td className="suspect-compare__statement">{left.statement ?? "Keine Aussage"}</td>
                <td className="suspect-compare__statement">{right.statement ?? "Keine Aussage"}</td>
              </tr>
            </tbody>
          </table>

          {sharedTimes(left, right).length > 0 && (
            <p className="case-status__hint">
              Beide nennen: <strong>{sharedTimes(left, right).join(", ")}</strong> — waren sie zur
              selben Zeit am selben Ort?
            </p>
          )}
        </>
      ) : (
        <p className="briefing__empty">Waehle zwei Personen aus.</p>
      )}
    </section>
  );
}
