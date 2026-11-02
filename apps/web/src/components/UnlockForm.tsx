import { useState } from "react";
import type { Device } from "@case-zero/shared";

interface Props {
  device: Device;
  /** Liefert `null` bei Erfolg, sonst die Meldung fuer den Spieler. */
  onUnlock: (secret: string) => Promise<string | null>;
}

/**
 * Story #70 — PIN oder Passwort eingeben.
 *
 * Bei einer PIN nimmt das Feld nur Ziffern an. Ob der Versuch stimmt,
 * entscheidet der Server; hier steht nur die Eingabe und seine Antwort.
 */
export function UnlockForm({ device, onUnlock }: Props) {
  const isPin = /pin/i.test(device.lockType ?? "");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fieldId = `unlock-${device.id}`;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!secret.trim()) return;
    setSending(true);
    const problem = await onUnlock(secret);
    setSending(false);
    setError(problem);
    if (problem) setSecret("");
  }

  return (
    <form className="unlock" onSubmit={submit}>
      <label className="team-code__label" htmlFor={fieldId}>
        {isPin ? "PIN eingeben" : "Passwort eingeben"}
      </label>
      <div className="unlock__row">
        <input
          id={fieldId}
          className="unlock__input"
          type={isPin ? "text" : "password"}
          inputMode={isPin ? "numeric" : undefined}
          maxLength={isPin ? 4 : 64}
          autoComplete="off"
          value={secret}
          onChange={(e) => {
            setSecret(isPin ? e.target.value.replace(/\D/g, "") : e.target.value);
            setError(null);
          }}
        />
        <button type="submit" disabled={sending || !secret.trim()}>
          {sending ? "Pruefe …" : "Entsperren"}
        </button>
      </div>
      {device.lockHint && <p className="unlock__hint">Hinweis: {device.lockHint}</p>}
      {error && (
        <p className="team-code__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
