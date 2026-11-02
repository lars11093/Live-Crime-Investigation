import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TeamCodeForm } from "../components/TeamCodeForm";
import { AccountBar } from "../components/AccountBar";
import { loadAccount, login, logout, rememberServerAccount, type Account } from "../lib/account";
import { accountRequest } from "../lib/api";
import { browserStorage } from "../lib/caseProgress";
import { loadSavedTeam } from "../lib/savedTeam";
import { rememberName } from "../lib/team";

/**
 * Story #1 — Startseite.
 * Erste Ansicht beim Öffnen des Spiels: Titel, ein Satz Kurzbeschreibung und
 * der Einstieg in den Fall. Alles ohne Scrollen sichtbar (siehe .start-screen).
 */
export function StartPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(() => loadAccount(browserStorage()));
  // Zuletzt genutztes Team (#57) — ein Klick, und man ist wieder drin.
  const [savedTeam] = useState(() => loadSavedTeam(browserStorage()));

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
          onServerAccount={async (mode, name, password) => {
            try {
              const result = await accountRequest(mode, name, password);
              if (!result.ok) return result.error;
              setAccount(rememberServerAccount(browserStorage(), result.account.name, result.token));
              return null;
            } catch {
              return "Server nicht erreichbar. Bitte erneut versuchen.";
            }
          }}
          onLogout={() => {
            logout(browserStorage());
            setAccount(null);
          }}
        />

        {/* Ein Fall wird jetzt aus der Uebersicht gewaehlt (#30); dort entsteht die Team-Session (#5). */}
        <button className="button--primary" onClick={() => navigate("/faelle")}>
          Fall starten
        </button>

        <div className="start-screen__divider">
          <span>oder einem Team beitreten</span>
        </div>

        {savedTeam && (
          <button
            onClick={() => {
              rememberName(savedTeam.code, savedTeam.name);
              navigate(`/fall/${savedTeam.code}`);
            }}
          >
            Zurück zu deinem Team {savedTeam.code} (als {savedTeam.name})
          </button>
        )}

        <TeamCodeForm onJoined={(code) => navigate(`/fall/${code}`)} />

        <p className="start-screen__hint">
          Modul 426 · TBZ · Prototyp
        </p>
      </div>
    </main>
  );
}
