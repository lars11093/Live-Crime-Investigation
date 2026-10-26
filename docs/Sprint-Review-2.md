# Sprint Review – Sprint 2

**Datum:** 26.10.2026 · **Ort:** TBZ
**Sprint:** 28.09.2026 – 26.10.2026 (Arbeitstage 28.09. und 19.10., dazwischen Herbstferien)
**Teilnehmende:** PO Lars · SM Chime · Devs: Loris, Elina, Nehir · Stakeholder: N. Fricker

## 1. Sprintziel

> Am 19. Oktober ist die Kernfunktion von CASE//ZERO, den Tatort untersuchen, zum ersten Mal auf
> `master` spielbar – eine fremde Person klickt ohne Erklärung vom Start bis in den Tatort und
> untersucht dort Stellen, und jede Story auf diesem Weg ist nach unserer DoD fertig.

**Erreicht:** Ja.
Alle Stories auf dem Weg sind auf `master` gemergt und von einer zweiten Person reviewt.
Auf `master` führt der Weg von der Startseite über Fall laden und Briefing in den Tatort; dort
lassen sich die Stellen anklicken, sie zeigen einen Detailtext und werden als untersucht markiert.

## 2. Gezeigtes Inkrement

Gezeigt live auf localhost:5173 von `master` (kein Arbeitsbranch): Startseite → Fall laden → Briefing →
Tatort → Stellen untersuchen. Gezeigt hat jeweils, wer die Story gebaut hat.

**Sprint Backlog**

| Story | SP | PR | Umgesetzt | DoD erfüllt |
|---|---|---|---|---|
| #1 Startseite anzeigen | 1 | #97 | ✅ | ✅ gemergt, Review Loris |
| #2 Fall laden | 3 | #98 | ✅ | ✅ gemergt, Review Loris |
| #6 Fall-Briefing lesen | 2 | #99 | ✅ | ✅ gemergt, Review Loris |
| #7 Tatort als Szene sehen | 5 | #100 | ✅ | ✅ gemergt, Review Loris |
| #8 Stellen im Tatort untersuchen | ___ | #102 | ✅ | ✅ gemergt, Review Loris |

**Velocity Sprint 2:** 11 SP (geplant 11 SP + #8)

**Zusätzlich gemergt, nicht im Sprint Backlog geplant:**

| Story | PR | Review |
|---|---|---|
| #5 Team-Code | #101 | Loris |
| #9 – #17 Beweisakte, Notizen, Kombinieren, Verdächtige, Aussagen, Widersprüche | #103 – #111 | Loris |
| #19 Chatverlauf eines Geräts | #112 | Lars |
| #21 Chatnachricht als Beweis sichern | #113 | Lars |
| #18 Forensik-Terminal | #120 | Loris |

Diese Stories zählen nicht zur Velocity des Sprintziels, sind aber nach DoD fertig und auf `master`.

## 3. Nicht fertig – und warum

| Story | PR | Stand |
|---|---|---|
| #20 Dateien auf einem Gerät öffnen | #116 | PR offen, kein Review |
| #22 Sehen, wer im Team ist | #117 | PR offen, kein Review |
| #23 Fund mit dem Team teilen | #118 | PR offen, kein Review |
| #24 Ermittlungsfortschritt sehen | #119 | PR offen, kein Review |
| Fix: `npm run dev` unter Windows | #114 | PR offen, kein Review |
| Fix: echte Umlaute statt ae/oe/ue | #115 | PR offen, kein Review, veraltet gegenüber `master` |

- Die PRs wurden am letzten Arbeitstag (19.10.) eröffnet und bis zum Review nicht mehr reviewt.
- Sie waren nicht im Sprint Backlog geplant.

**Konsequenz:**

- #20, #22, #23, #24: Sprint-Zuordnung entfernt, zurück ins Product Backlog. Die PRs bleiben offen.
- #114, #115: bleiben offen, gelten nicht als Sprint-2-Ergebnis.

## 4. Feedback

| Von | Feedback | Massnahme im Backlog |
|---|---|---|
| Team | Texte zeigen ae/oe/ue statt ä/ö/ü – wirkt unfertig | Neue Story «Texte mit korrekten Umlauten» |
| N. Fricker | ___ | ___ |
| ___ | ___ | ___ |

## 5. Anpassungen am Product Backlog

- #20, #22, #23, #24 ohne Sprint-Zuordnung zurück ins Backlog
- Neu: Story «Als Spieler möchte ich alle Texte mit korrekten Umlauten lesen, damit das Spiel
  professionell wirkt» (baut auf PR #115 auf)
- Pflichteinträge für Sprint 3 als Tasks ohne SP: Stabilisieren, Demo vorbereiten, Präsentation vorbereiten

## 6. Kurzfassung fürs Portfolio (Abschnitt 4, Review-Ergebnis)

Gezeigt: auf `master` Startseite → Fall laden → Briefing → Tatort → Stellen untersuchen, dazu
Beweisakte, Verdächtige und Forensik-Terminal. Sprintziel erreicht. Ins Backlog: #20, #22, #23,
#24 (offene PRs ohne Review) zurück; neue Story «Texte mit korrekten Umlauten».

**Protokoll:** Chime Dongkar (SM)
