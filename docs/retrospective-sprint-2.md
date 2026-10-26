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

**Was im Weg stand** (aus dem Starfish): Reviewen und Mergen lag bei zwei Personen
(«Reviewer aufteilen»), die PRs waren zu gross, und es wurde an Stories anderer weitergearbeitet,
ohne Abhängigkeiten abzusprechen.

## 2. Starfish-Board

| Keep | More Of | Less Of | Stop | Start |
| --- | --- | --- | --- | --- |
| Regelmässige Kommunikation (4 👍) — _Lars_ | Mehr kommunizieren, welche User Stories von anderen abhängig sind, im Daily (4 👍) — _Loris_ | Zu grosse Pull Requests (3 👍) — _Lars_ | An Stories von anderen arbeiten (2 👍) — _Loris_ | Reviewer aufteilen (3 👍) — _Chime_ |
| Reviewen von PRs (3 👍) — _Loris_ | Frühzeitiges Feedback zu Aufgaben (1 👍) — _Lars_ |  |  |  |
| Gegenseitige Unterstützung (2 👍) — _Nehir_ |  |  |  |  |
| Gute Zusammenarbeit im Team (1 👍) — _Lars_ |  |  |  |  |

**Action Item des Teams:** Mergen aufteilen.

## 3. Was hat funktioniert?

- **Sprintziel erreicht.** Startseite → Fall laden → Briefing → Tatort → Stellen untersuchen läuft
  auf `master`, alle Sprint-Stories (#1, #2, #6, #7, #8) sind nach DoD fertig.
- **Mehr Leute haben Code beigetragen.** Eigene PRs von Lars, Loris, Chime (#18) und Elina
  (#26 – #28); in Sprint 1 kam alles von einem Konto.
- **Reviews mit Inhalt.** Die Approves enthalten, was lokal geprüft wurde (z. B. bei #120:
  Tests, Durchklicken, API-Payload) und Hinweise für Folge-PRs.
- **Kommunikation und Zusammenarbeit** (Starfish Keep, 4 und 1 👍): Wir reden regelmässig
  miteinander und unterstützen uns gegenseitig (2 👍).

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
- **Zu grosse PRs** (Starfish Less Of, 3 👍): Grosse PRs sind schwer zu reviewen und blieben liegen.
- **Abhängigkeiten nicht abgesprochen** (More Of, 4 👍; Stop, 2 👍): Es wurde an Stories anderer
  weitergearbeitet, ohne dass klar war, welche Story auf welcher aufbaut (z. B. #22 → #23 → #24).

## 5. Verbesserungsmassnahme für Sprint 3 (genau eine)

Action Item des Teams: **«Mergen aufteilen»**, konkret gemacht, damit es um 11:30 prüfbar ist:

> **Bis 11:30 hat jede Person im Team mindestens einen PR einer anderen Person mit dem eigenen
> GitHub-Konto reviewt und gemergt.**

- **Verantwortlich:** Scrum Master (fragt um 10:30 nach, wer noch keinen PR gemergt hat)
- **Nachprüfbar um 11:30:** Bei den gemergten PRs von Sprint 3 stehen fünf verschiedene Konten als
  Reviewer und Merger. Fünf = erfüllt, weniger = nicht erfüllt.
- **Warum diese:** «Reviewer aufteilen» war der stärkste Start-Punkt (3 👍), und das Team hat sich
  auf «Mergen aufteilen» geeinigt. Die Sprint-1-Massnahme ist genau hier gescheitert: Reviews und
  Merges lagen bei Loris und Lars. Mit einem Modultag ist «ein PR pro Person» realistisch.
- **Nicht gewählt:** «Mehr kommunizieren» (nicht prüfbar), «kleinere PRs» (wichtig, aber an einem
  Tag schwer messbar), die Sprint-1-Massnahme unverändert wiederholen (zwei Reviews pro Person an
  einem halben Tag ist zu viel).

## 6. Was daraus sofort folgt

| Erkenntnis | Sofortmassnahme | Wo |
|---|---|---|
| Direkter Push auf `master` möglich | Branch Protection für `master` aktivieren: «Require a pull request before merging» | GitHub-Settings (Lars) |
| #25 ohne Review auf `master` | Folge-PR für #25, der die ganze Story ins Review bringt | Sprint 3 |
| Veraltete Branches | Vor jedem neuen Branch `git pull` auf `master` | Arbeitsweise |
| Offene PRs #123 – #126 (Elina) | Im Planning entscheiden, ob sie in Sprint 3 kommen | Sprint 3 Planning |
| Abhängigkeiten unklar | Im Daily sagt jede Person, auf welcher Story ihre Arbeit aufbaut | Daily Sprint 3 |
| Umlaute | Neue Story «Texte mit korrekten Umlauten» im Backlog | Product Backlog |

**Protokoll:** Chime Dongkar (SM)
