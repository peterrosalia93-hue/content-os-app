# Content OS App

A lightweight local MVP dashboard for Osho's Content OS.

## Features
- Pipeline stage view for `inbox`, `research`, `ideas`, `drafts`, `approvals`, and `published`
- Create and edit local content items
- Approval status tracking
- Weekly planner / calendar panel
- Daily content pack generator and viewer
- Local-only persistence with browser `localStorage`

## Run locally
```bash
cd content-os-app
npm run dev
```

Then open:
- `http://localhost:4173`

## Build
```bash
cd content-os-app
npm run build
```

The build output is written to `dist/`.

## Notes
- This MVP is intentionally local-first and does **not** include social posting integrations.
- If you want to reset stored data, clear browser localStorage for the app.
