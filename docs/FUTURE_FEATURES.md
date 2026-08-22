# Future Features (Phase 2 — not built in the current MVP pass)

## High Priority
- **PDF/Excel report export** — sales performance, lead conversion rate, employee performance, revenue, customer growth reports, exportable. *Complexity*: moderate (a PDF lib like `pdfkit` + an Excel lib like `exceljs`, plus report-query design). *Dependency*: Dashboard aggregates (already built by then). *Risk*: report query performance at scale if not indexed carefully.
- **Notifications** — in-app alerts for upcoming follow-ups, new lead assignments, deal status changes, overdue tasks. *Complexity*: moderate for in-app (polling or a notifications table + bell icon); higher for real-time (would need WebSockets/SSE). *Dependency*: existing FollowUp/Task/Opportunity models. *Risk*: real-time transport choice affects deployment (stateful connections vs. serverless).
- **Automated tests** — unit + integration coverage for the RBAC/ownership pattern and the convert-lead transaction especially. *Complexity*: low-moderate to start. *Risk of not having it*: regressions in the ownership-scoping logic are the highest-consequence bug class in this app (data leaking across reps).

## Medium Priority
- **Email integration** — send/log emails against a lead/customer.
- **Call logging** — record call outcomes distinct from generic FollowUp notes.
- **Google Calendar integration** — sync follow-ups to an external calendar.
- **Audit logs** — who changed what, when — valuable once multiple reps share data daily.
- **CI/CD pipeline (GitHub Actions)** — becomes relevant once there's a deployment target and a git workflow (see `DECISIONS.md` re: current repo situation).

## Low Priority
- **WhatsApp/SMS integration**
- **Built-in team chat**
- **Light mode / theme toggle** — the app shipped dark-only on 2026-08-17 (user's explicit choice between two directions, see `DECISIONS.md`). The design tokens in `styles/index.css` are organized to make a second theme additive rather than a rewrite, but no toggle exists yet.
- **Progressive Web App (PWA) support**

## Experimental
- **AI lead scoring** — needs a labeled dataset of won/lost outcomes before it could be meaningfully predictive; premature until there's real usage data.
- **Predictive sales analytics / forecasting** — same dependency on accumulated real data.
- **Multi-tenant support** — significant architectural change (every model would need a tenant/org FK and every query scoped by it); only worth it if the product direction shifts from single-org to multi-customer SaaS.

None of the above are implemented; do not build them without an explicit request, per project process.
