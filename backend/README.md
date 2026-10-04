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

Returns in-progress courses for a learner, most recent activity first.

**Query parameters:**

| Param | Description |
|-------|-------------|
| `maxMinutes` | Optional. Positive integer (digits only, no sign, spaces or exponent). Keeps only courses whose `estimatedMinutesRemaining` is `<= maxMinutes` (inclusive). Courses with a `null` estimate are excluded. Anything else, including an empty or repeated param, returns 400. |

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
      "lessonsCompleted": 1,
      "lessonsTotal": 3,
      "estimatedMinutesRemaining": 25,
      "nextLesson": { "title": "Coaching conversations", "estimatedMinutes": 15 },
      "isStale": false
    }
  ]
}
```

New fields on each course:

- `lessonsCompleted` — number of completed lessons.
- `lessonsTotal` — number of lessons in the course.
- `estimatedMinutesRemaining` — whole minutes left, or `null` when the course has no lessons (no estimate, not 0). It sums only incomplete lessons; a lesson's `estimatedDurationMinutes` counts if it is a positive integer, otherwise it counts as the default of 10 minutes. A course with every lesson complete is `0`. There is no rounding.
- `nextLesson` — `{ "title": string, "estimatedMinutes": number }` for the first incomplete lesson in array order (lessons are assumed sequential, so array position is course order; a later completed lesson does not change the answer), or `null` when there is no incomplete lesson (every lesson complete, or no lessons). `estimatedMinutes` uses the same duration rule as `estimatedMinutesRemaining` (positive integer, otherwise the default of 10). It is always present and is not affected by `maxMinutes`, which only decides which courses are listed.

**Errors:**

| Status | When |
|--------|------|
| 400 | Invalid learner ID (non-integer or ≤ 0) |
| 400 | Invalid `maxMinutes` (not a positive integer) |
| 404 | Unknown learner (not in seed data) |

The learner ID is validated first, then `maxMinutes`, then the learner lookup, so `/api/learners/999/progress?maxMinutes=abc` is a 400, not a 404.

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
- **Learner 3** — 1 completed course only (known learner, API returns an empty list)
- **Learner 999** — does not exist (404)

Lesson durations (`estimatedDurationMinutes`, whole minutes) are set on the in-progress courses only:

| Course | Lesson durations (✓ = completed) | Estimate |
|--------|----------------------------------|----------|
| `course-onboarding` (learner 1) | ✓5, ✓10, 20, 10 | 30 |
| `course-leadership` (learner 1) | ✓20, 15, none (default 10) | 25 |
| `course-compliance` (learner 1) | ✓10, 5 | 5 |
| `course-safety` (learner 2) | ✓10, 20 | 20 |

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
