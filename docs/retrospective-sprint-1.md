# Retrospective Sprint 1

Modul 426 · AP 25b · Modultag 6, 28.09.2026 · Timebox 20 Minuten · Moderation: Scrum Master
Methode: Starfish (Keep / More / Less / Start / Stop), verdichtet auf die drei Pflichtfragen.

**Teilnehmende:** Loris · Lars · Elina · Nehir · Chime

## 1. Massnahme aus Sprint 0 — umgesetzt?

> **Jede Person im Team hat bis zum Daily am Modultag 6 mindestens einen eigenen Pull Request
> im Repository gemergt** — eigener Branch, eigenes Issue, Review durch eine zweite Person.

**Nicht erfüllt.** Alle Pull Requests stammen vom Konto `lars11093`, die PRs zu den Sprint-Stories
(#97 – #100) sind offen, ohne Review und nicht auf `master`. Ein PR-Autor von fünf.

**Was im Weg stand** (aus dem Starfish):

- Tasks wurden verteilt statt selber gezogen — wer keinen Task zugeteilt bekam, hat keine Story
  übernommen.
- Lars hat allein gearbeitet, ohne Rückmeldung aus dem Team.
- Es wurde nicht kommuniziert, wann jemand fertig ist — offene PRs blieben unbemerkt liegen.
- An einzelnen User Stories wurde zu lange ohne Deadline gearbeitet, dazu kam Ablenkung.

## 2. Starfish-Board

| Keep | More Of | Less Of | Stop | Start |
| --- | --- | --- | --- | --- |
| Sprintziel klein halten — _Tenzing_ | Gegenseitiges Reviewen der User Stories — _Loris_ | Lars arbeitet allein — _Tenzing_ | Tasks verteilen statt User Stories selber ziehen — _Tenzing_ | Offene PRs im Daily ansprechen — _Tenzing_ |
| Aktiv austauschen, wo man steht — _Tenzing_ | Mehr kommunizieren → sagen, wenn man fertig ist — _Tenzing_ | Nicht lange an einer User Story arbeiten, Deadline setzen — _Tenzing_ | Ablenkung — _Tenzing_ | Board im Daily gemeinsam aktualisieren — _Tenzing_ |
|  |  | Allein arbeiten ohne Rückmeldung — _Tenzing_ |  |  |

## 3. Was hat funktioniert?

- **Das Sprintziel war bewusst klein.** Vier Stories, 11 SP, #5 bewusst draussen gelassen — das
  wollen wir beibehalten.
- **Das Sprintziel ist technisch umgesetzt.** Startseite, Fall laden, Briefing und Tatort-Szene
  existieren als klickbarer Weg — auf den Feature-Branches, lokal vorführbar.
- **Das Schätzen hat die Stories geschärft.** Planning Poker mit Anker (#1 = 1 SP) hat die
  Abgrenzung zwischen #7 und #8 und die Fehlerfälle in den Akzeptanzkriterien geklärt.
- **Wo wir uns ausgetauscht haben, lief es.** Der aktive Austausch über den Stand soll bleiben.

## 4. Was hat gebremst?

- **Nichts ist nach unserer DoD fertig.** Keine Story ist reviewt, gemergt und von einer zweiten
  Person durchgeklickt (DoD 2, 3, 5). Velocity Sprint 1: **0 von 11 SP**.
- **Die Arbeit lag wieder bei einer Person.** Lars hat allein und ohne Rückmeldung gearbeitet;
  das Problem aus Sprint 0 ist nicht kleiner geworden, sondern grösser.
- **Tasks wurden verteilt, nicht gezogen.** Dadurch fühlte sich niemand ausser dem Zugeteilten
  für eine Story verantwortlich.
- **Fertig wurde nicht gemeldet.** Niemand wusste, dass PRs auf ein Review warten.
- **Scope ausserhalb des Sprints.** Neben den vier Sprint-Stories wurden PRs zu elf weiteren
  Stories eröffnet (#5, #8 – #17 → PR #101 – #111) — Arbeit, die nie geplant war, statt die
  geplante abzuschliessen.
- **Das Board stimmt nicht.** 13 Karten stehen in `Done`, obwohl ihre PRs offen sind.

## 5. Verbesserungsmassnahme für Sprint 2 (genau eine)

> **Jeder Pull Request wird innerhalb eines Modultags von einer anderen Person reviewt, und jede
> Person im Team reviewt in Sprint 2 mindestens zwei PRs.**

- **Verantwortlich:** Scrum Master (spricht offene PRs im Daily an)
- **Nachprüfbar in der Retro Sprint 2:** Reviewer in den gemergten PRs
  (`gh pr list --state merged`). Fünf Namen mit je mindestens zwei Reviews = erfüllt.
- **Warum diese und keine andere:** Der grösste Cluster im Starfish war «allein arbeiten / kein
  Review / nicht melden, wenn fertig». Ohne Review erfüllt keine Story die DoD — und wer reviewt,
  muss den Code kennen, damit wird die Arbeit automatisch breiter verteilt.
- Nicht gewählt: «mehr kommunizieren» (nicht überprüfbar), die Sprint-0-Massnahme einfach
  wiederholen (hat schon einmal nicht gegriffen), «Board besser pflegen» (Symptom, nicht Ursache).

## 6. Was daraus sofort folgt

| Erkenntnis | Sofortmassnahme | Wo |
|---|---|---|
| Sprint-Stories nicht done | #1, #2, #6, #7 Sprint-Zuordnung entfernt, zurück ins Backlog | Board |
| Falsche Karten in `Done` | Karten mit offenem PR zurück ins Product Backlog | Board |
| Offene PRs bleiben liegen | Offene PRs sind fester Punkt im Daily | Daily Sprint 2 |
| Board nicht aktuell | Board wird im Daily gemeinsam aktualisiert | Daily Sprint 2 |
| Tasks verteilt statt gezogen | Im Sprint 2 Planning zieht jede Person selbst mindestens eine Story | Sprint 2 Planning |
| Ungeplante PRs #101 – #111 | Stories #8 – #17 zuerst ins Refinement, nicht ungeprüft übernehmen | Sprint 2 Planning |
