# Refinement — die fünf obersten Stories

Modul 426 · AP 25b · Auftrag 4.1 · Modultag 4, 07.09.2026

Refinement ist bei uns keine Zeremonie, sondern die laufende Arbeit am Kopf des Backlogs. Wir
haben **nur die fünf obersten Stories** angefasst — die, die für Sprint 1 in Frage kommen. Der
Rest des Backlogs (80 Issues) bleibt bewusst grob.

**Der überarbeitete Stand steht in den Issues selbst**, nicht in diesem Dokument. Hier steht,
*was* wir geändert haben und *warum*.

## 0. Aufräumen vor dem Refinement

Beim Durchgehen von oben fiel auf, dass die Stories 1 und 2 beim Anlegen des Boards doppelt
erzeugt wurden. **#3 und #4 sind geschlossen** (Duplikate von #1 und #2). Ohne das hätten wir
zwei Stories doppelt geschätzt und doppelt eingeplant.

Damit sind die fünf obersten Stories: **#1, #2, #5, #6, #7**.

## 1. Was an jeder Story geändert wurde

### #1 — Startseite anzeigen
*Als Spieler möchte ich beim Öffnen des Spiels eine Startseite sehen, damit ich sofort weiss, wie ich einen Fall beginne.*

| vorher | Problem | nachher |
|---|---|---|
| "Startseite ist unter der Root-URL erreichbar" | beschreibt eine Route, keinen beobachtbaren Zustand für den Spieler | "Beim Öffnen von `/` sind Spieltitel und ein Satz Kurzbeschreibung sichtbar" |
| "Button *Fall starten* ist sichtbar" | sichtbar wo? unter Scroll? | "Button *Fall starten* ist ohne Scrollen sichtbar und führt zum Laden des Falls" |
| — | **Fehlerfall fehlte komplett** | "Eine unbekannte Adresse (`/xyz`) führt zurück auf die Startseite, nicht auf eine leere Seite" |

### #2 — Fall laden
*Als Spieler möchte ich einen Fall laden, damit ich mit der Ermittlung beginnen kann.*

| vorher | Problem | nachher |
|---|---|---|
| "Falldaten werden aus dem Backend geladen" | technischer Arbeitsschritt, für den Spieler nicht beobachtbar | "Nach Klick auf *Fall starten* ist der Titel des geladenen Falls auf dem Bildschirm sichtbar" |
| "Ein Ladefehler wird als Meldung angezeigt" | welche Meldung? was kann der Spieler dann tun? | "Ist der Server nicht erreichbar, erscheint *Fall konnte nicht geladen werden* mit *Erneut versuchen*; die App bleibt bedienbar" |
| "Nach dem Laden erscheint das Briefing" | ok, bleibt — ist die Übergabe an #6 | unverändert, plus: "Während des Ladens ist ein Ladezustand sichtbar, kein leerer Bildschirm" |

### #5 — Team-Code eingeben
*Als Spieler möchte ich einen Team-Code eingeben, damit ich demselben Fall wie meine Mitspieler beitrete.*

| vorher | Problem | nachher |
|---|---|---|
| "Eingabefeld akzeptiert einen 6-stelligen Code" | widerspricht dem Format `XXX-XXX` aus CLAUDE.md | "Das Feld akzeptiert das Format `XXX-XXX`; Kleinbuchstaben werden gross dargestellt" |
| "Ein ungültiger Code zeigt eine Fehlermeldung" | Absicht, kein Zustand | "Falsches Format oder unbekannter Code: *Ungültiger Team-Code* unter dem Feld, die Eingabe bleibt stehen" |
| "Ein gültiger Code führt in den Fall" | nicht überprüfbar — in *welchen* Fall? | "Zwei Personen mit demselben Code sehen denselben Falltitel" |

### #6 — Fall-Briefing lesen
*Als Spieler möchte ich ein Fall-Briefing lesen, damit ich weiss, worum es im Fall geht.*

| vorher | Problem | nachher |
|---|---|---|
| "Briefing-Text wird beim Fallstart angezeigt" | Inhalt unbestimmt — was gehört rein? | "Briefing zeigt Falltitel, Tatzeit, Tatort und mindestens drei Sätze Text" |
| "Briefing ist später erneut aufrufbar" | ok, aber ohne Nachbedingung | "Über *Briefing* erneut zu öffnen und zu schliessen, ohne dass der Spielstand verloren geht" |
| — | **Fehlerfall fehlte** | "Fehlt im Fall ein Briefing-Text, erscheint *Kein Briefing verfügbar* statt einer leeren Box" |

### #7 — Tatort als Szene sehen
*Als Ermittler möchte ich den Tatort als Szene sehen, damit ich mir ein Bild der Situation machen kann.*

| vorher | Problem | nachher |
|---|---|---|
| "Tatortbild füllt die Ansicht" | bei welcher Bildschirmgrösse? | "Szene füllt die Ansicht bei 1280×720 und 1920×1080 ohne horizontales Scrollen" |
| "Szenenname wird angezeigt" | ok | "Szenenname ist dauerhaft als Overlay sichtbar" |
| "Rückkehr zum Dashboard ist möglich" | ok, Nachbedingung ergänzt | "*Zurück* führt zur vorherigen Ansicht, der Tatort ist danach erneut aufrufbar" |
| — | **Fehlerfall fehlte** | "Lädt das Szenenbild nicht, erscheint ein Platzhalter mit Szenenname statt einer weissen Fläche" |

## 2. Splitting-Entscheide

**Geprüft: Ist eine der fünf Stories zu gross für zwei Modultage?**

- **#7 Tatort als Szene** war der Kandidat. Die Diskussion beim Schätzen (3 vs. 8) zeigte, dass
  zwei Vorstellungen im Raum waren: eine reine Szenen-Ansicht gegen eine Szene mit anklickbaren
  Fundstellen. Das Anklicken ist bereits eine eigene Story (**#8**). Wir haben deshalb *nicht*
  gesplittet, sondern in den Akzeptanzkriterien festgehalten, dass #7 die Ansicht liefert und
  #8 die Interaktion. Danach war die Schätzung einig bei 5.
- **#2 Fall laden** enthält Laden, Ladezustand und Fehlerfall. Das ist derselbe Workflow-Schritt
  aus Spielersicht — ein Split entlang "erst laden, dann Fehler behandeln" würde ein Inkrement
  liefern, das niemand vorführen möchte. Bleibt ungeteilt.
- Nicht in Sprint 1, aber bereits gesplittet: **#13 Zwei Beweise kombinieren** (drei Stories,
  siehe [backlog-priorisierung.md](backlog-priorisierung.md), Abschnitt 3).

**Schnittlinie, an der wir *nicht* schneiden:** entlang technischer Schichten (erst Backend, dann
UI). Eine geladene JSON-Datei ohne Ansicht kann niemand benutzen. Technische Schritte sind bei
uns *Tasks unter einer Story*, nicht eigene Stories — siehe [sprint-1-planning.md](sprint-1-planning.md).

## 3. Ergebnis

Alle fünf Stories haben jetzt Rolle, Nutzen und **drei bis vier beobachtbare Akzeptanzkriterien
inklusive Fehlerfall**. Keine der fünf ist mehr ein Epic. Sie sind im Board aktualisiert und
damit schätzbar.
