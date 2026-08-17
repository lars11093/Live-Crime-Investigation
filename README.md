# 🕵️ CASE//ZERO — Live Crime Investigation

Realtime multiplayer detective/forensics game. Five players, five different interfaces, one shared crime. Nobody can solve the case alone — the game forces information exchange between roles, synced live over WebSockets.

Built for TBZ Modul 426 (Scrum-Projekt, 9 Wochen, 5-köpfiges Team).

> Project GitHub: `lars11093/Live-Crime-Investigation`

---

## 1. Pitch

Ein einziger, aber brutal hochwertiger Fall statt zehn oberflächlicher. Fünf Spieler, fünf exklusive Rollen, ein geteiltes Evidence Board, Live-Events, ein Fake-Police-OS-Look. Kein Detective-Quiz — ein synchrones digitales Ermittlungssystem.

| Rolle | Exklusiver Zugriff |
|---|---|
| 🔬 Forensiker | DNA, Fingerabdrücke, Autopsie |
| 💻 Cyber Investigator | Handys, Chats, Dateien, Metadaten |
| 🗣️ Verhör-Spezialist | Verdächtige befragen |
| 📍 Field Detective | Orte, CCTV, Zeugenaussagen |
| 🧠 Lead Detective | Timeline & Evidence Board verwalten |

Ein Fall hat 2–3 mögliche Täter-Szenarien (`CaseEngine` wählt beim Case-Start eines aus und aktiviert dazu passende Beweise/Nachrichten/Aussagen) — damit kann niemand die Lösung vorab verraten.

## 2. Tech Stack

| Layer | Wahl | Warum |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | schnell, gleiche Basis wie bestehende TBZ-Projekte (GymFish) |
| Realtime | Socket.IO (WebSocket) | Zentraler Game-State, bidirektional, Raum-Konzept (`case-code`) eingebaut |
| Backend | Node.js + Express + TypeScript | leichtgewichtig, ein Prozess hält den Live-State der Session |
| State (Server) | In-Memory Room Store | Game-Sessions sind kurzlebig (ein Fall = eine Sitzung), keine DB nötig für MVP |
| Case-Daten | JSON (`apps/server/src/data/*.json`) | Fälle sind Content, nicht Code — leicht erweiterbar (2. Fall, 3. Fall) |
| Styling | Plain CSS, Dark-Terminal-Theme | passt zum "Fake Police OS" Look, kein Framework-Overhead |
| Tests | Vitest | schnell, TS-nativ, für Server-Engine-Logik und Komponenten |
| Package-Manager | npm workspaces (Monorepo) | ein Repo für `apps/web`, `apps/server`, `packages/shared` |
| CI/CD | GitHub Actions | Lint + Typecheck + Test bei jedem PR |
| AI-Pairing | Claude Code (GitHub App) + Codex CLI | siehe [CLAUDE.md](CLAUDE.md) / [AGENTS.md](AGENTS.md) |

**Bewusst nicht genutzt:** AR, NFC (Web NFC ist nicht Baseline-fähig), Gesichtserkennung, komplett AI-generierte Fälle — zu hoher Aufwand/Risiko für 9 Wochen, siehe Abschnitt 7 (Out of Scope).

## 3. Architektur

```
Live-Crime-Investigation/
├── apps/
│   ├── server/            Express + Socket.IO — hält den Live-Game-State
│   │   └── src/
│   │       ├── index.ts       Server-Bootstrap, Socket-Events
│   │       ├── engine/         Room-/Case-Engine (Raumverwaltung, Szenario-Auswahl, Scoring)
│   │       └── data/           Case-JSONs (Beweise, Verdächtige, Timeline, Lösung)
│   └── web/                React SPA — 5 rollenspezifische Dashboards
│       └── src/
│           ├── pages/          Join, Lobby, RoleDashboard
│           ├── components/     EvidenceBoard, Terminal-UI-Bausteine
│           └── lib/            Socket-Client-Wrapper
├── packages/
│   └── shared/             Gemeinsame TS-Typen (Case, Evidence, Role, GameEvent) — von web UND server importiert
├── .github/workflows/      CI (Lint/Typecheck/Test) + Claude Code Action
├── CLAUDE.md                Kontext für Claude Code (autonome Bearbeitung)
└── AGENTS.md                Kontext für Codex CLI (autonome Bearbeitung)
```

