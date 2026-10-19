import { useNavigate } from "react-router-dom";

/**
 * Story #1 — Startseite.
 * Erste Ansicht beim Öffnen des Spiels: Titel, ein Satz Kurzbeschreibung und
 * der Einstieg in den Fall. Alles ohne Scrollen sichtbar (siehe .start-screen).
 */
export function StartPage() {
  const navigate = useNavigate();

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

        <button
          className="button--primary"
          onClick={() => navigate("/fall")}
        >
          Fall starten
        </button>

        <p className="start-screen__hint">
          Modul 426 · TBZ · Prototyp
        </p>
      </div>
    </main>
  );
}
