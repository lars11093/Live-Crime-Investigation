import { useState, type FormEvent } from "react";
import { NAME_MAX, validateName, type Account } from "../lib/account";

interface Props {
  account: Account | null;
  onLogin: (name: string) => void;
  /**
   * Konto mit Passwort erstellen oder anmelden (#55). Liefert `null` bei
   * Erfolg, sonst die Meldung fuer den Spieler.
   */
  onServerAccount: (mode: "register" | "login", name: string, password: string) => Promise<string | null>;
  onLogout: () => void;
}

/**
 * Story #29 — anmelden; Story #55 — Konto erstellen.
 *
 * Nur mit Namen bleibt alles wie bei #29: Der Fortschritt haengt am Namen in
 * diesem Browser. Mit Passwort entsteht ein Konto auf dem Server, und der
 * Fortschritt laesst sich auf jedem Geraet wieder laden.
 */
export function AccountBar({ account, onLogin, onServerAccount, onLogout }: Props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent, mode: "local" | "register" | "login") {
    event.preventDefault();
    const problem = validateName(name);
    if (problem) {
      setError(problem);
      return;
    }
    if (mode === "local") {
      setError(null);
      onLogin(name);
      setName("");
      return;
    }
    setBusy(true);
    const result = await onServerAccount(mode, name, password);
    setBusy(false);
    setError(result);
    if (!result) {
      setName("");
      setPassword("");
    }
  }

  if (account) {
    return (
      <div className="account-bar">
        <span>
          Angemeldet als <strong>{account.name}</strong>
          {account.token ? " · Konto, Fortschritt auf jedem Gerät" : " · nur in diesem Browser"}
        </span>
        <button onClick={onLogout}>Abmelden</button>
      </div>
    );
  }

  return (
    <form className="account-bar" onSubmit={(e) => submit(e, password ? "login" : "local")}>
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
        <input
          aria-label="Passwort (optional)"
          type="password"
          value={password}
          placeholder="Passwort (optional)"
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={!name.trim() || busy}>
          Anmelden
        </button>
        <button
          type="button"
          disabled={!name.trim() || !password || busy}
          onClick={(e) => submit(e, "register")}
        >
          Konto erstellen
        </button>
      </div>
      {error ? (
        <p className="team-code__error" role="alert">
          {error}
        </p>
      ) : (
        <p className="team-code__hint">
          Nur mit Namen bleibt dein Fortschritt in diesem Browser. Mit Passwort entsteht ein Konto, und
          deine Fälle sind auf jedem Gerät gespeichert.
        </p>
      )}
    </form>
  );
}