**Datenfluss (Kernloop):**
1. Lead Detective erstellt Case → Server generiert `CASE CODE` (z.B. `7K4-XP9`), wählt Täter-Szenario, hält Room-State im Speicher.
2. Andere 4 Spieler joinen mit Code + wählen Rolle → Socket-Room `case:<code>` beitreten.
3. Server pusht rollenspezifische Payloads (`role:payload`) — jeder Client sieht nur, was seine Rolle darf.
4. Aktionen (Board verbinden, Beweis anzeigen, Verhör-Antwort) gehen als Socket-Events zum Server, der validiert + an alle im Room broadcastet (`board:update`, `event:new`).
5. Case-Engine feuert zeitbasierte Live-Events (`NEW_EVIDENCE`, `STATEMENT_CHANGED`, `SERVER_BREACH`) nach Skript im Case-JSON.
6. Lead Detective reicht Accusation ein → Server vergleicht mit dem aktiven Szenario → `CASE SOLVED` Score-Payload an alle.

## 4. Scrum-Setup

- **Rollen:** Product Owner (Anforderungen/Abnahme), Scrum Master (Prozess), 5 Entwickler (auch Product-Owner/SM sind gleichzeitig Devs im Team).
- **Sprints:** 2 Wochen, insgesamt 4 Sprints à 2 Wochen + 1 Woche Puffer/Präsentation (9 Wochen total).
- **Ritual:** Daily Standup (kurz), Sprint Planning zu Sprintbeginn, Sprint Review + Retro zu Sprintende.
- **Backlog-Werkzeug:** GitHub Issues + Projects Board (Spalten: `Backlog`, `Sprint Backlog`, `In Progress`, `Review`, `Done`).
- **Definition of Done:** Code gemerged in `main`, CI grün (Lint+Typecheck+Test), manuell mit 2+ Browser-Tabs durchgespielt, README/CLAUDE.md aktualisiert falls Architektur betroffen.

### Sprint-Plan (Vorschlag)

| Sprint | Ziel | Kern-Stories |
|---|---|---|
| **0** (Setup-Woche) | Grundgerüst steht | Repo/Monorepo, CI, Socket-Verbindung Hello-World, Scrum-Board eingerichtet |
| **1** | Join-Flow + Rollen | Case erstellen/joinen mit Code, Rollenwahl, Lobby-Sync, 5 leere Rollen-Dashboards |
| **2** | Case-Content + Evidence Board | Case-JSON-Schema, Case-Engine (Szenario-Auswahl), Evidence Board (Nodes verschieben/verbinden), Sync über Socket |
| **3** | Rollenspezifische Features | Forensik-Panel (Fingerabdruck-Match-Animation), Cyber-Panel (Chat/Metadaten), Field-Panel (CCTV-Liste), Verhör-Panel (Fragen/Antworten) |
| **4** | Live-Events + Accusation + Polish | Zeitgesteuerte Events, Timeline im Lead-Dashboard, Accusation-Flow + Scoring, Dark-Terminal-UI-Politur |
| **Puffer** | Bugfixing, Präsentation üben | Testlauf mit 5 echten Spielern, Präsentations-Skript, Deploy |

### Beispiel-Backlog (Product Backlog Items → als GitHub Issues anlegen)

- [ ] Als Lead Detective will ich einen Case-Code generieren können, damit mein Team joinen kann.
- [ ] Als Spieler will ich per Code + Rollenwahl einer laufenden Session beitreten.
- [ ] Als Forensiker will ich einen Fingerabdruck-Scan mit Ladeanimation und Match-Prozent sehen.
- [ ] Als Cyber Investigator will ich gelöschte Nachrichten "wiederherstellen" können.
- [ ] Als Field Detective will ich CCTV-Kameras durchklicken und Beweise entdecken können.
- [ ] Als Lead Detective will ich Beweise auf dem Evidence Board verschieben und verbinden können, synchron für alle sichtbar.
- [ ] Als Team wollen wir zeitgesteuerte Live-Events erhalten (neue Beweise, geänderte Aussagen).
- [ ] Als Lead Detective will ich am Ende eine Accusation abgeben (Täter, Motiv, Waffe, Zeit) und ein Score-Ergebnis sehen.
- [ ] Als Entwickler will ich, dass CI bei jedem PR Lint/Typecheck/Test ausführt.

## 5. Features & Workflows (User Flows)

### 5.1 Session-Start
```
Lead Detective öffnet case-zero.ch → "Create Case"
  → Server wählt Case + Täter-Szenario, erzeugt Code "7K4-XP9"
  → Andere 4 Spieler öffnen case-zero.ch → "Join" → Code eingeben
  → Rollenwahl (jede Rolle nur 1x vergeben)
  → Alle 5 in Lobby → Lead startet Case
```

