# CASE//ZERO — Codex Agent Context

Realtime multiplayer detective game, TBZ Modul 426 (Scrum, 9 Wochen, 5 Personen). Voller Projektkontext: [README.md](README.md). Architektur-/Coding-Regeln sind identisch zu [CLAUDE.md](CLAUDE.md) — dieses File ist die Codex-CLI-Variante desselben Kontexts.

## Stack

React 18 + Vite + TS (`apps/web`) · Node/Express + Socket.IO + TS (`apps/server`) · gemeinsame Typen in `packages/shared` · npm workspaces · Vitest.

## Regeln

1. Server ist die einzige Quelle der Wahrheit für Rollen-Sichtbarkeit — nie rohe Case-Daten an den Client schicken, immer gefiltert nach Rolle (`apps/server/src/engine/`).
2. Case-Content (Beweise, Verdächtige, Timeline, Lösung) als JSON in `apps/server/src/data/`, nicht hartcodiert.
3. Geteilte Typen (Case, Role, Evidence, GameEvent, Accusation) in `packages/shared`, von beiden Apps importiert — nicht duplizieren.
4. Socket-Rooms = `case:<CODE>`, Code-Format `XXX-XXX`.
5. Dark-Terminal-UI ("Fake Police OS"), kein Blau als Akzentfarbe.

## Commands

```bash
npm install
npm run dev          # server:4000 + web:5173
npm run typecheck
npm run lint
npm run test
npm run build
```

## Vorgehen

- Ein Backlog-Item aus README Abschnitt 4 (Scrum) = eine Aufgabe = ein PR.
- CI (`.github/workflows/ci.yml`) muss grün sein: typecheck, lint, test.
- Bei Architektur-relevanten Änderungen: README Abschnitt 3 nachziehen.
