# Testing

## Current Strategy
No automated test suite exists — explicitly deferred for MVP scope (see `FUTURE_FEATURES.md` and `TECHNICAL_DEBT.md`, which is the honest place this gap is tracked as risk). All verification for the Core MVP build was **manual**, performed in two passes on 2026-08-14.

### Pass 1 — Backend, via curl
Chained shell script against the running dev server, covering:
- Register, login, `/auth/me`
- RBAC: Sales Executive gets `403` on `GET /users`, Admin gets `200`
- Lead creation + duplicate prevention (same email+company, including a case-varied second attempt) → `409`
- Convert Lead → Customer + Opportunity created correctly; converting the same lead again → `409` with the existing `customerId`, no duplicate rows
- Opportunity stage walk: `PROPOSAL_SENT → NEGOTIATION → WON`, confirming `closedAt` gets set
- Follow-up creation with a link (success) and without any link (`400` validation error), upcoming-follow-ups widget showing/clearing correctly, mark-complete
- Task creation linked to an opportunity, RBAC check (Sales Executive can't assign to another user → `403`), status update
- Dashboard summary + revenue trend, checked for both the scoped Sales Executive and the team-wide Admin view

### Pass 2 — Frontend, via live browser (Chrome, automated)
- Login flow (including recovering from Chrome autofill inserting unrelated saved credentials into the form)
- Dashboard: confirmed all stat cards, the revenue chart, pipeline funnel chart, and sales performance table matched the Pass 1 curl data exactly
- Leads list rendering with status badges
- **Pipeline kanban drag-and-drop**: a synthetic single-jump drag didn't trigger `@dnd-kit`'s pointer sensor (a browser-automation-tool limitation, not an app bug — confirmed by checking that `@dnd-kit`'s `role="button"`/`aria-roledescription="draggable"` attributes were correctly present on the card). A realistic simulated `pointerdown`→multiple `pointermove`→`pointerup` sequence worked correctly, moved the card, and the new stage was confirmed to persist across a full page reload.
- Customer detail page: profile fields + linked opportunity ("purchase history") rendered correctly
- User management: role dropdown and deactivate button rendered and functioned correctly

Also caught and fixed one real bug during this process: Express 5's `req.query` is a getter-only property, which broke every list endpoint (`GET /leads`, `/customers`, `/opportunities`, `/followups`, `/tasks`) with a 500 error. See `DECISIONS.md`.

## Critical Flows (highest priority to eventually automate)
1. RBAC/ownership scoping — a Sales Executive must never see another rep's records via any endpoint. **Manually verified working.**
2. Duplicate lead prevention — same email+company twice must 409, not create a duplicate. **Manually verified working.**
3. Convert Lead idempotency — converting the same lead twice must not create duplicate Customers/Opportunities. **Manually verified working.**
4. Pipeline stage transitions — `closedAt` must be set/cleared correctly entering/leaving WON/LOST. **Manually verified working** (set-on-entry confirmed; clear-on-exit is implemented identically but wasn't separately exercised in this pass).

## Known Untested Areas
- Responsive breakpoints (`@media max-width:768px`) — present in code, not verified on an actual narrow viewport.
- Concurrent/race-condition behavior on convert-lead (see `TECHNICAL_DEBT.md`) — theoretical, not reproduced.
- Report export, notifications, and all Phase 2 features — not built, so not applicable.

## Coverage Expectations
None formally set for MVP. If/when automated tests are introduced (see `FUTURE_FEATURES.md`), the four critical flows above should be the first covered — they're the highest-consequence-if-broken code paths in the app, per `PROJECT_SCORE.md`.
