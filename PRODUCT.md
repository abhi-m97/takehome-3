# Product Notes

> Status: in progress. Sections marked TBD are filled in as the work lands.

## User problem

Learners enrolled in several courses at once lose track of where they left off. They have to open each course to remember how far along they are and which one they touched last. This MVP tests whether a dedicated "my progress" view, showing in-progress courses with completion and last activity, helps learners pick up where they left off.

## MVP scope

Shipped so far:

- `GET /api/learners/:learnerId/progress` returns only `in_progress` enrollments for a learner, each with completion percentage, last activity timestamp, status, and an `isStale` flag. Results are sorted by last activity, most recent first.
- Validation: non-integer or non-positive learner IDs return 400; unknown learners return 404; both with readable messages.
- Baseline covered by the supplied test suite.
- Extra business rule (backend): each course also reports `lessonsCompleted`, `lessonsTotal` and `estimatedMinutesRemaining`, and the endpoint accepts an optional `?maxMinutes=N` filter (see "Extra business rule"). Covered by dedicated unit and API tests written before the implementation.

- Frontend (React): fetches and lists the learner's in-progress courses, with an error state that shows the HTTP status and the server's message. A demo learner dropdown switches scenarios. In-flight requests are cancelled when the selection changes, so a slow earlier response cannot overwrite a newer one.

- Loading state (skeleton), empty state, and error state, plus a card per course with a progress bar and percentage, an "Inactive" badge for stale courses, and a readable "last active" label ("3 days ago (Oct 1)") with the exact timestamp on hover.

- Analytics: one event, `course_progress_viewed`, fired when a progress list loads successfully (see assumptions).

- Time estimate in the UI: each card shows "N of M lessons · about X min left" under the progress bar ("All lessons done" when finished, no time shown without an estimate). A "Time available" slider with four discrete stops (15, 30, 60 min, Any) sends `?maxMinutes=`. It only appears once the learner is known to have in-progress courses, and resets to Any when the learner changes. When a filter hides every course the empty state says so and offers "Show any length". The analytics event also records the active filter (`maxMinutes`, or null).
- Experimental next-lesson preview (behind a flag): the API returns `nextLesson` (title and estimated minutes of the first incomplete lesson, or `null`) on every course, and the UI can show it under a default-off, demo-only "Experimental: next lesson preview" checkbox. It is not the assessed business rule. See assumptions and "What I intentionally cut".

## Extra business rule

**Estimated time remaining, with a "fits in N minutes" filter.**

What it does:

- Every in-progress course reports `estimatedMinutesRemaining`: the sum of the durations of its *incomplete* lessons. Lessons carry an optional `estimatedDurationMinutes` (whole minutes). A lesson with a missing or invalid duration counts as a default of 10 minutes.
- A course with every lesson complete has an estimate of `0`. A course with no lessons has `null` (no estimate), not 0.
- `GET /api/learners/:learnerId/progress?maxMinutes=N` keeps only courses whose estimate is `<= N` (inclusive). Courses with a `null` estimate are excluded when the filter is present. Order and `isStale` flags are unchanged; with no parameter the response is exactly as before.
- `maxMinutes` must be a positive integer; anything else (including empty or repeated) is a 400. Checks run in order: learner ID (400), `maxMinutes` (400), unknown learner (404).

Why a learner or admin would care:

