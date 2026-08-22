# Development Context

_This is the first file to read when resuming work on this project._

## Current Objective
None active — Core MVP + dark premium redesign (now verified across every single page, including 404) are complete. Awaiting the user's direction on what to build next.

## Current Phase
Post-MVP, post-redesign. All 16 original build-order steps plus the visual redesign pass and its full verification sweep are done.

## Current Task
None in progress.

## Recently Completed Work
- **2026-08-14**: Full Core MVP built and verified (auth/RBAC, leads, customers, convert-lead, pipeline, follow-ups, tasks, dashboard). Fixed a real Express 5 `req.query` bug found during verification. Added a toast notification system.
- **2026-08-17**: Full dark premium visual redesign (Linear/Vercel-style, user's explicit choice) — every page touched, `lucide-react` icons added, Inter typeface, Recharts restyled for dark mode. Fixed two real CSS bugs found during live verification (search bar padding overridden by a higher-specificity rule; unstyled native `<select>` elements) — see `DECISIONS.md`. Followed up with a full page-by-page verification sweep (register, customers, follow-ups, tasks, lead detail, 404) that caught one more real gap — the 404 page had no styling applied at all (floated top-left, no card) — fixed with a centered-card treatment matching the auth pages.

## Files Recently Changed
Most recently: `client/src/pages/NotFoundPage.jsx` + `client/src/styles/layout.css` (404 page fix). Before that: all `client/src/styles/*.css` files, `client/index.html`, `client/src/components/layout/{Sidebar,Topbar}.jsx`, `client/src/pages/*.jsx` (icon integration across all pages), `client/src/components/dashboard/{RevenueChart,PipelineFunnelChart,StatCard}.jsx`, `client/src/context/ToastContext.jsx` + `hooks/useToast.js` (added during MVP polish, still current). See `CHANGELOG.md` for full history.

## Important Implementation Details to Remember
- **Local Postgres requires a password** (`scram-sha-256` auth) — it's in `server/.env` (not committed). Data persists independent of dev-server process lifecycle — confirmed after a multi-day gap, `crm_db` and its seeded/test data were still intact.
- **Prisma is pinned to v6** — don't casually `pnpm add prisma@latest`; v7 uses an incompatible driver-adapter architecture (see `DECISIONS.md`).
- **Express 5 quirk**: `req.query` is getter-only; any new middleware mutating query params must use `Object.defineProperty` (see `middleware/validate.js`).
- **CSS specificity gotcha**: a class-only selector (e.g. `.search-bar`) can be silently beaten by a class+element selector elsewhere (e.g. `.page-filters input`) even if it comes later in the file. When a component's own styling isn't applying, check for a more-specific shared rule before assuming the CSS is missing. `styles/index.css` now has a global baseline for `input`/`select`/`textarea` specifically to prevent the "unstyled native element outside any wrapper" version of this bug.
- **Background dev servers started by Claude in this environment don't reliably persist between conversation turns** — they get torn down once the agent goes idle. The user now runs `pnpm dev` themselves (own terminal or `! pnpm dev`) so the app stays up independent of the conversation.
- **The seeded admin account**: `admin@crm.local` / `Admin@12345`. Test account: `jane.rep@crm.local` / `Passw0rd123` (SALES_EXECUTIVE), with one converted lead/customer/opportunity ("Sam Prospect" / "Acme Corp", $15,000, WON) in the database.
- **Visual direction is dark-only** — no light theme/toggle exists. If a light mode is ever requested, extend the token set in `styles/index.css` rather than replacing it (tokens are already organized for this).

## Known Issues
See `TECHNICAL_DEBT.md` — nothing blocking, all documented tradeoffs. No new technical debt from the redesign (the two CSS bugs found were fixed, not left as debt).

## Current Blockers
None.

## Decisions Made Recently
See `DECISIONS.md` — most recently: the dark premium visual direction (user's explicit choice) and the global form-control baseline style fix.

## Things That Must NOT Be Changed Without Discussion
- The Lead/Customer/Opportunity data model split (see `DATABASE.md`).
- The RBAC/ownership-scoping pattern (`middleware/auth.js` + `utils/ownership.js`) — the single highest-consequence-if-broken piece of the app.
- The Prisma major version pin (v6).
- The dark theme direction — was an explicit user choice between two options, not a default to casually change back.

## Next Recommended Action
Ask the user what to build next. Candidates from `FUTURE_FEATURES.md`: report export, notifications, or automated tests (still the weakest-scored category in `PROJECT_SCORE.md` — the redesign didn't change that). If resuming autonomously, re-read `PROJECT_PLAN.md`'s "Next" section first.

## Commands
- Install: `pnpm install` (root)
- Run dev: `pnpm dev` (root — runs server `:5000` + client `:5173` together). **Run this yourself in your own terminal** — see note above about background-process persistence.
- Prisma migrate: `pnpm --filter server prisma:migrate`
- Prisma studio: `pnpm --filter server prisma:studio`
- Seed: `pnpm --filter server prisma:seed` (or `node prisma/seed.js` from `server/`)
- Build client: `pnpm --filter client build`

## Environment Requirements
- Node v24.13.0+, pnpm 10+
- PostgreSQL 17 running locally on `:5432`, database `crm_db` (already created and migrated)
- `server/.env` populated with a real `DATABASE_URL`
