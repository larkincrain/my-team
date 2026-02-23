# Security

## Context Isolation

My Team uses Electron's `contextIsolation: true` and `nodeIntegration: false`. The renderer process (React app) has no direct access to Node.js APIs or the Electron internals.

## IPC Security

All communication between renderer and main process goes through a typed preload bridge (`src/main/preload.ts`). The `contextBridge.exposeInMainWorld` API exposes only the specific functions needed.

IPC handlers in `src/main/ipc/` validate inputs before passing to the database layer. Never trust renderer input.

## Token Storage

User tokens are stored using `keytar`, which uses the OS native credential store (macOS Keychain, Windows Credential Manager, Linux Secret Service). This avoids storing credentials in plaintext on disk.

If `keytar` is unavailable (e.g., certain Linux environments), tokens fall back to in-memory storage and are lost on app restart.

## Filesystem Access

The main process only reads/writes to:
- The app's userData directory (database: `myteam.db`)
- No arbitrary file system access from renderer

## Sandboxing

The renderer is sandboxed via Electron's default security policies. No `eval()` or dynamic code execution is permitted.

## Content Security Policy

For production builds, a strict CSP should be added to the renderer's HTML:
```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'">
```
