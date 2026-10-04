# Take-Home Assessment: Learner Progress MVP

**Expected effort:** about **2 hours** of focused work  
**Window:** **24 hours** from when you receive this prompt — that is a deadline, not an invitation to over-build  
**AI policy:** **On** — Cursor, Claude, Copilot, and similar tools are encouraged  
**Stack:** TypeScript backend + **pick one primary frontend: Angular or React**

## Prerequisites

- **Node.js 20+** and **npm** (`node -v` — Node 18 will not run the Angular starter)
- **Git** if you submit a repository (preferred)
- **Ports 3001** (API) and **5173** (UI) free
- About **2 hours** of focused time before the deadline

You do not need Docker, a cloud account, or access to Docebo.

## What we're evaluating

We care about **product judgment**, **full-stack craft**, and **how you use AI as a multiplier**. Angular and React are both first-class. We do not score which of those two you used.

You'll walk us through your submission in a live evaluation session with AI off. Build something you can **explain, demo, and adapt on the spot**.

A working thin slice beats a polished half-feature.

## Getting started

1. Read [`SPEC.md`](./SPEC.md).
2. Backend:
   ```bash
   cd backend && npm install && npm test && npm run dev
   ```
   Implement `src/services/progressService.ts` until tests pass.
3. **Pick one frontend** (already talks to the API):

   **Angular** (Docebo production stack):
   ```bash
   cd frontend-angular && npm install && npm run dev
   ```

   **React** (Toronto market default):
   ```bash
   cd frontend-react && npm install && npm run dev
   ```

   Open http://localhost:5173. Extend that starter — do not scaffold a third app.
4. Copy [`PRODUCT.template.md`](./PRODUCT.template.md) → `PRODUCT.md` and [`AI_USAGE.template.md`](./AI_USAGE.template.md) → `AI_USAGE.md` in the repo root and fill them in as you work.
5. Submit before your deadline.

## Required deliverables

| Deliverable | Purpose |
|-------------|---------|
| **Backend** | Starter in [`backend/`](./backend/README.md) — service logic, validation, **one extra business rule** beyond the tests |
| **Frontend** | **One** of [`frontend-angular/`](./frontend-angular/README.md) or [`frontend-react/`](./frontend-react/README.md) — loading, error, and empty states; demoable without reading source |
| **README** | How to run locally in under 5 commands |
| **PRODUCT.md** | User problem, MVP scope, cuts, success metric, assumptions |
| **AI_USAGE.md** | How you used AI; what you accepted, rejected, or changed |

## What we are *not* asking for

- Docker, Kubernetes, or cloud deployment
- CI/CD pipelines (bonus if present, not required)
- Both frontends, or a new app from scratch
- Pixel-perfect UI
- Production-grade auth (a stub is fine — document it in `PRODUCT.md`)

## AI usage

Use AI freely during the take-home. We **will** ask about it in the evaluation:

- What did AI generate vs. what you wrote or rewrite?
- What did you reject and why?
- Can you explain and modify every part of your submission without AI?

Copy-paste submissions you can't explain are a red flag.

## Submission

Send **one** of the following before your deadline:

1. **Git repository link** (GitHub, GitLab, etc.) — preferred  
2. **Zip archive** of your project (exclude `node_modules`, vendor dirs, and build artifacts)

Include in your submission email:

- Link or attachment
- Frontend starter used (**Angular** or **React**)
- Approximate time spent
- Any known limitations or things you'd do with more time

## After submission

We'll schedule a **45 minute evaluation interview** where you:

- Demo your MVP and explain your architecture
- Discuss product scope and tradeoffs
- Make a small live change to your code (AI off)

## Questions?

If something in the spec is genuinely blocking, email your recruiter with:

- What you're stuck on
- What you've already assumed
- A proposed resolution

We won't answer implementation trivia, but we will clarify product intent if the spec is ambiguous in a way that blocks progress.
