# Refinement für Sprint 3

Modul 426 · AP 25b · Auftrag 8.1, Schritt 3 · Modultag 8, 26.10.2026 · Timebox 15 Minuten

**Ziel von Sprint 3 (Sprintleitfaden):** Das Produkt ist präsentierbar.
**Rahmen:** Sprint 3 hat einen einzigen Modultag. Jede Story muss an einem Vormittag fertig sein,
inklusive Review und Merge nach DoD. Ausgewählt wird erst im Planning nach der Pause.

> **Vorbereitung mit KI (Claude):** Reihenfolge, Akzeptanzkriterien für Stories ohne Kriterien
> und Schätzungen sind **Vorschläge**. Sie werden im Refinement vom Team besprochen, angepasst und
> mit Planning Poker bestätigt. Was das Team ändert, wird in der Spalte «Entscheid Team» festgehalten.

## 1. Priorisierung — was muss am Ende von Sprint 3 funktionieren?

Für eine Präsentation braucht CASE//ZERO ein **Ende**: Heute kann man ermitteln, aber keinen Fall
abschliessen. Der Weg Täter wählen (#25, auf `master`) → Beweise anhängen → Anklage absenden →
Auflösung sehen fehlt noch. Deshalb steht die Anklage oben. Danach kommt, was beim Zeigen
stört (Umlaute), dann neue Funktionen.

| Rang | Eintrag | SP (Vorschlag) | Stand | Ready? | Entscheid Team |
|---|---|---|---|---|---|
| 1 | #26 Beweise an die Anklage anhängen | 2 | PR #123 offen, Approve Lars | ✅ | |
| 2 | #27 Anklage absenden und danach sperren | 2 | PR #124 offen, Approve Lars, braucht #26 | ✅ | |
| 3 | #28 Auflösung des Falls nach der Anklage | 3 | PR #125 offen, Approve Lars, braucht #27 | ✅ | |
| 4 | **Neu:** Texte mit korrekten Umlauten (Review-Feedback) | 2 | baut auf PR #115 auf | ✅ | |
| 5 | #53 Bestätigung vor dem endgültigen Absenden | 1 | neu | ✅ nach Refinement | |
| 6 | #70a Gesperrtes Smartphone mit PIN entsperren (Split von #70) | 3 | neu | ✅ nach Refinement | |
| – | #29 Anmelden | – | PR #126 offen | ❌ keine Akzeptanzkriterien, nicht nötig für «präsentierbar» | |

**Abhängigkeit (Retro: «Abhängigkeiten im Daily kommunizieren»):** #26 → #27 → #28 müssen in dieser
Reihenfolge gemergt werden. Wer #27 reviewt, wartet auf den Merge von #26.

## 2. Ready-Stories im Detail

### #26 Als Ermittler möchte ich meiner Anklage Beweise anhängen, damit ich sie begründen kann.
- [ ] Mindestens ein Beweis muss angehängt werden
- [ ] Angehängte Beweise werden aufgelistet
- [ ] Beweise können wieder entfernt werden

Kriterien bestehen im Issue. Der Code liegt in PR #123; offen sind nur Merge und Durchklicken (DoD 5).

### #27 Als Ermittler möchte ich die Anklage absenden, damit der Fall bewertet wird.
- [ ] Absenden ist nur mit Täter und mindestens einem Beweis möglich
- [ ] Nach dem Absenden ist keine Änderung mehr möglich
- [ ] Eine Bestätigung wird angezeigt

Kriterien bestehen im Issue. Code in PR #124.

### #28 Als Spieler möchte ich nach der Anklage die Auflösung des Falls sehen, damit ich verstehe, was tatsächlich passiert ist.
- [ ] Der Auflösungstext wird angezeigt
- [ ] Richtige und falsche Schlüsse werden benannt
- [ ] Das Ergebnis (gelöst / nicht gelöst) ist klar erkennbar

Kriterien bestehen im Issue. Code in PR #125. Die Lösung muss weiterhin auf dem Server bleiben
(CLAUDE.md): Der Client bekommt die Auflösung erst nach dem Absenden.

### Neu: Als Spieler möchte ich alle Texte mit korrekten Umlauten lesen, damit das Spiel professionell wirkt.
- [ ] Alle sichtbaren UI-Texte verwenden ä, ö, ü statt ae, oe, ue (z. B. «Zurück zur Fallakte», «Geräte», «Verdächtige»)
- [ ] Alle Fallinhalte in `case-01.json` verwenden echte Umlaute
- [ ] Wörter, die korrekt mit ue/ae/oe geschrieben werden, bleiben unverändert (z. B. «neue», «Steuer»)
- [ ] Beim Durchklicken Start → Briefing → Tatort → Beweisakte → Verdächtige → Forensik-Terminal → Anklage steht nirgends ae/oe/ue anstelle eines Umlauts

Nur Text, keine Logik. PR #115 ist veraltet und muss auf den aktuellen `master` gebracht werden.

### #53 Als Spieler möchte ich vor dem endgültigen Absenden eine Bestätigung sehen, damit ich nicht versehentlich abschliesse.
*Vorschlag Akzeptanzkriterien (Issue hat noch keine):*
- [ ] Nach Klick auf «Anklage absenden» erscheint die Frage «Anklage endgültig absenden?» mit Täter und Anzahl Beweise
- [ ] «Abbrechen» schliesst die Frage, Täter und Beweise bleiben unverändert
- [ ] Erst «Absenden» in der Frage sendet die Anklage und sperrt sie (#27)

Hängt von #27 ab.

### #70a Als Ermittler möchte ich ein gesperrtes Smartphone mit der richtigen PIN entsperren, damit ich an die Nachrichten darauf komme.
*Split von #70 (zu gross für einen Vormittag): PIN-Entsperren zuerst; Passwort-Laptop und Hinweise auf
die PIN bleiben in #70.*

*Vorschlag Akzeptanzkriterien:*
- [ ] Bei einem gesperrten Smartphone erscheint im Forensik-Terminal ein Feld für eine 4-stellige PIN
- [ ] Mit der richtigen PIN ist das Gerät entsperrt und der Chatverlauf öffnet sich (#19)
- [ ] Bei falscher PIN erscheint «PIN falsch», das Gerät bleibt gesperrt
- [ ] Die richtige PIN steht nur auf dem Server und wird dort geprüft, nie im Browser

## 3. Pflichteinträge für Sprint 3 (Tasks ohne Story Points)

| Task | Inhalt |
|---|---|
| **Stabilisieren** | `master` einmal komplett durchklicken, Fehler beheben; #25 (ohne PR auf `master`) nachträglich reviewen; `npm run dev` unter Windows (PR #114) |
| **Demo vorbereiten** | Demo-Ablauf festlegen (wer zeigt was, in welcher Reihenfolge), Demo-Gerät mit aktuellem `master` bereit, einmal Probe-Durchlauf |
| **Präsentation vorbereiten** | Präsentation für das Klassen-Review: Produkt, Erfahrungen mit Scrum, KI-Nutzung transparent |

## 4. Bewusst nicht ready

- **#29 Anmelden (PR #126):** keine Akzeptanzkriterien im Issue, trägt nicht zu «präsentierbar» bei. Bleibt im Backlog.
- **#70 Rest (Laptop mit Passwort, Hinweise zur PIN):** nach #70a.
- **#30 – #80:** für Sprint 3 zu weit unten.
