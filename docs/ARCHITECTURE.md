# Architecture

## Overview
pnpm workspace monorepo: `client/` (React + Vite SPA) talks to `server/` (Express REST API) over HTTP, proxied together in dev. `server/` persists to PostgreSQL via Prisma. See `DATABASE.md` for the schema and `API_DOCUMENTATION.md` for the route reference.

## Backend Architecture
```
server/
  src/
    index.js  app.js              # entrypoint, Express app assembly
    lib/prisma.js                 # single PrismaClient instance
    config/env.js                 # env var loading/validation
    middleware/
      auth.js                     # authenticate + authorize
      errorHandler.js  notFound.js  validate.js
    utils/
      ApiError.js  asyncHandler.js  jwt.js  password.js  ownership.js  pagination.js
    modules/
      auth/  users/  customers/  leads/  opportunities/  followups/  tasks/  dashboard/
        *.routes.js  *.controller.js  *.service.js  *.validation.js
    routes/index.js                # mounts every module router under /api
```
Each module follows the same layering: `routes` (wire HTTP verbs to controllers, apply middleware) → `controller` (parse request, call service, shape response) → `service` (business logic, all Prisma calls) → `validation` (zod schemas for request bodies).

### Auth & RBAC
`authenticate` middleware verifies the JWT (payload is just `{ id }`), re-fetches the user from the DB on every request — so a role change or deactivation by an Admin takes effect immediately, not just on next login — and attaches the sanitized user to `req.user`. `authorize(...roles)` gates a route to specific roles (used sparingly, mainly the Users module).

Most routes don't use `authorize()` at all — instead every module's queries pass through `utils/ownership.js`:
- `scopeToOwner(user, field)` → `{}` for ADMIN/SALES_MANAGER (see everything), `{ [field]: user.id }` for SALES_EXECUTIVE (see only their own).
- `assertOwnership(user, record, field)` → guards single-record mutations the same way.
- `field` is `ownerId` on Customer, `assignedToId` everywhere else (Lead, Opportunity, FollowUp, Task).

This means role-based access control is really **row-level ownership scoping** layered under a thin route-level role gate — a Sales Executive isn't blocked from the `/leads` endpoint, they just transparently only ever see their own leads.

### Error Handling
`ApiError(statusCode, message, details)` thrown from services/controllers, `asyncHandler` wraps async route handlers to forward rejections to `next()`, and one global `errorHandler` middleware maps everything to a consistent `{ error: { message, details } }` response — including translating Prisma's `P2002` (unique constraint) → 409 and `P2025` (not found) → 404.

### The Lead → Customer/Opportunity Relationship
This is the central modeling decision of the app, matching the intended flow: *Add Lead → Assign Sales Rep → Track Follow-ups → Convert Lead → Generate Reports*.

- **Lead** is the initial capture — simple lifecycle (`NEW → CONTACTED → QUALIFIED → CONVERTED` or `LOST`).
- **Opportunity** is a separate pipeline entity with its own 7-stage lifecycle, always tied to a **Customer** (never directly to a Lead alone).
- `POST /leads/:id/convert` is the bridge: a `prisma.$transaction` that finds-or-creates a Customer (deduped by email, so a returning contact doesn't get duplicated), creates an Opportunity at `QUALIFIED` stage pre-filled from the Lead, and marks the Lead `CONVERTED` (never deleted — it remains an audit trail). Idempotent: converting an already-converted Lead returns `409` with the existing linkage rather than creating duplicates.
- Known tradeoff: see `TECHNICAL_DEBT.md` for the race-condition note on rapid double-clicks.

## Frontend Architecture
```
client/src/
  routes/          # AppRoutes, ProtectedRoute (role-gated)
  context/          # AuthContext (user/token/login/logout/register), ToastContext (global toast notifications)
  services/          # one file per API resource, all built on services/api.js
  pages/                # one per route, see SITE_MAP.md
  components/<domain>/    # presentational + form components grouped by feature
  components/common/LinkPicker.jsx  # shared entity-type-then-record picker, used by FollowUpForm/TaskForm
  hooks/  utils/
  styles/            # index.css (tokens+reset), layout.css, components.css (shared UI kit incl. toasts),
                     # pipeline.css, dashboard.css — consolidated by actual usage rather than
                     # per-domain (leads/customers share the same generic component classes)
```
- **Auth flow**: `services/api.js` is a single axios instance; a request interceptor attaches `Authorization: Bearer <token>` from `AuthContext`, a response interceptor clears auth and redirects to `/login` on 401. Token persisted in `localStorage`; `GET /auth/me` rehydrates the session on app load so refresh doesn't log the user out.
- **State management**: React Context (auth + toast) + local component state. No global store library — not needed at this scope.
- **Feedback**: form-level errors use inline `.form-error` text; actions with no adjacent form (completing a follow-up, changing a task/user status) use `useToast()` for a dismissible, auto-expiring notification.
- **Data flow**: pages call `services/*.js` functions (thin axios wrappers) directly in `useEffect`/event handlers; no data-fetching library (e.g. TanStack Query) introduced for MVP — a candidate for later if manual loading/error state boilerplate becomes painful.
- **Pipeline kanban**: `@dnd-kit` `DndContext` in `KanbanBoard`, droppable `KanbanColumn` per stage, draggable `OpportunityCard`. `onDragEnd` optimistically updates local state then calls `PATCH /opportunities/:id/stage`, rolling back on failure.
- **Dashboard charts**: Recharts, fed by the three `/dashboard/*` aggregate endpoints. Restyled with explicit dark-mode-appropriate colors (grid/axis/tooltip) rather than relying on CSS variable inheritance into SVG, for cross-browser reliability; `RevenueChart` uses a gradient-filled `AreaChart`, `PipelineFunnelChart` colors the Won/Lost bars with their semantic colors via per-`Cell` fills.
- **Icons**: `lucide-react` — tree-shakeable (confirmed: adding it moved the production bundle by <2kB despite importing ~30 distinct icons across the app). Used for sidebar nav, action buttons, status indicators, and the loading spinner.

## Database Architecture
See `DATABASE.md` for the full schema. Six models: User, Lead, Customer, Opportunity, FollowUp, Task — all linked by foreign keys, with soft-delete on User (`isActive`) so history on related records survives account deactivation.

## Deployment Architecture
Not yet deployed — see `DEPLOYMENT.md`. Target (per original spec, not yet executed): Vercel (frontend), Render/Railway (backend), managed Postgres.

## Security Boundaries
- All mutating routes require a valid JWT.
- Row-level ownership scoping prevents a Sales Executive from reading/writing another rep's records via the API, not just hiding them in the UI.
- Passwords hashed with `bcryptjs`, never returned in any API response.
- Input validated with `zod` before reaching business logic.
- This is MVP-level security (no rate limiting, no CSRF concerns given no cookies, no audit log yet) — see `TECHNICAL_DEBT.md` and `FUTURE_FEATURES.md` for what's deferred.
