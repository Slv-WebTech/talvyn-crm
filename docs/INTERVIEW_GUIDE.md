# Interview Guide

Grounded entirely in what was actually built and verified for the Core MVP (2026-08-14) — see `IMPLEMENTED_FEATURES.md` for the source of truth this is drawn from. No claimed features, metrics, or experience beyond what exists in the code and this project's own docs.

## 1. Elevator Pitch
> I built a role-based CRM for small sales teams — leads, customers, a visual sales pipeline, follow-ups, tasks, and a dashboard, all scoped by role so a Sales Executive only sees their own book of business while Admins and Managers see everything. It's React/Vite on the front end, Express and PostgreSQL (via Prisma) on the back end. The most interesting engineering problem was modeling how a Lead actually becomes revenue — I built that as an atomic, idempotent database transaction rather than a simple status flag. Along the way I also debugged a real Express 5 breaking change that silently broke every list endpoint in the API, which was a good lesson in why manual end-to-end testing catches things static checks and builds can't.

## 2. 60-Second Explanation
> The problem: sales teams need a shared system of record for leads and customers instead of spreadsheets, with the right people seeing the right data. I built a CRM with three roles — Admin, Sales Manager, Sales Executive — where row-level ownership scoping means an Executive's queries are transparently filtered to their own records at the database layer, not just hidden in the UI.
>
> The core workflow is: capture a Lead, and when it's qualified, convert it — that's a single transaction that finds-or-creates a Customer, creates an Opportunity in the sales pipeline, and marks the Lead converted, all atomically. The pipeline itself is a drag-and-drop kanban board across seven stages, built with `@dnd-kit`. Follow-ups and tasks attach to any of those three record types, and a dashboard aggregates it all — revenue trend, pipeline funnel, sales performance by rep — scoped the same way as everything else.
>
> The hardest part wasn't a feature — it was a library version mismatch. Express 5 changed `req.query` to a read-only property, and my validation middleware's plain assignment threw on every single list endpoint. Nothing caught it until I actually ran the app end-to-end; a one-line fix, but it's a good example of why you test the real thing, not just that it compiles.

## 3. Technical Challenges

### Challenge: Modeling the Lead → Customer/Opportunity relationship
**Problem**: A Lead and a "won deal" are conceptually different things with different lifecycles, but the source spec's UI flow treats "convert" as a single, real user action.
**Why it was difficult**: Get the model wrong and either every downstream feature (pipeline, dashboard, reporting) inherits the wrong shape, or the convert action becomes a scattered set of writes with no guarantee of consistency.
**Approaches considered**: (a) one growing status enum on a single "Lead" record covering its whole lifecycle including post-conversion stages; (b) two separate entities (Lead, Opportunity) bridged by an explicit convert action.
**Chosen solution**: (b) — Lead and Opportunity are separate Prisma models. `POST /leads/:id/convert` is a `prisma.$transaction` that finds-or-creates a Customer (deduped by email), creates an Opportunity pre-filled from the Lead, and marks the Lead `CONVERTED` — never deleted, so it stays as an audit trail. Idempotent: converting twice returns `409` with the existing linkage instead of creating duplicates.
**Result**: Verified end-to-end — convert creates exactly the right records, converting again is a safe no-op, and the pipeline/dashboard both naturally reflect the resulting Opportunity without any special-casing.

### Challenge: The Express 5 `req.query` breaking change
**Problem**: Every list endpoint (`GET /leads`, `/customers`, `/opportunities`, `/followups`, `/tasks`) returned a 500 during end-to-end verification.
**Why it was difficult**: The error — `Cannot set property query of #<IncomingMessage> which has only a getter` — pointed at generic validation middleware, not at any specific feature, so it looked at first like it could be anywhere in the request pipeline.
**Investigation**: Read the actual server log stack trace (not just the HTTP response), which pointed exactly at `middleware/validate.js:18`. Recognized it as an Express major-version behavior change — Express 5 made `req.query` a getter-only accessor, where Express 4 (what most tutorials/patterns assume) had it as a plain writable property.
**Solution**: `Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true })` instead of a plain assignment — shadows the inherited getter with an own, writable property, so every controller keeps reading `req.query` exactly as before. Zero changes needed anywhere else.
**Result**: Fixed in one line, retested immediately, confirmed working, documented in `DECISIONS.md` so it doesn't get silently "fixed" the wrong way later.

