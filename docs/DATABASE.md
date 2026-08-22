# Database

PostgreSQL, accessed via Prisma ORM. Database name `crm_db`, local instance at `localhost:5432`.

## Schema Summary
Six models — see `server/prisma/schema.prisma` for the authoritative, complete definition once written.

- **User** — `id, name, email(unique), password(hashed), role(enum: ADMIN/SALES_MANAGER/SALES_EXECUTIVE), isActive, timestamps`. Relations: assigned leads/opportunities/followups/tasks, owned customers, created tasks.
- **Lead** — `id, name, company, email, phone, source, status(enum: NEW/CONTACTED/QUALIFIED/CONVERTED/LOST), notes, assignedToId→User, convertedAt, convertedToCustomerId(unique, nullable)→Customer, timestamps`. `@@unique([email, company])` for duplicate prevention.
- **Customer** — `id, name, email(unique), phone, company, address, notes, ownerId→User, timestamps`. "Purchase history" = the `notes` field + querying related `opportunities` filtered to `WON` — deliberately not a separate model, to avoid over-modeling for MVP.
- **Opportunity** — `id, title, value(Decimal 12,2), stage(enum: NEW_LEAD/CONTACTED/QUALIFIED/PROPOSAL_SENT/NEGOTIATION/WON/LOST), customerId→Customer, leadId(nullable)→Lead, assignedToId→User, expectedCloseDate, closedAt, notes, timestamps`.
- **FollowUp** — `id, type(enum: CALL/MEETING/EMAIL/REMINDER/OTHER), notes, scheduledAt, status(enum: PENDING/COMPLETED/CANCELLED), completedAt, assignedToId→User, leadId/customerId/opportunityId(all nullable, ≥1 required by app-level validation), timestamps`.
- **Task** — `id, title, description, status(enum: PENDING/IN_PROGRESS/COMPLETED), dueDate, completedAt, assignedToId→User, createdById→User, leadId/customerId/opportunityId(all optional), timestamps`.

## Why This Shape
See `ARCHITECTURE.md`'s "Lead → Customer/Opportunity Relationship" section for the full reasoning. In short: Lead and Opportunity are kept as separate entities (not one record with a growing status enum) because they represent genuinely different lifecycles — a Lead is pre-qualification, an Opportunity is an active deal against a real Customer — and the source spec's own application flow (*Add Lead → Assign Rep → Track Follow-ups → Convert Lead → Generate Reports*) treats "convert" as a distinct event, not a status tick.

## Duplicate Prevention
Two layers on `(email, company)`:
1. App-level pre-check in `leads.service.js` — normalize email (`trim().toLowerCase()`), case-insensitive company match, return `409` before attempting insert.
2. DB-level `@@unique([email, company])` — safety net if a race condition slips past the pre-check; Prisma's `P2002` error is mapped to the same `409` by the global error handler.

## Notable Type Handling
`Opportunity.value` is a Prisma `Decimal`. Must call `.toNumber()` (or `Number(...)`) before serializing to JSON in any API response — including `_sum` aggregate results in the dashboard queries.

## Soft Deletes
`User.isActive` is the only soft-delete flag — deactivating a user (via `DELETE /users/:id`, which sets `isActive=false` rather than removing the row) preserves referential integrity for every Lead/Customer/Opportunity/FollowUp/Task they're linked to. No other model is soft-deleted in MVP scope (Leads/Customers/Opportunities/FollowUps/Tasks use hard delete via their DELETE endpoints).

## Migrations
Managed via `prisma migrate dev`. First migration `20260814135645_init` applied and verified — all 6 tables (plus `_prisma_migrations`) confirmed present in `crm_db` via direct query.
