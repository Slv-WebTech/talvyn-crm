# API Documentation

Base path: `/api`. All routes except `POST /auth/register`, `POST /auth/login`, and `GET /health` require `Authorization: Bearer <token>`.

"Scoped" = no role gate, but every query is filtered through `utils/ownership.js` — a SALES_EXECUTIVE only ever sees/mutates their own assigned records; ADMIN and SALES_MANAGER see everything.

_Status: all routes below are implemented and were verified via a live curl walkthrough on 2026-08-14 (see `TESTING.md`). Error responses use `{ "error": { "message": "...", "details": ... } }`._

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/health` | public | Liveness check |
| POST | `/auth/register` | public | Create a SALES_EXECUTIVE account (self-serve register can't grant elevated roles) |
| POST | `/auth/login` | public | Verify credentials, issue JWT |
| GET | `/auth/me` | any | Current user profile, used to rehydrate session on page load |
| GET | `/users` | ADMIN, SALES_MANAGER | List users (assignee dropdowns) |
| POST | `/users` | ADMIN | Create user with any role |
| GET | `/users/:id` | ADMIN, SALES_MANAGER | Get one user |
| PUT | `/users/:id` | ADMIN | Update name/role/isActive |
| DELETE | `/users/:id` | ADMIN | Soft-delete (`isActive=false`) |
| GET | `/customers` | any (scoped) | List + search (`?search=&page=&limit=`) |
| POST | `/customers` | any (scoped) | Create (Sales Executive auto-assigned as owner) |
| GET | `/customers/:id` | any (scoped) | Get one |
| PUT | `/customers/:id` | any (scoped) | Update |
| DELETE | `/customers/:id` | any (scoped) | Delete |
| GET | `/customers/:id/opportunities` | any (scoped) | This customer's deals ("purchase history") |
| GET | `/leads` | any (scoped) | List (`?search=&status=&assignedToId=`) |
| POST | `/leads` | any (scoped) | Create; duplicate email+company → 409 |
| GET | `/leads/:id` | any (scoped) | Get one |
| PUT | `/leads/:id` | any (scoped) | Update; reassignment restricted to ADMIN/SALES_MANAGER |
| DELETE | `/leads/:id` | any (scoped) | Delete |
| POST | `/leads/:id/convert` | any (scoped) | Convert Lead → Customer + Opportunity (idempotent) |
| GET | `/opportunities` | any (scoped) | List (`?stage=`) |
| POST | `/opportunities` | any (scoped) | Create directly against an existing customer |
| GET | `/opportunities/:id` | any (scoped) | Get one |
| PUT | `/opportunities/:id` | any (scoped) | Update title/value/expectedCloseDate/notes/assignee |
| PATCH | `/opportunities/:id/stage` | any (scoped) | Kanban drag stage-change (body `{ stage }`) |
| DELETE | `/opportunities/:id` | any (scoped) | Delete |
| GET | `/followups` | any (scoped) | List (`?status=&upcoming=true&leadId=&customerId=&opportunityId=`) |
| POST | `/followups` | any (scoped) | Create; must link ≥1 of lead/customer/opportunity |
| GET | `/followups/:id` | any (scoped) | Get one |
| PUT | `/followups/:id` | any (scoped) | Reschedule/edit |
| PATCH | `/followups/:id/complete` | any (scoped) | Mark completed |
| DELETE | `/followups/:id` | any (scoped) | Delete |
| GET | `/tasks` | any (scoped) | List (`?status=&assignedToId=&leadId=&customerId=&opportunityId=`) |
| POST | `/tasks` | any (scoped) | Create; SALES_EXECUTIVE can only assign to self |
| GET | `/tasks/:id` | any (scoped) | Get one |
| PUT | `/tasks/:id` | any (scoped) | Update |
| PATCH | `/tasks/:id/status` | any (scoped) | Quick status change |
| DELETE | `/tasks/:id` | any (scoped) | Delete |
| GET | `/dashboard/summary` | any (scoped) | totalCustomers, totalLeads, dealsWon, dealsLost, monthlyRevenue, pipelineByStage, salesPerformance |
| GET | `/dashboard/upcoming-followups` | any (scoped) | Next N pending follow-ups |
| GET | `/dashboard/revenue-trend` | any (scoped) | Monthly Won-value totals, last 6 months |

## Error Response Shape
```json
{ "error": { "message": "human-readable message", "details": null } }
```
`P2002` (Prisma unique constraint) → 409, `P2025` (not found) → 404, thrown `ApiError` → its own status code, anything else → 500.
