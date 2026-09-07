# Retrospective Sprint 0

Modul 426 · AP 25b · Modultag 4, 07.09.2026 · Timebox 12 Minuten · Moderation: Scrum Master
Methode: Starfish (Keep / More / Less / Start / Stop), verdichtet auf die drei Pflichtfragen.

> **Vor der Abgabe prüfen:** Die Punkte unten sind aus dem nachvollziehbaren Stand von Sprint 0
> abgeleitet (Commit-Historie, Board, Repo-Zustand). Ergänzt in der Retro, was nur ihr wisst —
> und streicht, was ihr anders erlebt habt. Die *Verbesserungsmassnahme* ist der Teil, der
> zwingend von euch getragen sein muss.

## 1. Was hat funktioniert?

- **Das Backlog steht vollständig im Board, nicht auf einem Blatt.** 80 Issues, jedes mit
  Epic-Label und MoSCoW-Label. Priorität ist damit für alle sichtbar und filterbar, nicht
  Verhandlungssache im Gespräch.
- **Die Priorisierung ist schriftlich begründet.** `docs/backlog-priorisierung.md` hält fest,
  *warum* MoSCoW und *warum* Story 1 zuoberst steht. Beim Refinement heute mussten wir diese
  Diskussion nicht neu führen.
- **Das technische Grundgerüst stand vor Sprint 1.** Monorepo (`apps/web`, `apps/server`,
  `packages/shared`), CI-Workflow und die npm-Skripte waren fertig, bevor die erste Story
  gezogen wurde. Sprint 1 startet ohne Setup-Ballast.
- **Der Scope wurde bewusst verkleinert** statt stillschweigend mitgeschleppt: echtes
  Netzwerk-Multiplayer steht explizit auf `Won't`.

## 2. Was hat gebremst?

- **Das Board wurde nach dem Import nicht kontrolliert.** Die Stories 1 und 2 existieren doppelt
  (Issues #3 und #4). Gemerkt haben wir es erst beim Refinement an Modultag 4 — beim Schätzen
  hätten wir zwei Stories doppelt geschätzt.
- **Zwei Wahrheiten zum Scope.** Das README beschreibt noch das ursprüngliche Konzept mit fünf
  exklusiven Rollen und Socket-Multiplayer; das Backlog beschreibt bereits das reduzierte Konzept
  mit gemeinsamem Team-Code. Wer nur eines von beiden liest, plant am anderen vorbei.
- **Die Arbeit war nicht sichtbar verteilt.** Im Repo stammen die Commits aus Sprint 0 praktisch
  von einem Konto. Ob die anderen daneben mitgearbeitet haben, lässt sich am Board und an der
  Historie nicht ablesen — und genau daran misst uns das Modul.
- **Kein gemeinsamer Fertig-Begriff.** Bis heute gab es keine Definition of Done. In Sprint 0
  fiel das nicht auf, weil nichts abgenommen werden musste.

## 3. Verbesserungsmassnahme für Sprint 1 (genau eine)

> **Jede Person im Team hat bis zum Daily am Modultag 6 mindestens einen eigenen Pull Request
> im Repository gemergt** — eigener Branch, eigenes Issue, Review durch eine zweite Person.

- **Nachprüfbar am Modultag 6:** `gh pr list --state merged` bzw. die Spalte `Done` im Board.
  Fünf Namen als PR-Autoren = erfüllt. Vier oder weniger = nicht erfüllt, und wir reden in der
  nächsten Retro darüber, was im Weg stand.
- **Warum diese und keine andere:** Sie greift das Problem an, das uns im Modul am meisten
  kostet (unsichtbare, ungleich verteilte Arbeit), und sie ist mit einem Blick ins Repo
  entschieden — ohne Diskussion, ob sich jemand "genug eingebracht" hat.
- Nicht gewählt: "besser kommunizieren" (nicht überprüfbar), "täglich Daily halten" (kein
  Ergebnis, nur ein Termin), "mehr testen" (ohne Zahl beliebig).

## 4. Was daraus sofort folgt

| Erkenntnis | Sofortmassnahme | Wo |
|---|---|---|
| Doppelte Issues #3/#4 | geschlossen mit Verweis auf #1/#2 | Board |
| Zwei Wahrheiten zum Scope | README Abschnitt 1/3 an das Backlog angleichen — als Story im Backlog, nicht nebenbei | Sprint 2 |
| Kein Fertig-Begriff | Definition of Done beschlossen | [definition-of-done.md](definition-of-done.md) |
| Arbeit unsichtbar | PR-Pflicht ist Teil der DoD (Punkt 2 und 3) | [definition-of-done.md](definition-of-done.md) |
