import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LeaderboardEntry } from "@case-zero/shared";
import { accountIdFor, loadAccount } from "../lib/account";
import { fetchLeaderboard } from "../lib/api";
import { browserStorage } from "../lib/caseProgress";

type LoadState = { status: "loading" } | { status: "error" } | { status: "ready"; entries: LeaderboardEntry[] };

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Story #77 — vergleicht die persönlichen Bestwerte der Server-Konten. */
export function LeaderboardPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const account = loadAccount(browserStorage());
  const ownName = account ? accountIdFor(account.name) : null;

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard()
      .then((entries) => {
        if (!cancelled) setState({ status: "ready", entries });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app-shell leaderboard">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Ermittlungs-Rangliste
        </p>
        <button onClick={() => navigate("/")}>Zur Startseite</button>
      </div>

      <h1 className="case-title">Die besten Ermittlungsergebnisse</h1>
      <p className="leaderboard__intro">
        Pro Konto und Fall zählt der persönliche Bestwert. Ein Ergebnis wird nach der Anklage automatisch
        gespeichert.
      </p>

      {!account?.token && (
        <p className="leaderboard__account-note">
          Für einen Eintrag brauchst du ein Server-Konto mit Passwort. Melde dich auf der Startseite an oder
          erstelle dort ein Konto.
        </p>
      )}

      {state.status === "loading" && <p className="panel">Rangliste wird geladen …</p>}
      {state.status === "error" && (
        <div className="panel leaderboard__message" role="alert">
          <p>Die Rangliste ist gerade nicht erreichbar.</p>
          <button onClick={() => window.location.reload()}>Erneut laden</button>
        </div>
      )}
      {state.status === "ready" && state.entries.length === 0 && (
        <p className="panel leaderboard__message">
          Noch keine Ergebnisse. Melde dich mit einem Server-Konto an und schliesse einen Fall ab.
        </p>
      )}
      {state.status === "ready" && state.entries.length > 0 && (
        <ol className="leaderboard__list" aria-label="Rangliste nach Punkten">
          {state.entries.map((entry, index) => {
            const isOwn = Boolean(ownName && account?.token && accountIdFor(entry.playerName) === ownName);
            return (
              <li
                key={`${entry.caseId}:${entry.playerName}`}
                className={`leaderboard__entry${isOwn ? " leaderboard__entry--own" : ""}`}
              >
                <span className="leaderboard__position" aria-label={`Rang ${index + 1}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="leaderboard__details">
                  <strong className="leaderboard__name">
                    {entry.playerName}
                    {isOwn && <span className="leaderboard__you"> · DU</span>}
                  </strong>
                  <span className="leaderboard__case">{entry.caseTitle}</span>
                  <span className="leaderboard__rank">{entry.scoreRank} · {formatDate(entry.achievedAt)}</span>
                </div>
                <strong className="leaderboard__score">
                  {entry.points.toLocaleString("de-CH")}
                  <span> / {entry.maxPoints.toLocaleString("de-CH")}</span>
                </strong>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
