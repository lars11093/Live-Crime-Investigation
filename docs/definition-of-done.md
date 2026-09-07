# Definition of Done — CASE//ZERO

Modul 426 · AP 25b · gültig ab Sprint 1 (08.09.2026) · beschlossen an Modultag 4

Die **Definition of Done gilt für jede Story**. Die **Akzeptanzkriterien gelten für genau eine**
Story und stehen im jeweiligen Issue. Eine Story ist erst dann `Done`, wenn *alle* sechs Punkte
unten erfüllt sind — nicht "fast", nicht "läuft bei mir".

| # | Kriterium | Woran wir es prüfen |
|---|---|---|
| 1 | Alle Akzeptanzkriterien der Story sind erfüllt | Checkboxen im Issue sind abgehakt |
| 2 | Der Code liegt im Repository auf `master` | Merge über Pull Request, kein direkter Push auf `master` |
| 3 | Eine zweite Person hat den Code angeschaut | PR hat mindestens ein `Approved`-Review von jemand anderem |
| 4 | Die CI ist grün | GitHub-Actions-Lauf am PR: `npm run lint`, `npm run typecheck`, `npm run test` ohne Fehler |
| 5 | Es läuft bei allen im Team | Nach `npm install && npm run dev` hat eine zweite Person die Story lokal durchgeklickt |
| 6 | Das Board ist aktuell | Issue steht in `Done`, Story Points und Sprint-Milestone sind gesetzt |

## Warum genau diese sechs

- **Punkt 3 und 5 sind neu für uns.** In Sprint 0 hat faktisch jede Person nur ihren eigenen
  Stand gesehen. Ohne diese zwei Punkte hätten wir im Review fünf verschiedene Meinungen darüber,
  was "fertig" heisst.
- **Punkt 4 kostet uns nichts**, weil die CI (`.github/workflows/ci.yml`) bereits steht — sie muss
  nur ernst genommen werden.
- **Bewusst nicht drin:** Testabdeckung in Prozent (haben wir noch nicht sinnvoll messbar),
  Deployment auf einen Server (erst ab Sprint 3 realistisch), vollständige Dokumentation jeder
  Funktion (würden wir nicht durchhalten). Was wir hinschreiben, halten wir ein.

An **Modultag 5** schauen wir die DoD erneut an und schärfen sie mit den Erfahrungen aus den
ersten Stories.
