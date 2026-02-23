# My Team

A visual manager and orchestrator for local AI agent runtimes. Create Roles, assign Agent runtimes, send Tasks, and monitor execution — all from a desktop app.

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

This starts the Vite dev server for the renderer and launches Electron with mock Google auth enabled.

## Testing

```bash
npm test
```

Runs the core package tests (Vitest).

## Building

```bash
npm run build
```

Compiles the renderer (Vite) and main process (tsc).

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `MOCK_GOOGLE_AUTH` | Use mock auth (no real OAuth) | `true` in dev |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — |

## Project Structure

```
apps/desktop/          Electron app
  src/main/            Main process (Node.js/Electron)
  src/renderer/        React renderer (UI)
packages/core/         Shared logic: models, DB, adapters
docs/                  Documentation
```

## Key Concepts

- **Role** — An agent persona with instructions and context
- **Task** — A job sent to a role's agent runtime
- **Agent Runtime** — A configured AI agent (e.g., dummy, claude-code)
- **Adapter** — Interface for communicating with agent runtimes

See [docs/AGENT_ADAPTER_GUIDE.md](docs/AGENT_ADAPTER_GUIDE.md) to add new adapters.
See [docs/SECURITY.md](docs/SECURITY.md) for security details.
