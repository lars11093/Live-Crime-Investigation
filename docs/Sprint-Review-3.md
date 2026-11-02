# Sprint Review – Sprint 3

Modul 426 · AP 25b · 02.11.2026 · Abschlusspräsentation mit Produktdemo (rund 15 Minuten)

## 1. Sprintziel

> Am 2. November spielt eine Person CASE//ZERO auf `master` vom Start bis zur abgeschickten
> Anklage durch, und wir zeigen dazu nachvollziehbar, wie wir mit Scrum gearbeitet haben.

**Erreicht?** Auf `master` ist der ganze Weg bis zur abgeschickten Anklage gemergt, CI ist grün
(Typecheck, Lint, 210 Tests, Build). Bestätigt wird es durch das Durchspielen in der Demo.
_Nach der Demo: ✅ erreicht / ❌ nicht erreicht ankreuzen._

## 2. Gezeigtes Inkrement

| Story | SP | PR | Status |
|---|---|---|---|
| #26 Beweise an die Anklage anhängen | 2 | #123 | ✅ gemergt, Review Lars |
| #27 Anklage absenden und danach sperren | 2 | #124 | ✅ gemergt, Review Lars |
| #53 Bestätigung vor dem endgültigen Absenden | 1 | #155 | ✅ gemergt, Review Loris |

**Velocity Sprint 3:** 5 SP (geplant 5 SP)

Ungeplant ebenfalls auf `master`: #28 Auflösung, #29 Anmelden, #30 Fallübersicht, 3D-Tatort
#156 – #159 und PR #164 – #182 (Loris). Details im [Portfolio](portfolio.md), Sprint 3.

## 3. Nicht fertig – und warum

| Eintrag | Grund |
|---|---|
| #31 Rolle wählen und Folge-Stories (PR #128 – #151) | Change-Requests offen: Spieler-ID kommt vom Client, zweites Team-System neben #22 |
| Texte mit korrekten Umlauten (PR #115) | veraltet, Konflikte mit `master`; neu aufsetzen statt flicken |

## 4. Feedback

> Entwurf — nach der Präsentation durch das echte Feedback ersetzen.

| Von | Feedback | Wohin |
|---|---|---|
| _Lehrperson / Publikum_ | _eintragen_ | _Backlog / verworfen_ |

## 5. Anpassungen am Product Backlog

- #31 Rolle wählen: PR #128 nach den Change-Requests umbauen (Spieler-ID vom Server, Socket-Team aus #22 verwenden), dann die Folge-Stories neu stapeln.
- #150 schliessen bzw. geschlossen lassen: Duplikat von #53 (#155).
- «Texte mit korrekten Umlauten»: PR #115 auf dem aktuellen `master` neu aufsetzen.
- #59 Mehrere Tatorte: prüfen, ob durch #159 erledigt.

**Protokoll:** Chime Dongkar (SM)
