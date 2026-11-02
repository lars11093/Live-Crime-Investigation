import { useEffect, useState } from "react";
import type { HintState } from "@case-zero/shared";
import { fetchHints, requestHint } from "../lib/api";

interface Props {
  code: string;
}

/**
 * Story #74 — einen Hinweis anfordern, wenn das Team feststeckt.
 *
 * Ein Hinweis gilt für das ganze Team (der Server zählt pro Session). Vor
 * dem Anfordern fragt die Ansicht nach, weil ein Hinweis nicht zurückgeht.
 */
export function HintPanel({ code }: Props) {
  const [state, setState] = useState<HintState | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHints(code)
      .then((s) => !cancelled && setState(s))
      .catch(() => !cancelled && setError("Hinweise sind gerade nicht erreichbar."));
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function request() {
    setConfirming(false);
    try {
      const result = await requestHint(code);
      setState(result.state);
      setError(result.ok ? null : "Es gibt keine weiteren Hinweise.");
    } catch {
      setError("Server nicht erreichbar. Bitte erneut versuchen.");
    }
  }

  if (!state || state.total === 0) return error ? <p className="team-code__error">{error}</p> : null;
  const left = state.total - state.revealed.length;

  return (
    <section className="panel">
      <p className="terminal-title">
        Hinweise · {state.revealed.length} von {state.total} genutzt
      </p>
      {state.revealed.length > 0 && (
        <ol className="hints">
          {state.revealed.map((hint, index) => (
            <li key={index}>{hint}</li>
          ))}
        </ol>
      )}
      {left > 0 &&
        (confirming ? (
          <div className="case-status__actions">
            <span className="case-status__hint">Der Hinweis gilt für das ganze Team. Wirklich anfordern?</span>
            <button className="button--primary" onClick={request}>
              Ja, Hinweis zeigen
            </button>
            <button onClick={() => setConfirming(false)}>Abbrechen</button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)}>Hinweis anfordern ({left} übrig)</button>
        ))}
      {error && (
        <p className="team-code__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
