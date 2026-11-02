# Sprint Review – Sprint 3

Modul 426 · AP 25b · 02.11.2026 · Abschlusspräsentation mit Produktdemo (rund 15 Minuten)

## Ablauf der Produktdemo

| Min. | Punkt | Wer |
|---|---|---|
| 0–1 | Sprintziel vorlesen, Antwort «erreicht ja/nein» | SM |
| 1–6 | Inkrement live auf `master` zeigen, nur was nach DoD fertig ist | Devs |
| 6–8 | Offen sagen, was nicht fertig wurde | PO |
| 8–10 | Feedback aufnehmen und ins Backlog schreiben | SM (Protokoll) |

**Vor dem Zeigen:** `git pull`, `npm install`, `npm run dev`, einmal von der Startseite bis zur
Anklage durchklicken. Gezeigt wird von `master`, nicht von einem Arbeitsbranch.

## 1. Sprintziel

> Am 2. November spielt eine Person CASE//ZERO auf `master` vom Start bis zur abgeschickten
> Anklage durch, und wir zeigen dazu nachvollziehbar, wie wir mit Scrum gearbeitet haben.

**Erreicht?** Ja, auf dem localhost

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
| #31 Rolle wählen und Folge-Stories (PR #128 – #149, #151) | Change-Requests offen: Spieler-ID kommt vom Client, zweiter Join-Pfad neben #22 |
| Texte mit korrekten Umlauten (PR #115) | veraltet, Konflikte mit `master`; neu aufsetzen statt flicken |
| Viele gleichzeitige PRs | Merge-Konflikte, vor allem in `CaseLoaderPage.tsx` |

## 4. Anpassungen am Product Backlog

- PR-Stack #128 – #149, #151: Change-Requests bearbeiten und Konflikte in den abhängigen PRs auflösen.
- PR #115 neu auf aktuellem `master` aufsetzen.

**Protokoll:** Chime Dongkar (SM)

## 5. Nachtrag zum Stand nach der Präsentation

Die Tabellen oben halten den Stand während des Abschlussreviews fest. Noch am 02.11.2026 wurden
PR #128 – #149 und #151 gemergt, PR #150 war bereits durch #155 ersetzt, und die Umlaute aus PR #115
kamen ebenfalls auf `master`. Diese Stories zählen nicht nachträglich zur Velocity von Sprint 3.

Offener technischer Punkt: Die Route `/case/:code` nutzt weiterhin `room:join`, `/fall/:code` dagegen
`team:join` ([App.tsx](../apps/web/src/App.tsx)). Die zwei Join-Pfade sollten als eigener
Backlog-Eintrag zusammengeführt werden. Die Rollenvergabe selbst prüft der Server: nur Teammitglieder
dürfen wählen, und nur die Teamleitung darf Rollen anderer ändern
([team.ts](../apps/server/src/engine/team.ts)).

**Story #77 Rangliste:** nach der Präsentation umgesetzt, von Loris approved und am 02.11.2026 mit
[PR #191](https://github.com/lars11093/Live-Crime-Investigation/pull/191) gemergt. Sie stand nicht
im Sprint-3-Backlog und zählt nicht zur Velocity.
