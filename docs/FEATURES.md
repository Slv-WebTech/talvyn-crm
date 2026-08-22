# Feature Inventory

Status values: `PLANNED`, `IN_PROGRESS`, `IMPLEMENTED`, `TESTING`, `PARTIALLY_IMPLEMENTED`, `BLOCKED`, `DEPRECATED`.

| Feature | Purpose | User Value | Dependencies | Status | Related Pages | Related APIs |
|---|---|---|---|---|---|---|
| Authentication & RBAC | Register/login, 3 roles (Admin/Sales Manager/Sales Executive) | Secures data, scopes visibility to the right people | Prisma User model | IMPLEMENTED | LoginPage, RegisterPage | `/auth/*` |
| User management | Admin creates/edits/deactivates user accounts | Lets an org onboard its sales team with correct roles | Auth & RBAC | IMPLEMENTED | UsersPage | `/users/*` |
| Lead management | Capture and track early-stage contacts | Central place to track inbound interest before it's a real customer | Auth & RBAC | IMPLEMENTED | LeadsPage, LeadDetailPage | `/leads/*` |
| Duplicate lead prevention | Blocks creating a lead with the same email+company twice | Keeps the lead list clean, avoids reps working the same contact twice | Lead management | IMPLEMENTED | LeadsPage | `POST /leads` (409 on dup) |
| Customer management | Store and search full customer records | System of record for real accounts, not just prospects | Auth & RBAC | IMPLEMENTED | CustomersPage, CustomerDetailPage | `/customers/*` |
| Convert Lead | Turns a qualified Lead into a Customer + Opportunity | The core "lead becomes revenue" workflow step | Lead + Customer + Opportunity models | IMPLEMENTED | LeadDetailPage | `POST /leads/:id/convert` |
| Sales pipeline (kanban) | Visual drag-and-drop board across 7 deal stages | Instant visibility into where every deal stands | Opportunity model, `@dnd-kit` | IMPLEMENTED | PipelinePage | `/opportunities/*` |
| Follow-up management | Schedule calls/meetings/reminders tied to a record | Nothing falls through the cracks | Lead/Customer/Opportunity | IMPLEMENTED | FollowUpsPage, dashboard widget | `/followups/*` |
| Task management | Create/assign/track action items | Turns "next steps" into trackable work | Auth & RBAC | IMPLEMENTED | TasksPage | `/tasks/*` |
| Dashboard | Aggregate stats, charts, upcoming follow-ups | At-a-glance view of business health, scoped to the viewer's role | All above modules | IMPLEMENTED | DashboardPage | `/dashboard/*` |
| Report export (PDF/Excel) | Download formatted reports | — | Dashboard aggregates | **Deferred — Phase 2**, see `FUTURE_FEATURES.md` | — | — |
| Notifications | Real-time/in-app alerts | — | — | **Deferred — Phase 2** | — | — |
| Bonus features (AI scoring, integrations, PWA, CI/CD, audit logs, tests) | — | — | — | **Deferred — Phase 2** | — | — |
