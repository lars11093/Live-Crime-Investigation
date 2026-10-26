# Retrospective Sprint 2

Modul 426 · AP 25b · Modultag 8, 26.10.2026 · Timebox 20 Minuten · Moderation: Scrum Master (Chime)
Methode: Starfish (Keep / More / Less / Start / Stop), verdichtet auf die drei Pflichtfragen.

**Teilnehmende:** Loris · Lars · Elina · Nehir · Chime

## 1. Massnahme aus Sprint 1 — umgesetzt?

> **Jeder Pull Request wird innerhalb eines Modultags von einer anderen Person reviewt, und jede
> Person im Team reviewt in Sprint 2 mindestens zwei PRs.**

**Nicht erfüllt.**

| Prüfpunkt | Ergebnis | Woran man es sieht |
|---|---|---|
| Jeder gemergte Story-PR von einer anderen Person reviewt | ✅ | #97 – #111 und #120 Approve von Loris, #112 und #113 Approve von Lars |
| Review innerhalb eines Modultags | ❌ | PR #97 – #102 seit 21.09. offen, erst am 19.10. reviewt; am 28.09. wurde kein PR reviewt |
| Jede Person reviewt mindestens zwei PRs | ❌ | Reviews nur von 2 von 5 Personen (Loris, Lars). Chime, Elina, Nehir: 0 Reviews |
| Merge nur über PR (DoD 2) | ❌ | #25 wurde am 26.10. lokal gemergt und direkt auf `master` gepusht, ohne PR und Review |

**Was besser wurde als in Sprint 1:** Statt einem gibt es jetzt vier PR-Autoren
(Lars, Loris, Chime, Elina), und alle Stories auf dem Weg zum Sprintziel sind reviewt und gemergt.

**Was im Weg stand:** `_<aus dem Starfish ergänzen>_`

## 2. Starfish-Board

| Keep | More Of | Less Of | Stop | Start |
| --- | --- | --- | --- | --- |
| ___ | ___ | ___ | ___ | ___ |
| ___ | ___ | ___ | ___ | ___ |

## 3. Was hat funktioniert?

- **Sprintziel erreicht.** Startseite → Fall laden → Briefing → Tatort → Stellen untersuchen läuft
  auf `master`, alle Sprint-Stories (#1, #2, #6, #7, #8) sind nach DoD fertig.
- **Mehr Leute haben Code beigetragen.** Eigene PRs von Lars, Loris, Chime (#18) und Elina
  (#26 – #28); in Sprint 1 kam alles von einem Konto.
- **Reviews mit Inhalt.** Die Approves enthalten, was lokal geprüft wurde (z. B. bei #120:
  Tests, Durchklicken, API-Payload) und Hinweise für Folge-PRs.
- `_<weitere Punkte aus dem Starfish>_`

## 4. Was hat gebremst?

- **Die Ferien haben den Sprint geteilt.** Am 28.09. wurde nichts reviewt oder gemergt; die
  offenen PRs blieben über drei Wochen liegen. Am 19.10. musste alles an einem Tag passieren:
  18 PRs wurden gemergt, gleichzeitig wurden neue Stories angefangen. Nach den Ferien mussten
  sich alle zuerst wieder in den Stand einarbeiten.
- **Reviews hängen an zwei Personen.** Loris und Lars haben alle Reviews gemacht. Drei Personen
  kennen den Code der anderen nicht aus einem Review.
- **Neue Stories am letzten Tag statt fertig machen.** #20, #22 – #24 wurden am 19.10. als PR
  eröffnet und waren beim Review nicht fertig; #25 – #28 kamen erst danach.
- **Direkter Push auf `master`.** #25 ist auf `master`, ohne PR und ohne Review — die DoD lässt
  sich so umgehen, weil `master` nicht geschützt ist.
- **Veraltete Branches.** Wer nicht zuerst `master` holt, baut auf altem Stand und muss umbasen
  (z. B. #18, Umlaut-Fix #115).
- `_<weitere Punkte aus dem Starfish>_`

## 5. Verbesserungsmassnahme für Sprint 3 (genau eine)

> **Bis 11:30 hat jede Person im Team mindestens einen PR einer anderen Person mit dem eigenen
> GitHub-Konto reviewt (Approve oder Request changes, mit Kommentar, was geprüft wurde).**

- **Verantwortlich:** Scrum Master (fragt um 10:30 nach, wer noch kein Review hat)
- **Nachprüfbar um 11:30:** In den PRs von Sprint 3 stehen Reviews von fünf verschiedenen Konten.
  Fünf = erfüllt, weniger = nicht erfüllt.
- **Warum diese:** Die Sprint-1-Massnahme ist an genau diesem Punkt gescheitert — drei Personen
  haben nie reviewt. Mit einem Modultag ist «ein Review pro Person» realistisch und sofort prüfbar.
- **Nicht gewählt:** «Mehr kommunizieren» (nicht prüfbar), die Sprint-1-Massnahme unverändert
  wiederholen (zwei Reviews pro Person an einem halben Tag ist zu viel), «keine neuen Stories
  anfangen» (wichtig, aber in Sprint 3 ohnehin durch das Planning begrenzt).

## 6. Was daraus sofort folgt

| Erkenntnis | Sofortmassnahme | Wo |
|---|---|---|
| Direkter Push auf `master` möglich | Branch Protection für `master` aktivieren: «Require a pull request before merging» | GitHub-Settings (Lars) |
| #25 ohne Review auf `master` | Folge-PR für #25, der die ganze Story ins Review bringt | Sprint 3 |
| Veraltete Branches | Vor jedem neuen Branch `git pull` auf `master` | Arbeitsweise |
| Offene PRs #123 – #126 (Elina) | Im Planning entscheiden, ob sie in Sprint 3 kommen | Sprint 3 Planning |
| Umlaute | Neue Story «Texte mit korrekten Umlauten» im Backlog | Product Backlog |

**Protokoll:** Chime Dongkar (SM)
