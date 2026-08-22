# Talvyn

A role-based CRM for sales teams — leads, customers, a drag-and-drop pipeline, follow-ups, tasks, and a live dashboard, in one place.

Built as a full end-to-end product: a real Express + PostgreSQL API underneath, row-level ownership scoping for RBAC, and a hand-built dark, "premium SaaS" interface (no component library) on the frontend.

## Features

- **Leads → Customers → Pipeline** — capture a lead, convert it in one action into a deduped Customer + a 7-stage Opportunity (`New Lead → Contacted → Qualified → Proposal Sent → Negotiation → Won/Lost`), never losing the original lead as an audit trail.
- **Drag-and-drop sales pipeline** — a `@dnd-kit`-powered kanban board; dragging a card between stages updates it optimistically and persists via a single `PATCH`.
- **Follow-ups & tasks** — schedulable, completable, linkable to a lead, customer, and/or opportunity.
- **Role-based access** — three roles (Sales Executive, Sales Manager, Admin) with row-level ownership scoping baked into every query, not just hidden in the UI.
- **Live dashboard** — revenue trend, pipeline funnel, sales performance by rep, and upcoming follow-ups, via Recharts.
- **A real design system** — CSS custom-property tokens for color/spacing/radius/shadow, a focus-trapped accessible `Modal`, skeleton loading screens, a searchable `Combobox`, an off-canvas mobile nav drawer, toast notifications with `aria-live`, and `prefers-reduced-motion` support throughout.

## Tech stack

| | |
|---|---|
| **Frontend** | React 19 (Vite), React Router, `@dnd-kit`, Recharts, `lucide-react`, hand-written CSS |
| **Backend** | Node.js (ESM, plain JavaScript), Express |
| **Database** | PostgreSQL via Prisma ORM |
| **Auth** | JWT (`jsonwebtoken` + `bcryptjs`), Bearer-token header |
| **Tooling** | pnpm workspace monorepo, oxlint |

## Getting started

Requires a local PostgreSQL instance.

```bash
pnpm install
cp server/.env.example server/.env   # then fill in DATABASE_URL / JWT_SECRET
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev                              # server on :5000, client on :5173
```

Seeded logins (from `server/prisma/seed.js`):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@crm.local` | `Admin@12345` |
| Sales Executive | `jane.rep@crm.local` | `Passw0rd123` |

## Project structure

```
client/src/
  pages/            one per route
  components/       presentational + form components, grouped by domain
  components/common/  shared design-system pieces (Modal, Combobox, Skeleton, Toast, ...)
  context/          auth + toast providers
  services/         thin axios wrappers, one file per API resource
  styles/           CSS custom-property tokens + hand-written stylesheets

server/src/
  modules/<domain>/  routes → controller → service → validation, per resource
  middleware/       auth, RBAC/ownership scoping, error handling, validation
  lib/prisma.js     single PrismaClient instance
```

## Documentation

The [`docs/`](./docs) directory has a full knowledge base — architecture, database schema, API reference, UI/UX style guide, ADR log of every significant decision, and an honestly-maintained technical debt list. Start at [`docs/README.md`](./docs/README.md).

## License

MIT
