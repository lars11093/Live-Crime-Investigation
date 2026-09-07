# Portfolio — CASE//ZERO

Modul 426 · Software mit agilen Methoden entwickeln · AP 25b · N. Fricker
Repository: <https://github.com/lars11093/Live-Crime-Investigation> · Board: GitHub Issues + Projects

> **Vor der Abgabe ausfüllen** (Platzhalter `_<…>_`):
> Namen und Rollen in Abschnitt 1 · Link/Screenshot Vision Board in Abschnitt 2 ·
> Link zum Foto der Story Map in Abschnitt 2 · Personen in den Task-Tabellen in
> [sprint-1-planning.md](sprint-1-planning.md).

---

## 1. Team und Produkt

### Team

| Person | Scrum-Rolle | Schwerpunkt |
|---|---|---|
| Lars Herrmann | Entwickler | Repo, CI, Server |
| `_<Name>_` | Product Owner (und Entwickler) | Anforderungen, Abnahme |
| `_<Name>_` | Scrum Master (und Entwickler) | Prozess, Timeboxen, Impediments |
| `_<Name>_` | Entwickler | |
| `_<Name>_` | Entwickler | |

Product Owner und Scrum Master sind gleichzeitig Entwickler im Team — bei fünf Personen und
neun Wochen ist eine reine Rollentrennung nicht sinnvoll.

### Produkt

**CASE//ZERO** ist ein digitales Ermittlungsspiel. Ein Team untersucht gemeinsam einen einzigen,
hochwertig ausgearbeiteten Kriminalfall: Tatort absuchen, Beweise sammeln und kombinieren,
Verdächtige und ihre Aussagen prüfen, sichergestellte Geräte digital-forensisch auswerten und am
Ende eine begründete Anklage abgeben. Der Look ist ein dunkles "Police-OS"-Terminal.

