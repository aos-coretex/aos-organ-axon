# Axon Organ (#280)

## Identity

- **Organ:** Axon (UI control surface)
- **Number:** 280
- **Profile:** Deterministic
- **Version:** 0.1.0
- **Ports:** 4051 (AOS) / 3951 (SAAS)
- **Vite dev:** 4050

## What This Is

Axon is the Coretex Admin website as a persistent organ on Spine ESB. It serves the React SPA frontend and provides an Express API layer with Spine connectivity for real-time event push and command dispatch.

**Clean break from monolith (binding decision, RFI 2026-04-08):** Axon ESB is a fresh environment. No database connections. No monolith references. No ai-kb.db. No direct PostgreSQL connections. Only standalone UI pages were transferred. Data-driven pages will be built fresh against ESB organ APIs in future relays.

## Current State

- `createOrgan()` factory integration (Spine, health, introspect, live loop)
- 15 standalone pages transferred (homepage, projects, product details, informational)
- UI WebSocket `/ws` for Spine broadcast push to React clients
- `useSpineEvents()` React hook for consuming WebSocket events
- Spine command handlers (dashboard_refresh, notification)
- Dispatch routes for OTMs to Vigil, Glia, SafeVault, GitSync
- 23 tests passing (API, Spine commands, static serving, WebSocket)

## Pages NOT Transferred (Future Relays)

These pages require ESB organ APIs and will be rebuilt fresh:

| Page | ESB Data Source | Status |
|---|---|---|
| Capture Bus | Spine ESB (:4000) | Pending |
| Continuous Verification | Vigil ESB (:4015) | Pending |
| Autoheal | Glia ESB (:4016) | Pending |
| Radiant Dashboard | Radiant ESB (:4006) | Pending |
| Minder Dashboard | Minder ESB (:4007) | Pending |
| Syntra Dashboard | Syntra ESB (future) | Pending |
| Spine Activity | Spine ESB (:4000) | Pending |
| Control Surface | TBD | Pending |
| Login | Session auth (Phi) | Pending |

## Running

```bash
npm install       # Install dependencies
npm test          # Run 23 unit tests
npm run build     # Build React SPA to dist/
npm start         # Start organ (requires Spine + dependencies)
npm run dev       # Vite dev server (port 4050, proxies to 4051)
```

## Architecture

```
server/
  index.js              # createOrgan() entry point
  config.js             # Port, binding, tier config
  routes/api.js         # /api routes (health, config, dispatch)
  ws/ui-ws.js           # UI WebSocket server (/ws)
  handlers/spine-commands.js  # Spine message handlers + OTM dispatch
src/                    # React SPA (Vite + React 18 + React Router 6)
test/                   # Unit tests (node --test)
```

## Two WebSocket Connections

1. **Axon -> Spine** (organ protocol): Managed by organ-boot spine-client. Auto-reconnect, heartbeat, mailbox registration.
2. **React -> Axon** (UI protocol): Custom `/ws` endpoint. Pushes Spine broadcasts to browser clients. 30s heartbeat, stale client termination.

## Spine Integration

**Subscriptions:** state_transition, verification_result, autoheal_ticket_update, spine_health, organ_health

**Inbound commands:** dashboard_refresh, notification

**Outbound OTMs (via dispatch routes):**
- POST /api/dispatch/vigil/run-tests -> Vigil
- POST /api/dispatch/glia/approve-fix -> Glia
- POST /api/dispatch/safevault/backup -> SafeVault
- POST /api/dispatch/gitsync/sync -> GitSync

## Conventions

- ES modules (import/export)
- Express 5 (path patterns: use `/{*path}` not `*` for catch-all)
- Node.js built-in test runner (`node --test`)
- Structured JSON logging to stdout
- No database connections (clean break)
- Zero cross-contamination: no ai-kb.db, no AI-Datastore, no monolith ports
