# Site Map

All routes render inside `AppLayout` (persistent sidebar/topbar) except auth pages. Status reflects actual build state, updated per build step — not aspirational.

```
Application
├── /login                    Public          LoginPage
├── /register                 Public          RegisterPage
├── / (Dashboard)              Any auth'd      DashboardPage
├── /leads                     Any auth'd      LeadsPage
├── /leads/:id                 Any auth'd      LeadDetailPage
├── /customers                 Any auth'd      CustomersPage
├── /customers/:id             Any auth'd      CustomerDetailPage
├── /pipeline                  Any auth'd      PipelinePage
├── /followups                 Any auth'd      FollowUpsPage
├── /tasks                     Any auth'd      TasksPage
├── /users                     ADMIN only      UsersPage
└── * (404)                    Public          NotFoundPage
```

| Route | Page | Purpose | Access | Key Components | API Dependencies | Status |
|---|---|---|---|---|---|---|
| `/login` | LoginPage | Sign in | Public | inline form | `POST /auth/login` | Implemented |
| `/register` | RegisterPage | Self-serve sign-up (Sales Executive only) | Public | inline form | `POST /auth/register` | Implemented |
| `/` | DashboardPage | Stats, charts, upcoming follow-ups | Any authenticated | StatCard, RevenueChart, PipelineFunnelChart, SalesPerformanceTable, UpcomingFollowUps | `GET /dashboard/*` | Implemented |
| `/leads` | LeadsPage | List/search/filter/create leads | Any (scoped) | LeadTable, LeadForm (modal) | `GET/POST /leads` | Implemented |
| `/leads/:id` | LeadDetailPage | Lead detail, convert action, linked follow-ups/tasks | Any (scoped) | LeadForm, ConvertLeadButton, FollowUpList, TaskList | `GET/PUT /leads/:id`, `POST /leads/:id/convert` | Implemented |
| `/customers` | CustomersPage | List/search/create customers | Any (scoped) | CustomerTable, CustomerForm (modal) | `GET/POST /customers` | Implemented |
| `/customers/:id` | CustomerDetailPage | Profile, opportunities ("purchase history"), follow-ups, tasks | Any (scoped) | CustomerForm, opportunities list, FollowUpList, TaskList | `GET /customers/:id`, `GET /customers/:id/opportunities` | Implemented |
| `/pipeline` | PipelinePage | Kanban board across 7 stages | Any (scoped) | KanbanBoard, KanbanColumn, OpportunityCard | `GET /opportunities`, `PATCH /opportunities/:id/stage` | Implemented |
| `/followups` | FollowUpsPage | List/schedule/complete follow-ups | Any (scoped) | FollowUpForm, FollowUpList | `GET/POST /followups`, `PATCH /followups/:id/complete` | Implemented |
| `/tasks` | TasksPage | List/create/update tasks | Any (scoped) | TaskForm, TaskList | `GET/POST /tasks`, `PATCH /tasks/:id/status` | Implemented |
| `/users` | UsersPage | Manage user accounts | ADMIN only | inline table + form | `GET/POST/PUT/DELETE /users` | Implemented |
| `*` | NotFoundPage | 404 fallback | Public | — | — | Implemented |
