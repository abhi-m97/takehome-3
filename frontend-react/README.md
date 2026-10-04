# Frontend — React starter (primary)

Vite + React + TypeScript. Already calls `GET /api/learners/:id/progress` through the Vite proxy.

This is one of **two primary starters**. Pick **React** (this folder) or **Angular** (`../frontend-angular/`) — whichever you ship fastest. We score loading/error/empty states and product craft, not which of those two you picked.

Your job is **not** a new app from scratch. Extend this page: loading, error, and empty states, plus whatever you need to demo your extra business rule and analytics event.

**Requires Node.js 20+.**

## Quick start

Run the backend first (`cd ../backend && npm run dev`), then from this folder:

```bash
npm install
npm run dev
```

Open the URL Vite prints (http://localhost:5173).

## What you will notice

The starter is intentionally thin:

- Happy path only — no loading, error, or empty treatment worth shipping
- No analytics
- It will show whatever the API returns, including incomplete backend data until tests pass

## Proxy

`vite.config.ts` forwards `/api` and `/health` to `http://localhost:3001`. Keep using relative `/api/...` URLs so the interviewer can run both processes locally.
