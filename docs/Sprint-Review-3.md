# Sprint Review – Sprint 3

**Datum:** 02.11.2026 · **Ort:** TBZ · **Timebox:** 10 Minuten, vor der Retro
**Sprint:** 26.10.2026 – 02.11.2026 (Planning und Arbeitstag 26.10., Abschluss 02.11.)
**Teilnehmende:** PO Lars · SM Chime · Devs: Loris, Elina, Nehir · Stakeholder: N. Fricker

> Entwurf aus `master`, Git-Verlauf und PR-Reviews. Alles mit `___` bestätigt oder ergänzt das Team
> im Review. Nichts davon ist erfunden: was ich nicht belegen konnte, steht als offen da.

## Ablauf (10 Minuten, wie an Tag 8)

| Min. | Punkt | Wer |
|---|---|---|
| 0–1 | Sprintziel vorlesen, Antwort «erreicht ja/nein» | SM |
| 1–6 | Inkrement live auf `master` zeigen, nur was nach DoD fertig ist | ___ |
| 6–8 | Offen sagen, was nicht fertig wurde | PO |
| 8–10 | Feedback aufnehmen und ins Backlog schreiben | SM (Protokoll) |

**Vor dem Zeigen:** `git pull`, `npm install`, `npm run dev`, einmal von der Startseite bis zur
Anklage durchklicken. Gezeigt wird von `master`, nicht von einem Arbeitsbranch.

## 1. Sprintziel

> Am 2. November spielt eine Person CASE//ZERO auf `master` vom Start bis zur abgeschickten
> Anklage durch, und wir zeigen dazu nachvollziehbar, wie wir mit Scrum gearbeitet haben.

**Erreicht:** ___ *(Vorschlag: Ja für den ersten Teil — #26, #27 und #53 sind auf `master`. Für
«einmal live durchgespielt» zählt nur, was im Review wirklich durchgeklickt wird.)*

## 2. Gezeigtes Inkrement

Weg zum Zeigen: Startseite → Fall laden → Briefing → Tatort → Beweise sammeln → Verdächtige →
Täter wählen (#25) → Beweise anhängen (#26) → «Anklage absenden» → Bestätigung (#53) →
Anklage abgesendet und gesperrt (#27).

**Sprint Backlog**

| Story | SP | PR | Gemergt | Review (aus dem PR) | DoD 4 CI | DoD 5 durchgeklickt |
|---|---|---|---|---|---|---|
| #26 Beweise an die Anklage anhängen | 2 | #123 | 28.10. | Approve `lars11093`, Kommentar `elinahulli` | ___ | ___ |
| #27 Anklage absenden und danach sperren | 2 | #124 | 28.10. | Approve `lars11093`, Kommentar `elinahulli` | ___ | ___ |
| #53 Bestätigung vor dem Absenden | 1 | #155 (ersetzt #150, ohne Merge geschlossen) | 02.11. | Approve `lorisreina-prog` | ___ | ___ |

**Velocity Sprint 3:** ___ SP *(gemergt: 5 von 5 SP; nach DoD zählt erst, was DoD 3, 4 und 5 erfüllt)*

**Zu klären vor dem Zählen:** Bei #26 und #27 ist der Approve von `lars11093`. Wenn `lars11093` auch
Autor der PRs ist, ist DoD 3 («jemand anderes hat reviewt») nicht erfüllt. Dann ehrlich als
«gemergt, DoD 3 offen» zeigen statt als fertig.

**Zusätzlich gemergt, nicht im Sprint Backlog geplant** (standen im Planning unter «verschoben»):

| Story | PR | Gemergt | Review |
|---|---|---|---|
| #28 Auflösung des Falls | #125 | 28.10. | ___ |
| #29 Anmelden | #126 | 28.10. | ___ |
| #30 Fallübersicht | #127 | 28.10. | ___ |
| Fix `npm run dev` unter Windows | #114 | 02.11. | ___ |
| 3D-Tatort und Ansicht (#156 – #159, #163) | #160 – #163 | 02.11. | ___ |
| #55 – #58, #60 – #74 (Konto, Schwierigkeit, Intro, Ermittlungstafel, Befragung, Forensik …) | #164 – #182 | 02.11. | ___ |

Diese Stories zählen nicht zur Velocity des Sprintziels. Ob sie nach DoD fertig sind, entscheidet
der Review-Stand pro PR; im Zweifel nicht als fertig zeigen.

## 3. Nicht fertig – und warum

| Eintrag | Stand |
|---|---|
| Retro-Massnahme «Mergen aufteilen» | **Nicht erfüllt.** Alle Sprint-3-Merges auf `master` stammen vom Konto `lars11093`. Reviewt haben `elinahulli`, `lars11093`, `lorisreina-prog`. |
| PR #150 (#53, erster Versuch) | Ohne Merge geschlossen, ersetzt durch #155 |
| «Texte mit korrekten Umlauten» | Im Planning verschoben, ___ |
| #70a Smartphone mit PIN entsperren | Im Planning verschoben, ___ |
| #25 Täter auswählen | Kam in Sprint 2 ohne PR auf `master`; nachträgliches Review im Task «Stabilisieren»: ___ |
| Tasks Stabilisieren, Demo vorbereiten, Präsentation vorbereiten | ___ |

**Konsequenz:** ___

## 4. Feedback

| Von | Feedback | Massnahme im Backlog |
|---|---|---|
| Team | ___ | ___ |
| N. Fricker | ___ | ___ |
| ___ | ___ | ___ |

## 5. Anpassungen am Product Backlog

- ___
- ___

## 6. Kurzfassung fürs Portfolio (Abschnitt 4, Review-Ergebnis Sprint 3)

Gezeigt: ___ Sprintziel ___. Ins Backlog: ___.

**Protokoll:** Chime Dongkar (SM)
