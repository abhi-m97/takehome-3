# Take-Home Spec — Learner Progress MVP

## Context

Docebo is an AI-powered learning platform used by thousands of organizations. A recurring theme in customer feedback: **learners lose track of where they left off** across multiple in-progress courses.

You're building a **thin MVP** to validate whether a dedicated "my progress" view improves learner re-engagement — before investing in a full platform feature.

This mirrors real Senior Product Engineer work: scope an MVP, ship a working slice, instrument for learning, and document tradeoffs.

**Reminder:** about **2 hours** of focused work, due in **24 hours**. A working thin slice beats a polished half-feature. Do not spend the extra hours adding scope.

## User story

> As a learner, I want to see my in-progress courses with completion status and last activity, so I can quickly pick up where I left off.

## Functional requirements

### Backend (required)

We provide a **TypeScript + Express starter** in [`backend/`](./backend/README.md) with seed data, routes, and tests. Your job:

1. Implement `getInProgressCourses()` in `src/services/progressService.ts` until `npm test` passes
2. Ensure validation and error handling meet the spec (some wiring is already in place)
3. Add **one extra business rule** (see below) and document it in `PRODUCT.md`

**A note on trust:** the starter sets a fictional `req.authenticatedLearnerId` (see `app.ts`, via an `x-authenticated-learner-id` header) that stands in for what real auth middleware would provide — the route does not check it against `:learnerId`, on purpose. We won't ask you to build that check, but be ready to talk through where it would go and what a mismatched request should do.

The API must support at least:

1. **List in-progress courses for a learner**  
   Returns courses the learner has started but not completed.

2. **Course progress fields** — each item must include:
   - Course identifier and title
   - **Completion percentage** (0–100)
   - **Last activity timestamp** (when the learner last interacted)
   - Status indicating the course is in progress (not completed, not not-started)

3. **At least one non-trivial business rule beyond the baseline** — the provided tests already require completion %, the 30-day stale flag, in-progress-only filtering, and learner-ID validation; those satisfy the *baseline*, not this item.

   Add **one** rule of your own. Document it in `PRODUCT.md` (what it does, why a learner or admin would care, how you tested it).

   **Do not use these** — they are used elsewhere in the loop or already required by tests:

   - 30-day stale / Inactive flag (already required)
   - Sort by last activity (already required)
   - Cap completion at 99% until every lesson is complete
   - Empty-lessons / divide-by-zero completion handling
   - A “Continue” / next-lesson action

   Examples of rules that **do** count:

   - Flag courses behind/ahead of an expected pace
   - Hide or demote courses below a completion threshold
   - Handle re-enrollment / retake merging
   - Estimate remaining time from lesson counts
   - A "mark reviewed" action, with a documented answer for what happens if it's triggered from two browser tabs at once
   - Your own rule — as long as it is not on the exclusion list

4. **Validation and error handling** — malformed requests and not-found cases should return appropriate HTTP status codes with readable error messages.

Persistence is your choice (the starter uses in-memory seed data). Document any changes in `PRODUCT.md`.

### Frontend (required)

Start from **one** primary starter:

- [`frontend-angular/`](./frontend-angular/README.md) — Docebo's production UI stack
- [`frontend-react/`](./frontend-react/README.md) — Toronto market default

Pick the one you will ship fastest. Same requirements, same scoring. Do not submit both.

1. Fetches and displays the learner's in-progress courses from your API
2. Shows **completion percentage** and **last activity** for each course
3. Handles **loading**, **error**, and **empty** states (no in-progress courses)
4. Is usable by an interviewer without reading your source code

Auth is optional. A hardcoded learner ID, dropdown, or stub login is acceptable — document your approach.

### Analytics (required — lightweight)

Instrument **at least one learning-related event** when a meaningful user action occurs. Examples:

- `course_progress_viewed` when the list loads
- `course_selected` when a learner clicks a course
- `progress_refreshed` when data is re-fetched

Format is flexible: console log with structured JSON, a stub analytics client, or a real tool. Document what you chose in `PRODUCT.md`.

### Documentation (required)

| File | Purpose |
|------|---------|
| `README.md` | Setup and run instructions (≤ 5 commands to a working demo) |
| `PRODUCT.md` | Problem, scope, cuts, success metric, **and** assumptions (see template) |
| `AI_USAGE.md` | How AI was used during development |

## Sample data

Seed data lives in `backend/src/data/seed.ts` — at least **3 in-progress courses** for learner `1`, plus edge cases (completed, not started, stale activity, second learner). You may extend it if it helps demo your extra business rule.

## Intentional ambiguity

The spec deliberately leaves these open. **Document your choices** in `PRODUCT.md`:

| Topic | Examples of reasonable choices |
|-------|-------------------------------|
| Persistence | In-memory, SQLite, file-based |
| Auth | Hardcoded user, query param, stub JWT |
| Completion % formula | Lessons completed / total; weighted by duration |
| Extra rule | See examples above |
| Time zones | UTC everywhere, local display only |
| API extras | Query filters, extra fields |

Senior candidates are scored on **reasonable, stated assumptions** — not perfect mind-reading.

## Nice-to-have (optional — do not sacrifice core requirements)

- Filter controls in the UI for *your* extra rule
- Feature-flag gating for an experimental column
- Tests for your extra business rule
- Simple CI that runs tests on push

## Evaluation criteria

We score holistically in the evaluation interview, not on a checklist of features.

| Signal | What "strong" looks like |
|--------|--------------------------|
| **Works end-to-end** | Interviewer can run your README steps and see real data in the UI |
| **Product scope** | Sharp MVP with explicit cuts; `PRODUCT.md` shows prioritization |
| **Craft** | Readable structure, sensible API design, loading/error/empty states |
| **Extra rule** | A real domain rule you can defend — not a rename of the baseline |
| **Ownership** | You can explain every file and adapt the code live without AI |
| **AI judgment** | `AI_USAGE.md` shows thoughtful use, not blind copy-paste |

## Out of scope

Do not build:

- Full LMS course authoring or admin panels
- Real authentication/SSO integration
- Multi-tenant isolation
- Mobile apps
- Production deployment infrastructure
- A second major flow (Continue, course player, catalog) unless your extra rule truly needs a tiny extra field or filter

A thin vertical slice that proves the learner-progress **list** is the goal.
