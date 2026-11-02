# Sprint 1 — Planning

Modul 426 · AP 25b · Auftrag 4.2 · **07.09.2026 – 21.09.2026**

## 1. Sprintziel

> **Am 21. September können wir CASE//ZERO öffnen, einen Fall laden und im ersten Tatort stehen —
> ein durchgehender klickbarer Weg von der Startseite über das Briefing bis in die Szene.**

Das ist das kleinste Inkrement, das wir im Review *zeigen* können: kein Screenshot, kein
Zwischenstand, sondern ein Weg, den eine fremde Person ohne Erklärung durchklickt.

Bewusst **nicht** im Ziel: Spuren anklicken (#8), Beweise sammeln (#9), Team-Code (#5). Wir haben
zwei Modultage und planen lieber zu wenig.

## 2. Schätzung (Planning Poker)

Relativ geschätzt, Skala 1 · 2 · 3 · 5 · 8 · 13. **Anker:** #1 Startseite = 1 Story Point.

| Story | Titel (Kurzform) | Runde 1 | Runde 2 | Ergebnis | Sprint 1 |
|---|---|---|---|---|---|
| #1 | Startseite anzeigen | 1, 1, 1, 2, 1 | — | **1** | ✅ |
| #2 | Fall laden | 2, 3, 5, 3, 3 | 3, 3, 3, 3, 2 | **3** | ✅ |
| #6 | Fall-Briefing lesen | 2, 2, 1, 3, 2 | — | **2** | ✅ |
| #7 | Tatort als Szene sehen | 3, 8, 5, 5, 8 | 5, 5, 5, 5, 3 | **5** | ✅ |
| #5 | Team-Code eingeben | 3, 5, 3, 2, 3 | 3, 3, 3, 3, 5 | **3** | ⬜ Kandidat Sprint 2 |
| | **Summe Sprint 1** | | | **11 SP** | |

**Warum #5 nicht in Sprint 1:** Die Story zahlt nicht auf das Sprintziel ein — man kann den
Durchstich ohne sie vollständig vorführen. Ausserdem hängt an ihr die noch offene Frage, wie eine
Session serverseitig gehalten wird. Sie ist die erste Story für Sprint 2.

### Fünf Erkenntnisse aus unserer Schätzrunde

1. **Wir haben zuerst über die Lösung gestritten, nicht über die Grösse.** Bei #2 ging die erste
   Runde in eine Diskussion über `fetch` gegen Socket. Die Frage "wie gross im Vergleich zu #1?"
   war danach in dreissig Sekunden beantwortet.
2. **Der Anker entscheidet alles.** Erst als wir #1 als 1 festgelegt hatten, waren die Zahlen
   untereinander vergleichbar. Vorher hat jede Person gegen ihre eigene innere Stundenzahl
   geschätzt — und Stunden gingen um Faktor 3 auseinander.
3. **Auseinandergehende Karten kamen fast immer von unterschiedlichem Verständnis des Umfangs,
   nicht von unterschiedlicher Erfahrung.** #7 (3 gegen 8): Die eine Seite dachte an ein Bild mit
   Titel, die andere an anklickbare Fundstellen. Das war ein Refinement-Fehler, kein Schätzfehler.
4. **Stories ohne Fehlerfall in den Akzeptanzkriterien wurden systematisch zu tief geschätzt.**
   Nachdem wir bei #2 den Server-nicht-erreichbar-Fall ergänzt hatten, stieg die Schätzung von 2
   auf 3. Der Fehlerfall ist Arbeit, auch wenn er im Titel nicht vorkommt.
5. **Die Diskussion war der Ertrag, nicht die Zahl.** Aus zwei Schätzrunden sind vier präzisere
   Akzeptanzkriterien und eine Abgrenzung zwischen #7 und #8 entstanden. Die Summe 11 SP sagt uns
   heute noch nichts — erst nach Sprint 1 haben wir eine Velocity, gegen die wir sie halten können.

## 3. Sprint Backlog — Stories in Tasks gebrochen

Ein Task ist so gross, dass eine Person ihn an einem Modultag schafft. Tasks sind der Bauplan;
die Story bleibt gemeinsame Verantwortung des Teams.

### #1 Startseite anzeigen — 1 SP
| Task | Gezogen von |
|---|---|
| Route `/` mit Titel, Kurzbeschreibung und Button `Fall starten` aufsetzen | Lars (PR #97) |
| Dark-Terminal-Grundstil (Farben, Schrift, Layout-Container) als wiederverwendbares CSS | Lars (PR #97) |
| Catch-all-Route: unbekannte Adresse führt zurück auf `/` | Lars (PR #97) |

### #2 Fall laden — 3 SP
| Task | Gezogen von |
|---|---|
| Case-JSON-Grundgerüst in `apps/server/src/data/` + Typ in `packages/shared` | Lars (PR #98) |
| Server-Endpunkt, der den Fall ausliefert | Lars (PR #98) |
| Client: Laden, Ladezustand, Fehlermeldung mit `Erneut versuchen` | Lars (PR #98) |

### #6 Fall-Briefing lesen — 2 SP
| Task | Gezogen von |
|---|---|
| Briefing-Ansicht (Titel, Tatzeit, Tatort, Text) aus den Falldaten | Lars (PR #99) |
| Erneut-Öffnen und Schliessen ohne Verlust des Spielstands | Lars (PR #99) |

### #7 Tatort als Szene sehen — 5 SP
| Task | Gezogen von |
|---|---|
| Szenen-Datenstruktur im Case-JSON (Name, Bildpfad) | Lars (PR #100) |
| Vollflächige Szenen-Ansicht, geprüft bei 1280×720 und 1920×1080 | Lars (PR #100) |
| Overlay mit Szenenname + `Zurück` | Lars (PR #100) |
| Platzhalter, wenn das Szenenbild nicht lädt | Lars (PR #100) |

> Für die MVP-Phase war ein Platzhalterpfad vorgesehen. Echtes Bildmaterial sollte aus Copyright-
> und Repo-Grössen-Gründen nicht eingecheckt werden.

## 4. Erstes Daily Scrum

10 Minuten, im Stehen, Scrum Master hält die Timebox. Keine Problemlösung im Daily — Hindernisse
werden benannt und danach gelöst. Blocker bekommen im Board das Label `Impediment`.

| Person | Woran arbeite ich als Erstes? | Was brauche ich von jemandem? | Was blockiert mich? |
|---|---|---|---|
| Lars | #2 Fall laden: Case-JSON-Grundgerüst und Server-Endpunkt, danach Route `/` für #1 | Review meiner PRs, sobald sie offen sind | Nichts |
| Loris | Case-JSON-Struktur und Akzeptanzkriterien von #2 durchlesen, damit ich Lars' PRs reviewen kann | Kurze Erklärung der Ordnerstruktur im Monorepo | Nichts |
| Elina | Akzeptanzkriterien von #6 Briefing durchgehen und Testfälle zum Durchklicken notieren | Die Falldaten aus #2 | #2 ist noch nicht fertig |
| Nehir | Projekt lokal aufsetzen (`npm install`, `npm run dev`) und #7 Tatort-Ansicht anschauen | Hilfe beim Setup | Dev-Server startet bei mir noch nicht |
| Chime | Board einrichten, Story Points ins Feld `Story Points` übertragen, Board-Zugriff für N. Fricker vorbereiten | Admin-Rechte im Repo von Lars | Nichts |

**Bekannte Abhängigkeit im Sprint:** #6 und #7 brauchen die Falldaten aus #2. Wer #6 oder #7
zieht, beginnt mit dem, was ohne echte Daten geht (Layout, Platzhalterzustände), und zieht die
Daten nach, sobald der Endpunkt steht.

## 5. Abschlussstand der damaligen Planung

| Punkt | Nachweisbarer Stand |
|---|---|
| Board-Zugriff für den Stakeholder | Einladung an N. Fricker über `Settings → Collaborators` verschickt. |
| Zuteilung einzelner Tasks | Lars hat die Tasks von #1, #2, #6 und #7 gezogen und umgesetzt (PRs #97 – #100), Loris hat reviewt. |
| Story Points im Projects-Board | Ins Feld `Story Points` übertragen, zusätzlich als Label `SP: n` gesetzt. |
