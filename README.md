# Learner Progress MVP

A thin "my progress" view for learners: their in-progress courses, how far along they are, when they last
touched each one, and how long each has left. TypeScript/Express backend, **React** frontend.

- **Frontend used:** React (`frontend-react/`). The Angular starter (`frontend-angular/`) is left untouched and is not part of this submission's behaviour.
- **Product thinking:** [`PRODUCT.md`](./PRODUCT.md) (problem, scope, the extra business rule, cuts, assumptions, what's next).
- **How AI was used:** [`AI_USAGE.md`](./AI_USAGE.md).
- **Original brief:** [`SPEC.md`](./SPEC.md).

## Run it locally

Requires **Node.js 20+** and npm. Ports **3001** (API) and **5173** (UI) must be free.

Terminal 1, the API:

```bash
cd backend && npm install && npm run dev
```

Terminal 2, the UI:

```bash
cd frontend-react && npm install && npm run dev
```

Open **http://localhost:5173**.

Run the backend tests (68 tests) from `backend/`:

```bash
npm test
```

> The demo data's timestamps are generated when the API starts, so restart `npm run dev` in `backend/` before a demo
> to get a fresh mix of recent and stale courses.

## What to look at

The **Scenario** dropdown (top right) stands in for a login and switches learner:

| Scenario | What it shows |
|----------|---------------|
| Learner 1 | Three in-progress courses, newest activity first. *Annual Compliance Refresh* has an **Inactive** badge (no activity for more than 30 days). |
| Learner 2 | A single in-progress course. |
| Learner 3 (completed only) | The **empty state**: no courses in progress, and no time filter offered. |
| Unknown learner (404) | The **error state** for a learner that doesn't exist. |
| Invalid ID (400) | The **error state** for a malformed learner ID. |

Each card shows a progress bar and percentage, lessons done ("2 of 4 lessons"), an estimated time left
("about 30 min left"), and when the learner was last active.

**Extra business rule: estimated time remaining.** The **Time available** slider (15, 30, 60 min, Any) keeps only
courses that can be finished in that time. Try learner 1 at *15 min*: only the stale compliance course (5 minutes
left) remains. Try learner 2 at *15 min* to see the "No courses fit" state and the **Show any length** button. The
slider resets when you change learner.

**Loading state.** The API answers in milliseconds locally, so the skeleton is easy to miss. In Chrome DevTools open
*Network*, pick **Slow 4G**, then switch scenario or move the slider.

**Experimental flag.** The **Experimental: next lesson preview** checkbox (top right, off by default) shows the next
lesson and its length on each card. It is a demo-only stand-in for a feature flag.

**Analytics.** Each successful load logs one structured JSON line (`course_progress_viewed`, with learner ID, course
count, stale count and the active time filter) to the browser console.

## API

`GET /api/learners/:learnerId/progress[?maxMinutes=N]`

```json
{
  "learnerId": 1,
  "courses": [
    {
      "courseId": "course-leadership",
      "title": "Leadership Essentials",
      "completionPercentage": 33,
      "lastActivityAt": "2026-10-02T18:47:43.087Z",
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

- Only `in_progress` courses are returned, sorted by last activity (most recent first).
- `maxMinutes` (optional, positive integer) keeps courses whose `estimatedMinutesRemaining` is at most N.
- Errors: `400` for an invalid learner ID or `maxMinutes`, `404` for an unknown learner. Bodies look like `{ "error": "..." }`.

Full details are in [`backend/README.md`](./backend/README.md).

## Layout

```
backend/           Express + TypeScript API, seed data, Jest tests
frontend-react/    Vite + React + TypeScript UI (the frontend used)
frontend-angular/  Provided Angular starter, untouched
PRODUCT.md         Product notes and decisions
AI_USAGE.md        How AI was used
SPEC.md            Original brief
```

## Known limitations

- Data is in memory (a seed file); there are no writes.
- Learner identity is a demo dropdown. The API does not check that the caller may view the requested learner (see `PRODUCT.md` for where that check would go).
- Time estimates are approximate: lessons without a duration count as 10 minutes.
- Analytics is a console stub behind a single `transport` function.
- `npm audit` reports findings in the Jest test tooling (dev-only). Runtime dependencies are clean (`npm audit --omit=dev`).
