# Backend — TypeScript starter

Express + TypeScript API scaffold for the Learner Progress take-home. **Implement the business logic** in `src/services/progressService.ts` until tests pass, then extend **one** sibling starter: [`frontend-angular/`](../frontend-angular/README.md) or [`frontend-react/`](../frontend-react/README.md).

## Quick start

```bash
cd backend
npm install
npm test          # several tests fail until you implement progressService
npm run dev       # http://localhost:3001
```

## API

### `GET /health`

Returns `{ "status": "ok" }`.

### `GET /api/learners/:learnerId/progress`

Returns in-progress courses for a learner.

**Success (200):**

```json
{
  "learnerId": 1,
  "courses": [
    {
      "courseId": "course-leadership",
      "title": "Leadership Essentials",
      "completionPercentage": 33,
      "lastActivityAt": "2026-08-22T09:15:00.000Z",
      "status": "in_progress",
      "isStale": false
    }
  ]
}
```

**Errors:**

| Status | When |
|--------|------|
| 400 | Invalid learner ID (non-integer or ≤ 0) |
| 404 | Unknown learner (not in seed data) |

## Your task

Edit **`src/services/progressService.ts`** — the starter intentionally returns incomplete results (includes completed/not-started courses, missing stale flags, wrong sort).

Tests in `tests/progress.api.test.ts` define the contract. Run `npm test` until green.

You may also:

- Extend routes (filters, query params)
- Add persistence beyond the in-memory seed
- Improve error shapes or add logging

Document non-obvious choices in your repo-root `PRODUCT.md`.

## Seed data

`src/data/seed.ts` includes:

- **Learner 1** — 3 in-progress, 1 completed, 1 not started (API should return 3)
- **Learner 2** — 1 in-progress, 1 completed (API should return 1)
- **Learner 999** — does not exist (404)

## CORS

Enabled for all origins so any local frontend dev server can call the API during development.

## Suggested repo layout

```
your-submission/
├── backend/          ← this starter (TypeScript)
├── frontend-angular/ ← Angular starter (primary)
├── frontend-react/   ← React starter (primary)
├── README.md         ← how to run both
├── PRODUCT.md
└── AI_USAGE.md
```

## Frontend integration hint

The Angular and React starters proxy `/api` to `http://localhost:3001`. Fetch:

```
GET /api/learners/1/progress
```

Learner 1 is a good default for demos; learner 2 shows a single-course case; learner 999 triggers an error state in your UI.
