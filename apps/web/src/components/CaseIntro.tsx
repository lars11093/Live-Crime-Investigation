import { useEffect, useState } from "react";
import type { CaseIntro as Intro } from "@case-zero/shared";
import { LINE_MS, visibleLineCount } from "../lib/intro";

interface Props {
  title: string;
  intro: Intro;
  onDone: () => void;
}

/**
 * Story #58 — stimmungsvoller Einstieg in den Fall.
 *
 * Gibt es das Video unter `intro.videoPath`, laeuft es (stumm, mit
 * Steuerung). TODO Asset: Videos werden in der MVP-Phase nicht committet,
 * deshalb greift fast immer die Titelsequenz aus `intro.lines`. Ueberspringen
 * geht jederzeit, auch mit Escape.
 */
export function CaseIntro({ title, intro, onDone }: Props) {
  const [videoFailed, setVideoFailed] = useState(!intro.videoPath);
  const [elapsed, setElapsed] = useState(0);
  const shown = visibleLineCount(elapsed, intro.lines.length);
  const finished = shown >= intro.lines.length;

  useEffect(() => {
    if (!videoFailed || finished) return;
    const timer = setTimeout(() => setElapsed((prev) => prev + LINE_MS), LINE_MS);
    return () => clearTimeout(timer);
  }, [videoFailed, finished, elapsed]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onDone();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  return (
    <main className="intro" aria-label={`Intro: ${title}`}>
      {videoFailed ? (
        <div className="intro__sequence" aria-live="polite">
          <p className="terminal-title">Eingehender Fall</p>
          {intro.lines.slice(0, shown).map((line, index) => (
            <p key={index} className={`intro__line${index === 0 ? " intro__line--head" : ""}`}>
              {line}
            </p>
          ))}
          {finished && <h1 className="intro__title">{title}</h1>}
        </div>
      ) : (
        <video
          className="intro__video"
          src={intro.videoPath}
          autoPlay
          muted
          controls
          onEnded={onDone}
          onError={() => setVideoFailed(true)}
        />
      )}
      <div className="case-status__actions intro__actions">
        {finished || !videoFailed ? (
          <button className="button--primary" onClick={onDone}>
            Zum Briefing
          </button>
        ) : null}
        <button onClick={onDone}>Intro überspringen</button>
      </div>
    </main>
  );
}
