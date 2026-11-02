# Sprint 3 — Planning

Modul 426 · AP 25b · Auftrag 8.2 · **26.10.2026** (ein Modultag, endet um 11:30)
Abschlusspräsentation mit Produktdemo am **Mo 02.11.**, rund 15 Minuten

## 1. Wie viel schaffen wir?

**Richtwert aus Sprint 2: 11 SP done** (#1, #2, #6, #7; #8 war nicht geschätzt).
Laut Auftrag planen wir **die Hälfte: rund 5 SP**. Nur Stories, die im Refinement ready waren
([refinement-sprint-3.md](refinement-sprint-3.md)).

Dazu kommen ohne Story Points die Retro-Massnahme und die drei Pflicht-Tasks. Sprint 3 ist kurz;
fertig machen geht vor neu anfangen.

## 2. Sprintziel

> **Am 2. November spielt eine Person CASE//ZERO auf `master` vom Start bis zur abgeschickten
> Anklage durch, und wir zeigen dazu nachvollziehbar, wie wir mit Scrum gearbeitet haben.**

### Warum dieses Ziel
- **Leitfrage beantwortet:** Für eine verständliche Demo braucht das Spiel ein Ende. Heute kann man
  ermitteln, aber keinen Fall abschliessen.
- **Realistisch:** Für alle drei Stories existiert Code als PR. Es fehlen Review, Durchklicken und Merge.
- **Überprüfbar:** Am 2.11. klickt jemand den ganzen Weg live auf `master` durch.

## 3. Sprint Backlog

| Eintrag | SP | PR | Sprint 3 |
|---|---|---|---|
| #26 Beweise an die Anklage anhängen | 2 | #123 bzw. #125 | ✅ |
| #27 Anklage absenden und danach sperren | 2 | #124 bzw. #125 | ✅ |
| #53 Bestätigung vor dem endgültigen Absenden | 1 | #150 (ersetzt durch #155) | ✅ |
| **Retro-Massnahme:** Mergen aufteilen — bis 11:30 hat jede Person mindestens einen PR einer anderen Person mit dem eigenen Konto reviewt und gemergt | – | – | ✅ |
| **Task:** Stabilisieren | – | – | ✅ |
| **Task:** Demo vorbereiten | – | – | ✅ |
| **Task:** Präsentation vorbereiten | – | – | ✅ |
| **Summe** | **5 SP** | | |

**Merge-Reihenfolge:** #26 → #27 → #53. #27 baut auf #26 auf, #53 auf #27.
Achtung: PR #125 enthält eigene Kopien von #26 und #27. Vor dem Review entscheiden, ob #123/#124
gemergt werden oder #125 (und #123/#124 dann geschlossen). Nicht beide Wege.

## 4. Nicht in Sprint 3 — verschoben oder verworfen

Bleiben im Product Backlog, ohne Sprint-Zuordnung, im Board gekennzeichnet:

| Eintrag | Entscheid | Grund |
|---|---|---|
| #28 Auflösung des Falls (3 SP, in PR #125) | verschoben | Passt nicht mehr in 5 SP. Erste Story nach Sprint 3. |
| Texte mit korrekten Umlauten (2 SP) | verschoben | Ready, aber nach der Anklage weniger wichtig für die Demo |
| #70a Smartphone mit PIN entsperren (3 SP) | verschoben | Neue Funktion, kein Beitrag zum Sprintziel |
| #29 Anmelden (PR #126) | verschoben | Keine Akzeptanzkriterien, nicht ready |
| #30 – #52, #54 (PR #127 – #149, #151) | verschoben | Ohne Planung eröffnet, nicht ready, nicht reviewt. Bauen aufeinander auf. |
| Fixes #114 (Windows) und #115 (Umlaute) | verschoben | Kein Story-Eintrag; #115 ist veraltet |

## 5. Tatsächliche Zuständigkeiten und Abschluss

Die Planning-Unterlagen halten die Task-Ziehungen nicht fest. Die folgenden Zuständigkeiten sind
aus den Sprint-PRs rekonstruiert; sie zeigen die Umsetzung und Reviews, nicht die ursprüngliche
Aufteilung im Planning.

| Story | Autor/in | Review | Merge |
|---|---|---|---|
| #26 Beweise an die Anklage anhängen (PR #123) | Elina | Lars | Lars, 28.10. |
| #27 Anklage absenden und danach sperren (PR #124) | Elina | Lars | Lars, 28.10. |
| #53 Bestätigung vor dem Absenden (PR #155; ersetzte #150) | Lars | Loris | Lars, 01.11. |

Die Pflicht-Tasks Stabilisieren, Demo vorbereiten und Präsentation vorbereiten sind im Sprint Backlog
aufgeführt. Die Produktdemo fand laut [Sprint-Review 3](Sprint-Review-3.md) statt; einzelne
Zuständigkeiten für diese drei Tasks und die Verteilung der Sprechanteile sind nicht protokolliert.

## 6. Daily Scrum (26.10.2026)

Das Daily war mit zehn Minuten angesetzt. Einzelne Antworten, Abhängigkeiten oder Blocker sind in
diesen Unterlagen nicht protokolliert.

## 7. Abschlussstand (02.11.2026)

| Kriterium | Stand |
|---|---|
| Produkt auf master durchgespielt | Im Sprint-Review 3 als erreicht dokumentiert. |
| Sprint-3-Block und KI-Nachweis im Portfolio | Ergänzt. Alle fünf Personen haben ihre Sprint-3-Reflexion im Portfolio eingetragen. |
| Wer was in der Präsentation zeigt und sagt | Die Produktdemo fand statt; die Sprechanteile sind nicht protokolliert. |