## 4. Technical Decisions (full list in `DECISIONS.md`)
- **PostgreSQL over MongoDB**: the data (Users, Customers, Leads, Opportunities, FollowUps, Tasks) is inherently relational, and the dashboard's aggregate queries (revenue by month, pipeline by stage, sales performance by rep) are exactly what SQL is good at.
- **Prisma pinned to v6, not the newer v7**: the default install resolved to Prisma 7, which defaults to a driver-adapter architecture (`@prisma/adapter-pg`) and a separate config file — a bigger, newer surface area than the well-established `datasource url` + `new PrismaClient()` pattern the rest of the design assumed. Pinning to 6 was the lower-risk call for an MVP.
- **`@dnd-kit` over `react-beautiful-dnd`**: the latter is deprecated/unmaintained; `@dnd-kit` is the actively maintained modern equivalent for the same pointer-sensor-based drag-and-drop pattern.
- **JWT in a header, not a cookie**: simpler for a two-port local dev setup (Vite proxying to Express) without a CORS/credentials dance. Tradeoff: token is readable by page JS, acceptable for local-dev MVP, would reconsider for production.
- **Row-level ownership scoping over per-route role gates**: most routes aren't gated by role at all — they're gated by a `where` clause built from the requester's identity (`utils/ownership.js`). A Sales Executive isn't blocked from `/leads`, they just transparently only ever see their own.

## 5. What Was the Hardest Part?
The Express 5 `req.query` bug (see Challenge #2 above) — not because the fix was hard, but because it was invisible to every check that ran before actual end-to-end testing: `node --check` (pure syntax), the Vite production build (pure bundling/transform), even starting the server and hitting the health check all passed clean. It only surfaced when I ran a real request through a real route with a real query schema. That's the concrete argument for why "it builds" and "it runs" are not the same as "it works" — this project's own testing strategy (see `TESTING.md`) exists because of exactly this kind of gap.

## 6. What Would I Improve?
- **Automated tests** (see `TECHNICAL_DEBT.md` and `PROJECT_SCORE.md` — the lowest-scored category by far). Priority: the RBAC/ownership-scoping logic and the convert-lead transaction, since those are the two places a silent regression would have the worst consequences (data leaking across sales reps, or duplicate customer/deal records).
- **Rate limiting on auth endpoints** before any real deployment.
- **A searchable combobox instead of a plain `<select>`** for the opportunity-form customer picker, once customer lists get large.
- **Verify responsive breakpoints on an actual device**, not just in code — this was reviewed but not device-tested in this pass.

## 7. What Did I Learn?
- **Technical**: Prisma transaction patterns for multi-record atomic operations; `@dnd-kit`'s pointer-sensor model and why synthetic single-jump drags in browser automation don't satisfy it (had to simulate a realistic `pointerdown`→`pointermove`×N→`pointerup` sequence to actually prove the interaction worked); Express 5's breaking changes vs. Express 4 assumptions baked into a lot of existing tutorials and patterns.
- **Architecture**: how to decide when two "similar" entities (Lead, Opportunity) genuinely deserve separate models vs. one entity with more states — the deciding factor was that they have different owners-in-time (a Lead belongs to pre-qualification, an Opportunity to an active deal) and the product's own flow treats the transition as a real event, not a tick.
- **Engineering process**: the value of writing down *why* a decision was made, not just what — several entries in `DECISIONS.md` (the Prisma version pin, the Express 5 fix) are exactly the kind of context that would otherwise be lost and re-litigated later.

## Skills Demonstrated (evidence-based)
| Skill | Evidence | Talking Point |
|---|---|---|
| React (hooks, context, routing) | `AuthContext`/`ToastContext`, `react-router-dom` nested/protected routes, ~20 components | Explain the auth-rehydration-on-refresh flow |
| REST API design | 7 backend modules, consistent routes→controller→service→validation layering | Explain the convert-lead endpoint's design |
| Relational data modeling | 6-model Prisma schema with a deliberate Lead/Opportunity split | Explain the modeling tradeoff in Challenge #1 |
| Transactions / data integrity | `prisma.$transaction` for atomic multi-record writes, idempotency guard | Walk through `convertLead` |
| Access control | Role-based + row-level ownership scoping, verified via direct testing | Explain `utils/ownership.js`'s `scopeToOwner`/`assertOwnership` |
| Debugging | Found and fixed the Express 5 `req.query` regression from a raw stack trace | Tell the Challenge #2 story |
| Drag-and-drop UI | `@dnd-kit` kanban board, verified with a real (not synthetic-shortcut) interaction test | Explain why the naive automated test didn't work and what that revealed |
| Documentation discipline | This entire `/docs` suite, kept honest and current throughout the build | Point at `DECISIONS.md` and `IMPLEMENTED_FEATURES.md` |

## Draftable Now, Revisit After More Real Usage
STAR stories beyond the two above, resume bullets, LinkedIn/portfolio copy, and a formal skill-growth "before/after" — these are better written after this project sees more real iteration (Phase 2 features, or actual usage) so they reflect lived experience rather than a single build session. The two challenges documented above are real and ready to use as-is.
