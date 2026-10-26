import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../lib/api";
import { TeamCodeForm } from "../components/TeamCodeForm";
import { AccountBar } from "../components/AccountBar";
import { loadAccount, login, logout, type Account } from "../lib/account";
import { browserStorage } from "../lib/caseProgress";

/**
 * Story #1 — Startseite.
 * Erste Ansicht beim Öffnen des Spiels: Titel, ein Satz Kurzbeschreibung und
 * der Einstieg in den Fall. Alles ohne Scrollen sichtbar (siehe .start-screen).
 */
export function StartPage() {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(() => loadAccount(browserStorage()));

  async function startCase() {
    setStarting(true);
    setStartError(null);
    try {
      // Ein Fallstart legt eine Team-Session an — der Code ist das, was man
      // den Mitspielern gibt (#5).
      const room = await createRoom("case-01");
      navigate(`/fall/${room.code}`);
    } catch {
      setStartError("Fall konnte nicht gestartet werden. Server nicht erreichbar.");
      setStarting(false);
    }
  }

  return (
    <main className="start-screen">
      <div className="start-screen__inner">
        <p className="terminal-title">Polizei-Terminal · Zugang autorisiert</p>

        <h1 className="start-screen__title">
          CASE<span className="start-screen__slash">//</span>ZERO
        </h1>

        <p className="start-screen__lead">
          Ermittelt gemeinsam in Echtzeit: Jede Rolle sieht einen anderen Teil der Wahrheit —
          nur zusammen lösen wir den Fall.
        </p>

        <AccountBar
          account={account}
          onLogin={(name) => setAccount(login(browserStorage(), name))}
          onLogout={() => {
            logout(browserStorage());
            setAccount(null);
          }}
        />

        <button className="button--primary" onClick={startCase} disabled={starting}>
          {starting ? "Fall wird gestartet…" : "Fall starten"}
        </button>

        {startError && (
          <p className="team-code__error" role="alert">
            {startError}
          </p>
        )}

        <div className="start-screen__divider">
          <span>oder einem Team beitreten</span>
        </div>

        <TeamCodeForm onJoined={(code) => navigate(`/fall/${code}`)} />

        <p className="start-screen__hint">
          Modul 426 · TBZ · Prototyp
        </p>
      </div>
    </main>
  );
}