### 5.2 Kernschleife während des Spiels
```
Server-Timer feuert Event laut Case-Skript
  → z.B. Minute 5: "NEW CCTV FOOTAGE AVAILABLE" → nur Field Detective sieht Video
  → Spieler entdeckt Detail → teilt es verbal/im Team-Chat mit anderen Rollen
  → Lead Detective trägt Erkenntnis als Node auf Evidence Board ein
  → Verbindung zwischen zwei Nodes herstellen → Server validiert gegen Lösung
     → falls Teil der korrekten Kette: "CONNECTION DISCOVERED" Feedback an alle
```

### 5.3 Abschluss
```
Lead Detective öffnet "Make Accusation"
  → wählt Suspect, Motiv, Waffe, Zeit, verknüpfte Beweise
  → Submit → Server vergleicht mit Szenario-Lösung
  → "VERIFYING THEORY..." Animation → Score-Screen (Accuracy, Evidence-Quote, Hints, Zeit, Punkte)
```

### 5.4 Feature-Liste (MVP für die 9 Wochen)
- Case erstellen/joinen per Code (Socket-Rooms)
- Rollenbasierte, exklusive Informationsverteilung (Server entscheidet, wer was sieht)
- Gemeinsames Evidence Board: Nodes hinzufügen, verschieben, verbinden — live synchron
- Digital-Forensics-Panels: Fingerabdruck-Match, Datei-Hash-Vergleich, Metadaten, gelöschte Nachrichten
- Zeitgesteuerte Live-Events vom Server (Case-Skript-getrieben)
- Timeline-Ansicht für Lead Detective
- Accusation-Flow mit Scoring am Ende
- Dark "Police OS" Terminal-UI

### 5.5 Backlog nach MVP (falls Zeit übrig bleibt)
- Case Creator (eigene Fälle bauen)
- Zweiter Case
- Telefonanruf-Feature mit vorproduzierten Audiofiles
- Achievements / Leaderboard (würde Persistenz/DB nötig machen)

## 6. Setup & Entwicklung

Voraussetzung: Node.js ≥ 20.

```bash
npm install                 # installiert alle Workspaces (web, server, shared)
npm run dev                 # startet Server (Port 4000) + Web (Port 5173) parallel
npm run dev:server          # nur Server
npm run dev:web             # nur Web
npm run typecheck           # TS-Check über alle Workspaces
npm run lint                # ESLint über alle Workspaces
npm run test                # Vitest über alle Workspaces
npm run build               # Production-Build aller Workspaces
```

Zum Testen des Multiplayer-Flows: mehrere Browser-Tabs/-Profile gegen `http://localhost:5173` öffnen, mit demselben Case-Code joinen.

## 7. Out of Scope (bewusst nicht gemacht)

- **AR** — cool, aber unnötiges Risiko für 9 Wochen.
- **NFC-Tags** — Web NFC ist kein Baseline-Feature, eingeschränkte Browser-Unterstützung.
- **Komplett AI-generierte Fälle** — zu unberechenbar für ein bewertetes Schulprojekt.
- **10 Fälle** — ein einziger, hochwertiger Fall ist die bessere Zeitinvestition.
- **Gesichtserkennung** — hoher Aufwand für wenig Modulnutzen.

## 8. AI-Pairing Setup

Dieses Projekt ist für autonome Weiterarbeit mit Claude Code und Codex CLI eingerichtet:

- [CLAUDE.md](CLAUDE.md) — Projektkontext für Claude Code (lokal via `claude` CLI, und via GitHub Action `.github/workflows/claude.yml` wenn `@claude` in einem Issue/PR erwähnt wird)
- [AGENTS.md](AGENTS.md) — Projektkontext für Codex CLI (`codex` liest AGENTS.md automatisch)

**GitHub Action Setup (manuell, einmalig):**
1. Repo `lars11093/Live-Crime-Investigation` auf GitHub erstellen/verbinden (falls noch nicht geschehen) und diesen lokalen Ordner pushen.
2. Im Terminal: `claude setup-token` ausführen (interaktiver Login über euer Claude Abo, kein API-Key nötig).
3. Den erzeugten Token als Repo-Secret `CLAUDE_CODE_OAUTH_TOKEN` unter `Settings → Secrets and variables → Actions` hinterlegen.
4. Fertig — ab jetzt reagiert `@claude` in Issues/PR-Kommentaren automatisch (Workflow liegt bereits in `.github/workflows/claude.yml`).
