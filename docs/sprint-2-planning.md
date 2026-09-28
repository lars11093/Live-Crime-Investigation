# Sprint 2 — Planning

Modul 426 · AP 25b · Auftrag 6.2 · **28.09.2026 – 26.10.2026**
Zwei Arbeitstage: **Mo 28.09.** und **Mo 19.10.** (dazwischen Herbstferien) · Review und Retro am **26.10.**

## 1. Wie viel schaffen wir?

**Richtwert aus Sprint 1: 0 SP.** Nach unserer DoD war in Sprint 1 keine Story done — alle vier
PRs (#97 – #100) sind offen, ohne Review, nicht auf `master`.

Daraus folgt für Sprint 2: **keine neue Story.** Die vier Stories aus Sprint 1 sind zu grossen
Teilen gebaut; was fehlt, ist genau das, woran wir gescheitert sind — Review, Durchklicken,
Merge. «Fertig machen vor neu anfangen» ist bei uns nicht ein Grundsatz, sondern der ganze
Sprint. Die Schätzungen der vier Stories bleiben unverändert (11 SP); sie zählen erst, wenn sie
nach DoD done sind. Damit haben wir nach Sprint 2 zum ersten Mal eine echte Velocity.

## 2. Refinement

| Eintrag | Entscheid |
|---|---|
| #1, #2, #6, #7 (aus Sprint 1 zurück) | Akzeptanzkriterien unverändert gültig, Schätzung bleibt. Wieder zuoberst im Backlog. |
| Feedback aus dem Review | `_<neue/geänderte Einträge aus dem Feedback — oder «kein Feedback erhalten»>_` |
| #5 Team-Code (3 SP) | Bleibt nächster Kandidat, aber **nicht in Sprint 2** — Richtwert trägt keine neue Story. |
| #8 – #17 (PRs #101 – #111 ohne Planung eröffnet) | Nicht in Sprint 2. Kommen am 19.10. ins Refinement, erst dann Schätzung und Entscheid, ob die offenen PRs weiterverwendet oder geschlossen werden. |

## 3. Sprintziel

> **Am 19. Oktober kann eine fremde Person auf `master` ohne Erklärung
> vom Start bis in den Tatort klicken und dort Stellen untersuchen, und alle Stories dazu sind reviewt, gemergt und nach DoD `Done`.**

### Warum dieses Ziel:
- **Kernfunktion:** Ermitteln ist der Kern von CASE//ZERO. Den Tatort untersuchen (#8) ist der
  erste Schritt davon, alles andere ist nur der Weg dorthin.
- **Lehre aus Sprint 1:** Dort war nichts nach DoD fertig. Deshalb steht die DoD im Ziel, damit wir
  im Review eindeutig Ja oder Nein sagen können.
- **Überprüfbar:** Eine fremde Person klickt es im Review ohne Erklärung durch. Das zahlt auf
  unser Business Goal «80 % verstehen das Spiel ohne mündliche Erklärung» ein.
- **Realistisch:** Der Code für #1, #2, #6, #7 existiert, es fehlt nur der Abschluss. Neu ist nur
  #8. Wird es eng, fällt #8 raus, nicht das Review.

## 4. Sprint Backlog

| Story | Titel (Kurzform) | SP | PR | Sprint 2 |
|---|---|---|---|---|
| #1 | Startseite anzeigen | 1 | #97 | ✅ |
| #2 | Fall laden | 3 | #98 | ✅ |
| #6 | Fall-Briefing lesen | 2 | #99 | ✅ |
| #7 | Tatort als Szene sehen | 5 | #100 | ✅ |
|  | **Retro-Massnahme:** Jeder PR wird innerhalb eines Modultags von einer anderen Person reviewt, jede Person reviewt mind. zwei PRs | – | – | ✅ |
| | **Summe** | **11 SP** | | |

> Die Retro-Massnahme als eigenes Issue anlegen (Label z. B. `Retro-Massnahme`), damit sie im
> Sprint Backlog sichtbar ist — das verlangt der Auftrag.

**Merge-Reihenfolge:** #97 → #98 → #99 → #100. #6 und #7 bauen auf den Falldaten aus #2 auf;
wer später merged, muss eventuell Konflikte auflösen.

## 5. Sprint Backlog — Tasks

Ein Task ist so gross, dass eine Person ihn an einem Modultag schafft. **Reviewer ist nie der
Autor des PRs.** Jeder PR bekommt zwei Reviews — so kommen alle auf mindestens zwei.

### #1 Startseite anzeigen — PR #97
| Task | Gezogen von |
|---|---|
| Code-Review PR #97 (Kommentare im PR) | `_<n>_` |
| Zweites Review + lokal gegen die Akzeptanzkriterien durchklicken (DoD 5) | `_<n>_` |
| Review-Kommentare einarbeiten, CI grün, mergen, Board auf `Done` | `_<n>_` |

### #2 Fall laden — PR #98
| Task | Gezogen von |
|---|---|
| Code-Review PR #98 inkl. Fehlerfall «Server nicht erreichbar» | `_<n>_` |
| Zweites Review + lokal durchklicken, Fehlerfall testen (Server stoppen) | `_<n>_` |
| Review-Kommentare einarbeiten, CI grün, mergen, Board auf `Done` | `_<n>_` |

### #6 Fall-Briefing lesen — PR #99
| Task | Gezogen von |
|---|---|
| Code-Review PR #99 | `_<n>_` |
| Zweites Review + lokal durchklicken (schliessen und wieder öffnen) | `_<n>_` |
| Rebase auf `master` nach #98, Kommentare einarbeiten, mergen, Board auf `Done` | `_<n>_` |

### #7 Tatort als Szene sehen — PR #100
| Task | Gezogen von |
|---|---|
| Code-Review PR #100 | `_<n>_` |
| Zweites Review + durchklicken bei 1280×720 und 1920×1080, Platzhalter bei fehlendem Bild prüfen | `_<n>_` |
| Rebase auf `master`, Kommentare einarbeiten, mergen, Board auf `Done` | `_<n>_` |

### Abschluss
| Task | Gezogen von |
|---|---|
| Ganzen Durchstich auf `master` einmal von Anfang bis Ende durchklicken | `_<n>_` |
| Board aufräumen: Karten mit offenem PR aus `Done` zurück ins Backlog | `_<n>_` |

## 6. Daily Scrum (28.09.2026)

10 Minuten, im Stehen. Scrum Master hält die Timebox. Keine Problemlösung im Daily — Hindernisse
werden benannt und bekommen im Board das Label `Impediment`. **Fester Punkt: offene PRs.**

| Person | Woran arbeite ich als Erstes? | Was brauche ich von jemandem? | Was blockiert mich? |
|---|---|---|---|
| Lars | | | |
| Loris | | | |
| Elina | | | |
| Nehir | | | |
| Chime | | | |

## 7. Fertig, wenn (Auftrag 6.2)

- [ ] Sprintziel steht im Board und im Portfolio
- [ ] Stories des Sprint Backlogs sind geschätzt und Sprint 2 zugeordnet
- [ ] Retro-Massnahme steht als Eintrag im Sprint Backlog
- [ ] Erste Tasks sind gezogen, die Arbeit hat begonnen
