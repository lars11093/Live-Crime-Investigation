import { useState, type FormEvent } from "react";
import { isValidRoomCode, normalizeRoomCode, findRoom } from "../lib/api";

interface Props {
  onJoined: (code: string) => void;
}

/**
 * Story #5 — Team-Code eingeben.
 *
 * Kleinbuchstaben werden beim Tippen gross dargestellt; der Button bleibt bei
 * leerem Feld deaktiviert. Falsches Format und unbekannter Code fuehren zur
 * selben Meldung — fuer den Spieler ist beides "der Code stimmt nicht" — und
 * die Eingabe bleibt stehen, damit man den Tippfehler sieht.
 */
export function TeamCodeForm({ onJoined }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const normalized = normalizeRoomCode(code);
  const isEmpty = normalized.length === 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (isEmpty || checking) return;

    setChecking(true);
    setError(null);
    try {
      const room = await findRoom(normalized);
      if (room) {
        onJoined(room.code);
      } else {
        setError("Ungueltiger Team-Code");
      }
    } catch {
      // Server nicht erreichbar ist kein falscher Code — sonst sucht jemand
      // einen Tippfehler, den es nicht gibt.
      setError("Server nicht erreichbar. Bitte erneut versuchen.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <form className="team-code" onSubmit={submit} noValidate>
      <label className="team-code__label" htmlFor="team-code-input">
        Team-Code
      </label>
      <div className="team-code__row">
        <input
          id="team-code-input"
          className="team-code__input"
          value={normalized}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          placeholder="XXX-XXX"
          maxLength={7}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error !== null}
          aria-describedby={error ? "team-code-error" : undefined}
        />
        <button type="submit" disabled={isEmpty || checking}>
          {checking ? "Pruefe…" : "Beitreten"}
        </button>
      </div>
      {error && (
        <p className="team-code__error" id="team-code-error" role="alert">
          {error}
        </p>
      )}
      {!error && !isValidRoomCode(normalized) && !isEmpty && (
        <p className="team-code__hint">Format: drei Zeichen, Bindestrich, drei Zeichen</p>
      )}
    </form>
  );
}
