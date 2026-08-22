# CRM System — Documentation Index

A role-based CRM for sales teams: leads → customers → pipeline → follow-ups → tasks → dashboard.

## Quickstart
Core MVP is built and verified working. Requires a local PostgreSQL instance and `server/.env` populated (see `server/.env.example`).
```
pnpm install
pnpm dev        # runs server (:5000) and client (:5173) together
```
Seeded admin login: `admin@crm.local` / `Admin@12345` (see `server/prisma/seed.js`).
See `DEPLOYMENT.md` for environment setup and `DEV_CONTEXT.md` for exact current status.

## Documentation Map
- [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) — what this is, who it's for, why it exists
- [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) — roadmap: completed / in progress / next / later / blocked
- [`DEV_CONTEXT.md`](./DEV_CONTEXT.md) — **start here when resuming work** — current state, next action
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system design, module layout, RBAC pattern
- [`DATABASE.md`](./DATABASE.md) — Prisma schema and data model reasoning
- [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) — REST route reference
- [`SITE_MAP.md`](./SITE_MAP.md) — frontend routes
- [`FEATURES.md`](./FEATURES.md) / [`IMPLEMENTED_FEATURES.md`](./IMPLEMENTED_FEATURES.md) / [`FUTURE_FEATURES.md`](./FUTURE_FEATURES.md) — feature inventory by status
- [`PROJECT_STYLE.md`](./PROJECT_STYLE.md) — UI/UX and code conventions
- [`PROJECT_SCORE.md`](./PROJECT_SCORE.md) — honest quality self-assessment
- [`TECHNICAL_DEBT.md`](./TECHNICAL_DEBT.md) — known shortcuts and their tradeoffs
- [`DECISIONS.md`](./DECISIONS.md) — ADR log of significant technical decisions
- [`TESTING.md`](./TESTING.md) — testing strategy
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — environment and deployment notes
- [`CHANGELOG.md`](./CHANGELOG.md) — dated history of changes
- [`INTERVIEW_GUIDE.md`](./INTERVIEW_GUIDE.md) — portfolio/interview framing (filled in as real work accumulates)