**Abgrenzung:** Ein Fall in hoher Qualität statt zehn oberflächlicher. Echtes Netzwerk-Multiplayer,
Sprachausgabe und eine mobile App sind bewusst ausgeschlossen (Won't).

**Technisch:** React 18 + Vite + TypeScript (`apps/web`), Node.js + Express (`apps/server`),
gemeinsame Typen in `packages/shared`, Fallinhalte als JSON, Tests mit Vitest, CI über GitHub
Actions. Details in [../README.md](../README.md).

---

## 2. Product Vision

**Vision Board:** `_<Link oder Screenshot einfügen>_`

**Visionssatz:** Für Menschen, die Krimis und Rätsel mögen, ist CASE//ZERO ein digitales
Ermittlungsspiel, das einen echten Fall statt eines Quiz bietet — weil man Beweise selbst findet,
kombiniert und seine Anklage begründen muss.

**Business Goals (messbar):**

- 80 % der Testspieler verstehen das Spiel ohne mündliche Erklärung.
- Ein Fall ist in 45–60 Minuten durchspielbar.
- Modul 426 erfolgreich abschliessen *(Projektziel, bewusst getrennt von den Produktzielen geführt)*.

**Story Map (Auftrag 3.1):** `_<Link zum Foto einfügen>_`

---

## 3. Product Backlog

**Werkzeug:** GitHub Issues + Projects, Spalten `Backlog` · `Sprint Backlog` · `In Progress` ·
`Review` · `Done`. **Umfang:** 78 Stories in den Epics `Fall starten`, `Tatort untersuchen`,
`Beweise verwalten`, `Verdächtige prüfen`, `Digitale Forensik`, `Team koordinieren`, `Fall lösen`.

### Priorisierungsmethode: MoSCoW

Wir haben eine feste Zeitbox und mehr Umfang als Zeit — genau der Fall, für den MoSCoW gedacht
ist. Die Eisenhower-Matrix scheidet aus, weil es bei uns keine Dringlichkeit gibt: alle Stories
haben dieselbe Deadline. Nutzenorientierte Priorisierung bräuchte Nutzenwerte echter Nutzer, die
wir noch nicht haben.

| Stufe | Bedeutung bei uns | Sprint |
|---|---|---|
| Must | Ohne diese Story ist der Fall nicht spielbar | Sprint 1 |
| Should | Macht die Ermittlung deutlich besser, ist aber ersetzbar | Sprint 2 |
| Could | Nice-to-have, fällt bei Zeitdruck zuerst weg | Sprint 3 |
| Won't | Bewusst ausgeschlossen | – |

Die **Reihenfolge im Board ist die Priorisierung**: von oben nach unten Must → Should → Could.
Ausführliche Begründung, INVEST-Check und Splitting: [backlog-priorisierung.md](backlog-priorisierung.md).

### Refinement der obersten fünf Stories (Modultag 4)

Die fünf obersten Stories (#1, #2, #5, #6, #7) haben Rolle, Nutzen und je drei bis vier
**beobachtbare** Akzeptanzkriterien inklusive Fehlerfall. Vorher/Nachher pro Story und die
Splitting-Entscheide: [refinement-sprint-1.md](refinement-sprint-1.md).

---

## 4. Sprints

### Definition of Done

Gilt ab Sprint 1 für **alle** Stories, sechs Kriterien — im Detail in
[definition-of-done.md](definition-of-done.md):

1. Akzeptanzkriterien erfüllt · 2. Code über PR auf `master` · 3. Review durch eine zweite Person ·
4. CI grün (Lint, Typecheck, Test) · 5. lokal von einer zweiten Person durchgeklickt ·
6. Board aktualisiert (Spalte, Story Points, Milestone).

---

### Sprint 0 — Setup (bis 07.09.2026)

**Ziel:** Grundgerüst, Backlog und Board stehen, bevor die erste Story gezogen wird.

**Ergebnis:**

- Monorepo mit `apps/web`, `apps/server`, `packages/shared`; CI-Workflow (Lint/Typecheck/Test) läuft
- Product Vision und Story Map erarbeitet
- 78 Stories als GitHub Issues mit Epic- und MoSCoW-Labels erfasst
- Priorisierung, INVEST-Check und KI-Nachweis schriftlich festgehalten
- Definition of Done beschlossen, fünf oberste Stories refined

**Retrospective (Modultag 4, 12 Minuten, Starfish)** — vollständig in
[retrospective-sprint-0.md](retrospective-sprint-0.md):

*Was funktioniert hat:* Das Backlog steht vollständig und begründet im Board, nicht auf einem
Blatt. Das technische Grundgerüst stand vor Sprint 1, dadurch startet Sprint 1 ohne Setup-Ballast.

*Was gebremst hat:* Das Board wurde nach dem Import nicht kontrolliert — die Stories 1 und 2
existierten doppelt und fielen erst beim Refinement auf. README und Backlog beschreiben zwei
verschiedene Scopes. Und: die Arbeit war nicht sichtbar verteilt, die Commits aus Sprint 0 stammen
praktisch von einem Konto.

**Verbesserungsmassnahme für Sprint 1 (genau eine):**

> **Jede Person im Team hat bis zum Daily am Modultag 6 mindestens einen eigenen Pull Request
> gemergt** — eigener Branch, eigenes Issue, Review durch eine zweite Person.

*Nachprüfbar:* `gh pr list --state merged` bzw. Spalte `Done`. Fünf verschiedene PR-Autoren =
erfüllt. Vier oder weniger = nicht erfüllt, und wir reden in der nächsten Retro darüber, was im
Weg stand.

---

### Sprint 1 — Durchstich (07.09.2026 – 21.09.2026)

**Sprintziel:**

> Am 21. September können wir CASE//ZERO öffnen, einen Fall laden und im ersten Tatort stehen —
> ein durchgehender klickbarer Weg von der Startseite über das Briefing bis in die Szene.

**Sprint Backlog:** #1 Startseite (1 SP) · #2 Fall laden (3 SP) · #6 Fall-Briefing (2 SP) ·
#7 Tatort als Szene (5 SP) — **11 Story Points**. #5 Team-Code (3 SP) ist geschätzt, aber bewusst
draussen: sie zahlt nicht auf das Sprintziel ein.

**Fünf Erkenntnisse aus dem Schätzen** und die Aufteilung in Tasks:
[sprint-1-planning.md](sprint-1-planning.md).

*Review, Retrospective und Ergebnis werden am Ende des Sprints hier ergänzt.*

---

## 5. KI-Nutzungsnachweis

| Nachweis | Modultag | Wo |
|---|---|---|
| Product Vision hinterfragen | 2 | [backlog-priorisierung.md](backlog-priorisierung.md), Abschnitt 4 |
| INVEST-Check / Story-Splitting | 3 | [backlog-priorisierung.md](backlog-priorisierung.md), Abschnitt 3 und 4 |
| Refinement der obersten fünf Stories (freiwillig) | 4 | [refinement-sprint-1.md](refinement-sprint-1.md) |

**Modultag 4 — übernommen:**

| Vorschlag | Warum übernommen |
|---|---|
| Akzeptanzkriterien als beobachtbare Zustände statt Absichten formulieren ("Ist der Server nicht erreichbar, erscheint …" statt "Ein Ladefehler wird angezeigt") | Erst so prüft im Review jede Person dasselbe. |
| Fehlerfall als eigenes Kriterium in #1, #6 und #7 ergänzen | Fehlte in drei von fünf Stories und ist die Arbeit, die beim Schätzen am häufigsten vergessen geht. |
| Format des Team-Codes auf `XXX-XXX` korrigieren | Das Kriterium "6-stelliger Code" widersprach der bereits festgelegten Architektur. |
| Duplikate #3/#4 vor dem Schätzen schliessen | Wir hätten zwei Stories doppelt geschätzt und eingeplant. |

**Modultag 4 — verworfen:**

| Vorschlag | Warum verworfen |
|---|---|
| #7 "Tatort als Szene" in Ansicht und Interaktion splitten | Die Interaktion ist bereits eine eigene Story (#8). Ein weiterer Split hätte eine Story ohne sichtbares Ergebnis erzeugt. |
| #2 entlang der Technik splitten (erst Endpunkt, dann UI) | Eine geladene JSON-Datei ohne Ansicht kann niemand benutzen. Technische Schritte sind bei uns Tasks, keine Stories. |
| #5 Team-Code trotzdem in Sprint 1 nehmen, "ist ja nur ein Eingabefeld" | Sie zahlt nicht auf das Sprintziel ein, und die Session-Frage dahinter ist offen. Lieber zu wenig planen. |
