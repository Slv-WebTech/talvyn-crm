# Project Plan

## Completed
Core MVP — all 7 feature areas built and verified (see `IMPLEMENTED_FEATURES.md` for full detail):
1. Documentation baseline + ongoing docs-first process
2. Workspace scaffold (pnpm, client, server)
3. Prisma schema + DB migration
4. Auth backend (register/login/me) + seed script
5. Users module + RBAC/ownership-scoping middleware
6. Customers module
7. Leads module + duplicate prevention
8. Convert Lead transaction (idempotent)
9. Opportunities module + pipeline stage endpoint
10. Frontend foundation (auth context, routing, layout)
11. Frontend Leads + Customers pages
12. Pipeline kanban board (`@dnd-kit`, drag-and-drop verified live)
13. Follow-ups module (backend + frontend)
14. Tasks module (backend + frontend)
15. Dashboard (backend aggregates + Recharts frontend)
16. Polish pass (toast notifications, final docs sync) + full end-to-end verification (curl + live browser)
17. Dark premium visual redesign (2026-08-17) — full app restyled login-through-dashboard, `lucide-react` icons, Inter typeface, dark-mode Recharts; verified live in-browser including a drag-and-drop re-test; two real CSS bugs found and fixed along the way (see `DECISIONS.md`)

## In Progress
*(none — MVP build + redesign complete)*

## Next
Nothing scheduled. Awaiting direction from the user on what to build next — likely candidates from `FUTURE_FEATURES.md` (report export and notifications are the two "High Priority" items closest to core scope), a deployment pass (see `DEPLOYMENT.md`), automated tests, or a light-mode toggle (the dark theme was an explicit choice, not the only option — see `FUTURE_FEATURES.md`).

## Later (Phase 2 — deferred, see `FUTURE_FEATURES.md`)
- PDF/Excel report export
- In-app / real-time notifications
- Bonus features: AI lead scoring, email/WhatsApp/SMS integration, call logging, team chat, calendar integration, predictive analytics, multi-tenant support, PWA, CI/CD, audit logs, automated tests

## Blocked
*(none — the Postgres password blocker from the build phase was resolved)*

## Task Definition of Done
For each item above: objective met, code exists and runs, manually verified per `TESTING.md`, and the relevant docs (`DEV_CONTEXT.md`, `IMPLEMENTED_FEATURES.md`, `CHANGELOG.md`, `API_DOCUMENTATION.md`/`SITE_MAP.md`) updated. Applied consistently through this build — nothing above is marked complete on the strength of a plan alone.
