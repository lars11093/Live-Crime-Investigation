# Product Backlog – Priorisierung, INVEST, KI-Nachweis

Modul 426 · AP 25b · Auftrag 3.2 · Live Crime Investigation

## 1. Gewählte Priorisierungsmethode: MoSCoW

**Warum MoSCoW und nicht Eisenhower oder nutzenorientiert?**

Wir haben eine feste Zeitbox (9 Wochen, 3 Sprints) und einen Umfang, der grösser
ist als die Zeit. Genau dafür ist MoSCoW gedacht: Es zwingt uns, pro Story zu
entscheiden, ob sie für ein spielbares Produkt zwingend ist oder nicht.

Die Eisenhower-Matrix arbeitet mit *dringend* vs. *wichtig* — Dringlichkeit gibt
es bei uns nicht, alle Stories haben dieselbe Deadline. Die nutzenorientierte
Priorisierung braucht Nutzenwerte von echten Nutzern, die wir zu diesem Zeitpunkt
noch nicht haben.

| Stufe | Bedeutung bei uns | Sprint |
|---|---|---|
| Must | Ohne diese Story ist der Fall nicht spielbar | Sprint 1 |
| Should | Macht die Ermittlung deutlich besser, ist aber ersetzbar | Sprint 2 |
| Could | Nice-to-have, fällt bei Zeitdruck als Erstes weg | Sprint 3 |
| Won't | Bewusst ausgeschlossen (siehe unten) | – |

**Won't (für dieses Modul bewusst ausgeschlossen):**
Echtes Netzwerk-Multiplayer mit Lobbies und Synchronisation, Sprachausgabe,
mobile App, mehrere gleichzeitige Fälle pro Team.

Die Reihenfolge im Board ist die Priorisierung: Product Backlog von oben nach
unten = Must → Should → Could.

## 2. Warum steht Nummer 1 an erster Stelle?

Nummer 1 ist *Startseite anzeigen*. Sie steht oben, weil ohne sie keine einzige
andere Story demonstrierbar ist — es gibt schlicht keinen Einstiegspunkt. Sie ist
zudem die Story mit dem kleinsten Aufwand und den wenigsten Abhängigkeiten, also
das schnellste sichtbare Ergebnis für das erste Review.

Nummer 5 ist *Tatort anzeigen*. Fachlich ist sie spannender, aber sie setzt
voraus, dass ein Fall geladen werden kann (Nummer 2). Vor der Ladelogik gebaut,
müssten wir sie mit Dummy-Daten bauen und später nochmals anfassen.

## 3. INVEST-Check

Geprüft wurden alle 26 Must-Stories. Auffälligkeiten:

| Story | Verletzt | Konsequenz |
|---|---|---|
| Zwei Beweise kombinieren | **S**mall | zu gross – siehe Splitting unten |
| Forensik-Terminal öffnen | **I**ndependent | hängt an der Geräte-Datenstruktur; Reihenfolge im Sprint fixiert |
| Ermittlungsfortschritt anzeigen | **E**stimable | Aufwand unklar, solange die Fund-Gesamtzahl nicht definiert ist |

**Zu gross geschnitten: „Zwei Beweise kombinieren"**

Die Story enthält drei getrennte Probleme: Mehrfachauswahl im UI, die
Regel-Engine für gültige Kombinationen, und die Erzeugung eines neuen
Beweisobjekts. Splitting nach *Workflow-Schritten*:

1. Als Ermittler möchte ich zwei Beweise gleichzeitig auswählen können, damit ich
   sie zur Kombination vormerken kann.
2. Als Ermittler möchte ich beim Kombinieren eine Rückmeldung erhalten, ob die
   Kombination sinnvoll ist, damit ich nicht blind ausprobiere.
3. Als Ermittler möchte ich aus einer gültigen Kombination einen neuen Beweis
   erhalten, damit die Ermittlung weitergeht.

## 4. KI-Nutzungsnachweis (Reviewpunkt Auftrag 3.2)

### Übernommen

| Vorschlag | Warum übernommen |
|---|---|
| „Multiplayer/team gameplay" → „Collaborative team gameplay" | Der ursprüngliche Begriff verspricht ein Netzwerk-Multiplayer, das wir in 9 Wochen nicht seriös bauen. Die Umformulierung beschreibt, was wir tatsächlich liefern. |
| Eigenes Epic „Digitale Forensik" statt Verteilung auf andere Epics | Macht unser Alleinstellungsmerkmal im Backlog sichtbar und filterbar. |
| Splitting von „Zwei Beweise kombinieren" in 3 Stories | Die Story war klar zu gross für einen Sprint (INVEST: Small). |
| Business Goal „80 % der Testspieler verstehen das Spiel ohne Hilfe" | Erstes messbares Ziel im Vision Board. |

### Verworfen

| Vorschlag | Warum verworfen |
|---|---|
| Business Goal „Successfully complete Modul 426" streichen | Für uns ist das ein reales Projektziel, an dem die Sprintplanung hängt. Wir behalten es — aber getrennt von den Produktzielen. |
| Zielgruppe auf 9 Segmente ausweiten | Mehr Segmente heisst nicht mehr Klarheit. Wir bleiben bei vier klar unterscheidbaren Gruppen; die zusätzlichen Vorschläge waren Teilmengen davon. |
| Akzeptanzkriterien für alle 78 Stories | Der Auftrag verlangt sie für die wichtigsten Stories. Kriterien für Sprint-3-Stories wären zum jetzigen Zeitpunkt geraten und müssten vor dem Sprint ohnehin neu geschrieben werden. |
| Zusätzliche Stories für Achievements und Statistiken | Erweitert die Breite, ohne den Kern zu stärken. Bewusst als „Won't" ausgeschlossen. |
