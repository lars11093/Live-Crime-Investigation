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
| #53 Bestätigung vor dem endgültigen Absenden | 1 | #150 | ✅ |
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

## 5. Sprint Backlog — Tasks

Ein Task ist so gross, dass eine Person ihn heute schafft. **Reviewer und Merger sind nie die Autorin
oder der Autor des PRs** und wechseln, damit die Retro-Massnahme erfüllt wird.

### #26 Beweise an die Anklage anhängen
| Task | Gezogen von |
|---|---|
| Code-Review des PRs gegen die Akzeptanzkriterien | `_<n>_` |
| Lokal durchklicken (DoD 5), CI grün, mergen, Board auf `Done` | `_<n>_` |

### #27 Anklage absenden und danach sperren
| Task | Gezogen von |
|---|---|
| Code-Review des PRs gegen die Akzeptanzkriterien | `_<n>_` |
| Rebase auf `master` nach #26, durchklicken, mergen, Board auf `Done` | `_<n>_` |

### #53 Bestätigung vor dem endgültigen Absenden
| Task | Gezogen von |
|---|---|
| PR #150 aus der Kette lösen: nur #53 auf `master` nach #27 | `_<n>_` |
| Code-Review, durchklicken («Abbrechen» und «Absenden»), mergen, Board auf `Done` | `_<n>_` |

### Pflicht-Tasks
| Task | Inhalt | Gezogen von |
|---|---|---|
| Stabilisieren | `master` einmal komplett durchklicken, Fehler beheben; #25 nachträglich reviewen | `_<n>_` |
| Demo vorbereiten | Reihenfolge der gezeigten Stories und wer zeigt festlegen, Demo einmal durchspielen | `_<n>_` |
| Präsentation vorbereiten | Teil 1 Produkt, Teil 2 Technik, Teil 3 Scrum-Erfahrungen, Sprecher festlegen | `_<n>_` |

## 6. Daily Scrum (26.10.2026)

10 Minuten, im Stehen. Scrum Master hält die Timebox. Hindernisse werden benannt, nicht gelöst, und
bekommen im Board das Label `Impediment`. **Fester Punkt:** auf welcher Story baut meine Arbeit auf?

| Person | Woran arbeite ich als Erstes? | Was brauche ich von jemandem? | Was blockiert mich? |
|---|---|---|---|
| Lars | | | |
| Loris | | | |
| Elina | | | |
| Nehir | | | |
| Chime | | | |

## 7. Fertig, wenn (Auftrag 8.2)

- [ ] Sprintziel steht in einem Satz im Board und im Portfolio
- [ ] Sprint 3 zeigt im Board die geschätzten Stories, die Retro-Massnahme und die Einträge für Demo und Präsentation
- [ ] Offene Einträge im Product Backlog sind als verschoben oder verworfen gekennzeichnet
- [ ] Das Produkt läuft auf `master` im Zustand vom 2. November, die Demo ist einmal durchgespielt
- [ ] Portfolio: Abschnitte 5 und 8 ausgefüllt, Block Sprint 3 mit Sprintziel und Stories, KI-Nachweis geprüft
- [ ] Alle wissen, wer am 2. November was zeigt und sagt