- The user story is "pick up where I left off". Learners rarely have unlimited time, so "which of my courses can I finish in the 20 minutes I have?" is the natural next question after "where did I leave off?". A stale course with 5 minutes left (the seed's Annual Compliance Refresh) is a quick win the filter surfaces.
- Admins and compliance owners can see how much effort is outstanding on in-progress courses, which is a better nudge ("5 minutes left") than a bare percentage.

How it was tested:

- Test-first. The tests were written, and run red, before the implementation. `tests/estimateMinutesRemaining.test.ts` covers the pure function (incomplete-only summing, completed lessons ignored, missing and invalid durations, 0 for finished, `null` for no lessons). `tests/progress.timeRemaining.api.test.ts` covers the API: derived fields, inclusive filter boundaries (5, 25 and 30 minutes against the seed), empty result (200, not 404), every invalid `maxMinutes` form, unchanged default order and `isStale`, validation order, and two edge-case courses injected temporarily (no lessons, all lessons complete) because the seed cannot express them.
- The original supplied tests are unchanged and still pass.

## What I intentionally cut

| Cut | Why |
|-----|-----|
| Authorization check on `:learnerId` | Spec says the starter deliberately does not enforce it. A real check goes in the route (or middleware) and compares `req.authenticatedLearnerId` with the route param, returning 403 via the existing `ForbiddenError` on mismatch. |
| Persistence | Read-only slice over in-memory seed data; validating the list view comes first. |
| Deriving status from lessons | See assumptions: status comes from the enrollment record. |
| Per-course or per-customer stale thresholds | One global 30-day threshold is enough for the MVP. |
| Angular frontend | Spec says to ship one frontend. The Angular starter is left untouched. |
| Frontend unit tests | The supplied suite is backend-only; the pure formatting and hook logic is small and was checked by hand (normal speed, Slow 4G, 3G, fast learner switching). |
| Continue action / lesson page behind the next-lesson preview | The brief excludes a Continue / next-lesson action. Only a read-only preview exists, behind a default-off flag; there is no lesson page to link to, so it is not clickable. |
| Due dates, enrollment dates, pace and urgency ordering | A second rule in its own right; no source for these fields in the current model. |
| Sorting by time remaining | Default order (last activity) stays as the tests require; the `maxMinutes` filter already answers the "how long do I have" question. |
| Time-weighted completion percentage | Percentage stays lesson-count based; the time estimate is reported separately. |
| Upgrading Jest to fix dev-tooling audit findings | Breaking major upgrade, test tooling only. See assumptions. |

TBD: UI-level cuts.

## Success metric

TBD.

## Assumptions

- **Frontend choice:** React. Scoring is framework-neutral and it is the faster path for me. `frontend-angular/` is left as provided and is not part of the submission's behaviour.
- **Status is the source of truth.** Status is read from the enrollment record as the source of truth (stand-in for a DB column maintained by learner actions or background jobs). Completion percentage is derived from lessons for display only. If the two ever disagree, for example `in_progress` at 100%, the course is still shown, because it may legitimately await an exam or sign-off. In production I'd keep them consistent where status is written, and alert on inconsistencies instead of silently filtering.
- **Stale rule.** "Stale" means no activity for more than 30 days, measured as elapsed time (30 × 24 h), not calendar days, and with a strict `>` comparison. The same threshold applies to every course. A real system would likely make it per-course or per-customer. `isStale` is always returned as an explicit boolean.
- **Clock handling.** The service takes an injectable `now` (default: current time), evaluated once per request, so tests can fix the clock.
- **Seed data.** Timestamps are generated relative to server start, so the demo mix of fresh and stale courses stays valid. Restart the backend before demoing.
- **Sort ties.** Courses with identical last activity keep seed order (stable sort). TBD whether to add an explicit tie-break.
- **Input trust.** Seed timestamps are trusted; malformed dates are not validated.
- **Dependencies.** `npm audit` flagged 34 issues after install. Running `npm audit --omit=dev` narrowed the runtime exposure to 3 moderate `qs` findings in Express's dependency chain, fixed with a non-breaking `npm audit fix`. The remaining 29 are all in the Jest test-tooling chain (`braces` via `micromatch`), fixable only by a breaking Jest 30 upgrade, so they are deferred. Would add `npm audit --omit=dev` to CI and revisit the Jest upgrade separately.
- **Auth / learner identity (frontend):** the learner is chosen from a hardcoded demo dropdown that stands in for a login. It also offers deliberate error scenarios (unknown learner → 404, invalid ID → 400) so the error state can be demoed with real backend responses. Anyone can view any learner's progress; this is the same gap as the unenforced `x-authenticated-learner-id` check noted above.
- **Loading UI timing.** The skeleton appears only after 150 ms of loading and, once shown, stays for at least 400 ms, to avoid both a flash-in and a flash-out. The API answers in milliseconds locally, so the loading state is demoed with Chrome DevTools → Network → Slow 4G (verified this way).
- **"Last active" display.** Shown as whole elapsed 24-hour periods, the same basis as the backend's stale rule, not calendar days, so the label and the Inactive badge agree. A timestamp from the previous evening can read "today". The UI uses the browser's clock and the backend uses the server's.
- **Empty-state copy** is deliberately neutral ("No courses in progress"). Nothing in progress does not mean nothing to do (the learner may have not-started courses), so it makes no "all caught up" claim.
- **Progress bar** uses one accent colour for every course; the Inactive badge, not colour, marks stale courses.
- **Seed extension:** added learner 3 with only a completed course, so the empty state can be demonstrated with real data. Learners 1 and 2 are unchanged so the supplied tests still hold.
- **Analytics format:** one event, `course_progress_viewed`, fired from the client whenever a progress list loads successfully (including an empty one), with `learnerId`, `courseCount` and `staleCount`. It is written as one line of structured JSON to the console by a small typed stub in `frontend-react/src/lib/analytics.ts`; connecting a real tool means replacing one `transport` function. No personal data is sent (numeric IDs and counts only). It is client-side because "viewed" is a UI fact the backend cannot observe. Errors and cancelled requests do not emit. The event fires when data arrives, up to 400 ms before the loading skeleton finishes hiding.
- **Persistence:** in-memory seed data, no writes (so far).
- **Lesson durations are whole minutes, with a 10-minute default.** Anything that is not a positive integer (missing, 0, negative, NaN, Infinity, fractional) counts as the default. There is deliberately no rounding: summing fractional minutes in floating point can push an exact total just over an integer (1.8 + 1.1 + 0.1 gives 3.0000000000000004), so an earlier "round the total up" rule would have over-promised by a minute. Whole minutes remove the problem.
- **The estimate is approximate.** It can include default-duration lessons and the API does not flag which, so the UI says "about N min". A course at 100% with status `in_progress` shows 0; a course with no lessons has no estimate.
- **Percentage and time can diverge.** Completion percentage counts lessons; the estimate counts minutes. Onboarding is 50% done by lessons but 30 of its 45 minutes remain. Both are shown; neither is derived from the other.
- **`maxMinutes` semantics.** Inclusive (`<=`, "fits in N minutes"). Parsed with a strict digits-only pattern, because `Number()` would accept `''` (0), `' 5 '` and `'1e2'`. The filter uses an explicit null check, because `null <= n` is true in JavaScript.
- **Filter visibility and reset.** The UI learns whether a learner has any in-progress courses from an unfiltered load, and only then shows the time slider, so a learner with nothing in progress is never offered a filter (and never sees "No courses fit in N min"). The filter resets to Any when the learner changes, because in a real product a different learner is a different session; the demo dropdown only stands in for that. This replaced an earlier choice to keep the filter across learners.
- **Server-side filter, on purpose.** The `maxMinutes` filter lives in the API so the rule (inclusive, null estimates excluded, validated) has one home and works for any consumer. For lists this small, filtering in the browser would be simpler and instant, and would remove the "has courses" bookkeeping; I would revisit that if the web UI were the only consumer.
- **Next lesson.** `nextLesson` is the first incomplete lesson in array order (lessons are assumed sequential; a lesson completed out of order does not change which one is next), with minutes from the same rule as the estimate (missing or invalid durations count as 10). It is always returned and unaffected by `maxMinutes`; `null` when every lesson is complete or there are none. The UI preview is a default-off demo checkbox standing in for a feature-flag service. It is experimental and not the assessed rule.
- **Seed durations** are set on the in-progress courses of learners 1 and 2 only (estimates 30, 25, 5 and 20 minutes), with one lesson left without a duration to exercise the default. No statuses, dates or completion flags changed.

## What I'd build next

- Make the experimental next-lesson preview real: a Continue action and lesson page, plus decisions on lesson ordering and prerequisites (today "next" is simply the first incomplete lesson in array order). It directly serves "pick up where I left off" but the brief excludes it for this exercise. Once "next" is well defined, offer the time filter on next-lesson length too ("what can I make progress on in 20 minutes?"), alongside today's total-remaining filter ("what can I finish?").
- Pace and urgency: add enrollment and due dates, flag courses that are behind or due soon, and order by urgency. Per-lesson completion times would allow measuring how fast a learner is progressing.
- Real analytics: connect the stub to a real tool and add a "resumed course" event, so the success metric (resume rate after viewing progress) can actually be measured.
- Enforce the learner/auth check on the route (403 on mismatch) and move learner identity out of the demo dropdown.
- CI that runs the backend tests and `npm audit --omit=dev`, plus the deferred Jest upgrade.
