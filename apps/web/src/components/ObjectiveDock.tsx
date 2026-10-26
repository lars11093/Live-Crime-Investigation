import { useEffect, useState } from "react";

interface Props {
  /** Das Ermittlungsziel aus dem Fall (#32). Fehlt es, steht ein Hinweis da. */
  objective?: string;
}

/**
 * Story #32 — das Ermittlungsziel jederzeit einsehen.
 *
 * Ein fester Knopf am Bildschirmrand, in jeder Ansicht des Falls — auch im
 * Tatort, der den ganzen Bildschirm fuellt. Ein Klick klappt das Ziel auf,
 * Escape oder ein zweiter Klick wieder zu.
 */
export function ObjectiveDock({ objective }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="objective-dock">
      {open && (
        <div className="objective-dock__panel" id="objective-panel" role="region" aria-label="Ermittlungsziel">
          <p className="terminal-title" style={{ margin: 0 }}>
            Ermittlungsziel
          </p>
          <p className="objective-dock__text">
            {objective ?? "Fuer diesen Fall ist kein Ermittlungsziel hinterlegt."}
          </p>
        </div>
      )}
      <button
        className="objective-dock__toggle"
        aria-expanded={open}
        aria-controls="objective-panel"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "Ziel ausblenden" : "◎ Ziel"}
      </button>
    </div>
  );
}
