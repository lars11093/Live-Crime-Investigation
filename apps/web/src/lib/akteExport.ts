import type { PublicCase } from "@case-zero/shared";
import { KIND_LABEL } from "../components/evidenceKind";
import type { CaseProgress } from "./caseProgress";

/**
 * Story #63 — die eigene Akte als Markdown-Datei.
 *
 * Markdown, weil es ohne Programm lesbar ist und sich trotzdem sauber in
 * Word, Obsidian oder GitHub weiterverwenden lässt. Exportiert wird nur, was
 * der Ermittler selbst weiss — der Fall-Inhalt, den der Server ausgeliefert
 * hat, plus der eigene Fortschritt. Keine Lösung, ausser die Anklage ist
 * schon abgesendet und die Auflösung damit bekannt.
 */
export function exportAkte(
  caseData: Pick<PublicCase, "title" | "briefing" | "suspects">,
  progress: Pick<CaseProgress, "collected" | "notes" | "insights" | "contradictions" | "accusation">,
  roomCode: string,
  now: Date = new Date()
): string {
  const lines: string[] = [];
  const nameOf = (id: string | null) => caseData.suspects.find((s) => s.id === id)?.name ?? "—";

  lines.push(`# Fallakte: ${caseData.title}`, "");
  lines.push(`- Team-Code: ${roomCode}`);
  lines.push(`- Exportiert: ${now.toLocaleString("de-CH")}`);
  if (caseData.briefing) {
    lines.push(`- Tatort: ${caseData.briefing.location}`);
    lines.push(`- Tatzeit: ${caseData.briefing.timeOfCrime}`);
  }
  lines.push("");

  lines.push(`## Beweise (${progress.collected.length})`, "");
  if (progress.collected.length === 0) lines.push("_Noch nichts gesichert._", "");
  for (const item of progress.collected) {
    lines.push(`### ${item.label}`);
    lines.push(`- Art: ${KIND_LABEL[item.kind]}`);
    lines.push(`- Fundort: ${item.foundAt.sceneName} · ${item.foundAt.hotspotLabel}`);
    lines.push("", item.description);
    const note = progress.notes[item.id];
    if (note) lines.push("", `> Notiz: ${note.replace(/\n/g, "\n> ")}`);
    lines.push("");
  }

  lines.push(`## Erkenntnisse (${progress.insights.length})`, "");
  if (progress.insights.length === 0) lines.push("_Noch keine Verknüpfung aufgedeckt._");
  for (const insight of progress.insights) lines.push(`- **${insight.title}:** ${insight.body}`);
  lines.push("");

  lines.push(`## Markierte Widersprüche (${progress.contradictions.length})`, "");
  if (progress.contradictions.length === 0) lines.push("_Keine markiert._");
  for (const c of progress.contradictions) lines.push(`- ${c.suspectName}: «${c.text}»`);
  lines.push("");

  const { accusation } = progress;
  lines.push("## Anklage", "");
  lines.push(`- Täter: ${nameOf(accusation.suspectId)}`);
  lines.push(`- Angehängte Beweise: ${accusation.evidenceIds.length}`);
  if (accusation.receipt) {
    const { verdict } = accusation.receipt;
    lines.push(`- Abgesendet: ${new Date(accusation.receipt.submittedAt).toLocaleString("de-CH")}`);
    lines.push(`- Ergebnis: ${verdict.solved ? "Fall gelöst" : "Fall nicht gelöst"} (Täter: ${verdict.culprit.name})`);
  } else {
    lines.push("- Status: noch nicht abgesendet");
  }
  lines.push("");

  return lines.join("\n");
}

/** Dateiname ohne Sonderzeichen, z. B. "fallakte-tod-im-buero-412-ABC-DEF.md". */
export function exportFileName(title: string, roomCode: string): string {
  const slug = title
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `fallakte-${slug || "fall"}-${roomCode}.md`;
}

/** Startet den Download im Browser. Ausserhalb der reinen Funktionen, weil sie das DOM braucht. */
export function downloadText(fileName: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // Erst nach dem Klick freigeben, sonst bricht manch ein Browser den Download ab.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
