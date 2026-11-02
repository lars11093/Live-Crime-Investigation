# Retrospective Sprint 3

Modul 426 · AP 25b · 02.11.2026 · Moderation: Scrum Master (Chime)
Methode: Starfish (Keep / More / Less / Start / Stop)

**Teilnehmende:** Loris · Lars · Elina · Nehir · Chime

## 1. Massnahme aus Sprint 2 — umgesetzt?

> **Mergen aufteilen: Bis 11:30 hat jede Person im Team mindestens einen PR einer anderen Person
> mit dem eigenen GitHub-Konto reviewt und gemergt.**

**Nicht erfüllt.**

| Prüfpunkt | Ergebnis | Woran man es sieht |
|---|---|---|
| Fünf verschiedene Konten als Reviewer | ❌ | Approve-Reviews nur von Lars (#116 – #119, #123 – #127, #164 – #182) und Loris (#114, #155, #160 – #163) |
| Fünf verschiedene Konten als Merger | ❌ | Alle Feature-PRs hat Lars gemergt; Chime und Loris nur ihre eigenen Doku-PRs (#121, #122, #152 – #154) |
| Fertig machen vor neu anfangen | ❌ | Neben den 5 SP aus dem Sprint Backlog kamen über 25 ungeplante PRs dazu, die meisten am 01./02.11. in einem Zug gemergt |

## 2. Starfish-Board

| Keep | More Of | Less Of | Stop | Start |
| --- | --- | --- | --- | --- |
| Kleine PRs pro Story mit Tests | Früh reviewen, nicht alles am Ende | Ungeplante Stories während des Sprints | PRs aufeinander stapeln ohne Absprache | Reviews und Merges auf alle fünf verteilen |
| CI prüft jeden PR | Abhängigkeiten im Daily absprechen | Alle in `CaseLoaderPage.tsx` gleichzeitig | Identität vom Client übernehmen (Spieler-ID) | `CaseLoaderPage.tsx` in kleinere Komponenten aufteilen |

## 3. Was hat funktioniert?

Das Sprint Backlog war mit 5 SP realistisch und ist vollständig gemergt. Die Regel «Lösung bleibt auf dem Server» hat gehalten: jede neue Funktion (PIN, gelöschte Nachrichten, Hinweise) filtert in `engine/`. CI hat bei jedem Merge Fehler früh gezeigt.

## 4. Was nehmen wir mit?

Mehr fertig machen statt mehr anfangen: über 25 ungeplante PRs am Ende eines Sprints bedeuten Merge-Konflikte und Reviews unter Zeitdruck. Reviewen und Mergen gehört allen, nicht zwei Personen.
