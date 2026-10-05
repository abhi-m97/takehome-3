# AI Usage

## Tools used

- **Claude (Claude Code, desktop app):** research, planning and design discussion, read-only code review, drafting the notes in `PRODUCT.md` and this file.
- **Cursor:** implementation of code changes. Single sessions per feature and test suite, with just the information for the task at hand. Ask and Plan mode were used to finalize requirements and expected behavior, and then Build mode was used to make all the code changes.

## What AI helped with

| Area | How AI was used | Your involvement |
|------|-----------------|------------------|
| Understanding the starter | Claude read the repo and summarised the structure, data flow, and what the stub left broken. Essentially gave me the gaps between the current state and the required state. | I read all the md files myself, the progressService code, and the tests, and then ran the app and the tests for the first time prior to starting to use Claude. (4 failing / 4 passing before the fix) |
| Backend baseline (`progressService.ts`) | I gave it the requirements for the sorting, filtering, and mapping. | I added a couple of lines for the filtering and sorting, and just asked the AI to confirm my logic was sound. |
| Frontend states and card (loading skeleton, empty, error, progress bar, date formatting) | Cursor implemented them from prompts drafted with Claude; Claude reviewed the result and suggested copy, timing and consistency changes | The initial copy was pointing towards a more "active" type of page, i.e. the type of page where you'd expect a "Continue" button or some CTA. I asked Claude to give me some more passive options. I also made minor adjustments to the date formatting, and the initial UI implementation for the progress bars used a wide variety of colors based off status, so I made it just choose one. The first version of the "Last active" label counted calendar days, while the backend's stale rule uses 720 elapsed hours (24 × 30), so a label and the Inactive badge could disagree near the boundary. I had the label changed to elapsed 24-hour periods. The frontend Cursor chat had no context of the backend at that point. |
| Extra rule: estimated time remaining and (feature flagged) next lesson details (design, tests, backend) | Claude compared candidate rules against the spec and the data model, proposed the fields, rules and edge-case list, and drafted the Cursor prompts. Cursor wrote the tests first (run red), then the service, route and seed changes. | I chose the rule and named the lesson field `estimatedDurationMinutes` as well as the NextLesson data model. I asked Cursor about extra API-level tests for the no-lessons and fully-complete cases (`null` vs `0`, which a bare `<= maxMinutes` check would get wrong). The UI for the estimate and time filter was built by Cursor; Claude reviewed it and checked the scenarios in the running app. I ran the red and green test runs and reviewed the diff. |
| Dependency audit | Claude explained the npm audit output and which findings were runtime vs. dev-only | On my initial npm install for the backend, I noticed many vulnerabilities (31 high, 3 moderate). I ran `npm audit --omit=dev` and confirmed with Claude the remaining few vulnerabilities were worth addressing with `npm audit fix` and checked tests still behaved the same |
| Design decisions | Claude laid out tradeoffs (status as source of truth, stale boundary, handling disagreement) | I made each call and the reasoning is recorded in `PRODUCT.md` |

## What you rejected or rewrote

- **Deriving status from lessons instead of using the stored status.** Considered; rejected as extra scope that reopens edge cases the spec rules out, and less faithful to a stored enrollment status.
- **Hiding courses at 100% via a client-side filter, or a backend `status OR 100%` filter.** Raised and discussed with AI; rejected. A course can legitimately be in progress at 100% while awaiting sign-off, and a second source of truth would contradict the status rule.
- **`npm audit fix --force`.** Rejected: it forces a breaking Jest major upgrade for dev-only findings.
- **Empty-state UI alongside the dropdown.** Cursor proposed adding the empty state in the same change as the learner dropdown; I deferred it to keep that change to the seed plus dropdown. (It is still a required state and is built separately.)
- **Time filter persisting across learners, and a dropdown for it.** Both were first versions I accepted from the design discussion; I later changed them (filter hidden when a learner has no in-progress courses, reset on learner change, and a discrete slider instead of a dropdown) after seeing the empty-state copy was misleading for a learner with nothing in progress.
- **Rounding the estimate total up (`Math.ceil`) with fractional durations.** That was the rule in the first version of the tests and prompt. Reviewing the numbers showed floating-point sums can land just above an integer (1.8 + 1.1 + 0.1 = 3.0000000000000004, so `ceil` gives 4 instead of 3). I switched to whole-minute durations with no rounding, and removed the fractional tests.
- **Due dates, enrollment dates and pace/urgency ordering as part of this rule.** Considered and deferred: that would be a second rule, with fields the model does not have.
- **Minor-UI Details.** The initial card design had some minor changes I made to the formatted date and chosen loading bar colors.

## Where I went against AI advice

- **Next-lesson preview.** Claude advised against building it: the brief excludes a Continue / next-lesson idea, it needs a lesson-ordering assumption, and the time was better spent on required items. I decided to build it anyway, behind a default-off feature flag, because the spec lists feature-flag gating of an experimental column as a nice-to-have. I accepted the scope risk; it is not the assessed business rule, and the choice and its assumptions are documented in `PRODUCT.md`.
- **Segmented control vs slider for the time filter.** Claude recommended a segmented (pill) control as simpler to explain and cheaper on requests. I chose a slider with discrete stops (15, 30, 60, Any) for the interaction I preferred.

## What you'd do differently without AI

In the timeframe given for this assignment, I would reduce the scope of what I approached for this activity. I would have a few unit tests for a few key scenarios, to get the initial filtering and ordering as expected. I would have added the time estimate field per course to each card, and added some simple error code handling and loading.

I think AI, for the most part, sped up my ability to deliver in a short amount of time the changes made, so I could increase the scope to include the next lesson preview and significant test coverage.

## Ownership statement

I could make changes in the progress service, the backend, and simpler UI changes in the React code. I can also understand and write more tests manually. In terms of the next lesson feature, I designed the data model, and AI helped me come up with most of the tests and the implementation.
