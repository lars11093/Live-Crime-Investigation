import { useState, type FormEvent } from "react";
import { NAME_MAX, validateName, type Account } from "../lib/account";

interface Props {
  account: Account | null;
  onLogin: (name: string) => void;
  onLogout: () => void;
}

/**
 * Story #29 — anmelden.
 *
 * Angemeldet: Name und "Abmelden". Sonst ein Feld fuer den Ermittlernamen.
 * Ohne Anmeldung spielt man als Gast weiter; der Fortschritt haengt dann nur
 * am Team-Code, wie vor #29.
 */
export function AccountBar({ account, onLogin, onLogout }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const problem = validateName(name);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    onLogin(name);
    setName("");
  }

  if (account) {
    return (
      <div className="account-bar">
        <span>
          Angemeldet als <strong>{account.name}</strong>
        </span>
        <button onClick={onLogout}>Abmelden</button>
      </div>
    );
  }

  return (
    <form className="account-bar" onSubmit={submit}>
      <label className="team-code__label" htmlFor="account-name">
        Ermittlername
      </label>
      <div className="team-code__row">
        <input
          id="account-name"
          value={name}
          maxLength={NAME_MAX}
          placeholder="z. B. Kommissarin Frei"
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" disabled={!name.trim()}>
          Anmelden
        </button>
      </div>
      {error ? (
        <p className="team-code__error" role="alert">
          {error}
        </p>
      ) : (
        <p className="team-code__hint">
          Angemeldet wird dein Fortschritt deinem Namen zugeordnet. Ohne Anmeldung spielst du als
          Gast.
        </p>
      )}
    </form>
  );
}
