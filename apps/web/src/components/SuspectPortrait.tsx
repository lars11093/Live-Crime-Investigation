import { useState } from "react";
import type { Suspect } from "@case-zero/shared";

/** Initialen als Platzhalter, wenn kein Portraet vorliegt. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Portraet eines Verdaechtigen (#14).
 * Ohne Asset — und das ist in der MVP-Phase der Normalfall — stehen die
 * Initialen da, nicht ein gebrochenes Bildsymbol.
 */
export function SuspectPortrait({
  suspect,
  size = "small",
}: {
  suspect: Suspect;
  size?: "small" | "large";
}) {
  const [failed, setFailed] = useState(!suspect.imagePath);
  const className = `suspect__portrait${size === "large" ? " suspect__portrait--large" : ""}`;

  if (failed) {
    return (
      <span className={`${className} suspect__portrait--placeholder`} aria-hidden="true">
        {initials(suspect.name)}
      </span>
    );
  }
  return (
    <img className={className} src={suspect.imagePath} alt="" onError={() => setFailed(true)} />
  );
}
