# CASE//ZERO — Claude Code Context

Realtime multiplayer detective game. TBZ Modul 426, Scrum, 9-Wochen-Projekt, 5-Personen-Team. Voller Kontext: [README.md](README.md).

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript, `apps/web`
- **Backend**: Node.js + Express + Socket.IO, TypeScript, `apps/server`
- **Shared**: gemeinsame Typen in `packages/shared` (von web + server importiert via `@case-zero/shared`)
- **State**: In-Memory Room Store im Server-Prozess — keine Datenbank für MVP, Case-Content liegt als JSON in `apps/server/src/data/`
- **Tests**: Vitest
- **Package-Manager**: npm workspaces (Root `package.json`)

## Architektur-Regeln

- Rollen-Exklusivität ist server-seitig durchzusetzen: der Client bekommt nur die Payload seiner eigenen Rolle, nie den vollen Case-State. Filterung passiert in `apps/server/src/engine/`, niemals im Frontend.
- Case-Inhalte (Beweise, Verdächtige, Timeline, Lösung) sind Daten (JSON), keine Code-Logik — neue Fälle sollen ohne Server-Code-Änderung hinzufügbar sein.
- Jede Socket-Room entspricht genau einer laufenden Case-Session (`case:<code>`), Code-Format `XXX-XXX` (3 alphanumerisch, Bindestrich, 3 alphanumerisch).
- Gemeinsame Typen (Case, Role, Evidence, GameEvent, Accusation) gehören in `packages/shared`, nicht dupliziert in web/server.
- Kein Blau als Akzentfarbe im UI — Dark-Terminal-Theme ("Fake Police OS"), siehe README Abschnitt 5.

## Commands

```bash
npm install
npm run dev            # server (4000) + web (5173) parallel
npm run typecheck
npm run lint
npm run test
npm run build
```

## Scrum-Kontext

Backlog und Sprint-Plan stehen in README.md Abschnitt 4. Wenn du über die GitHub Action (`@claude` in einem Issue/PR) getriggert wirst: das referenzierte Issue ist üblicherweise ein Product Backlog Item aus diesem Plan — die Story im Issue-Titel ist die Quelle der Wahrheit für Scope, nicht die grobe Sprint-Beschreibung im README.

## Arbeitsweise

- Kleine, fokussierte PRs pro Story — nicht mehrere Sprint-Items in einem PR bündeln.
- Nach jeder Änderung an Socket-Events oder Case-JSON-Schema: README Abschnitt 3 (Architektur/Datenfluss) aktuell halten.
- Keine echten Audio-/Video-Assets committen (Copyright/Repo-Grösse) — Platzhalter-Pfade + TODO-Kommentar reichen für die MVP-Phase.
