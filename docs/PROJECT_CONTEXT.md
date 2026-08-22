# Project Context

## Purpose
A CRM system that lets a sales organization manage customers, leads, sales opportunities, follow-ups, and tasks in one place, with a role-scoped dashboard for visibility into pipeline and performance.

## Problem Being Solved
Sales teams need a shared system of record for leads and customers instead of spreadsheets or scattered notes — one that enforces who can see/edit what, tracks a lead through to a won or lost deal, and surfaces what needs attention (follow-ups, tasks) without manual tracking.

## Target Users
Three roles, increasing in scope:
- **Sales Executive** — manages only the leads/customers/opportunities/tasks assigned to them.
- **Sales Manager** — sees and manages everything across the team, same as Admin minus user administration.
- **Admin** — full access, plus user account management (creating Managers/Executives, deactivating accounts).

## Current Project Status
Greenfield — build started 2026-08-14. See `PROJECT_PLAN.md` for the live roadmap and `DEV_CONTEXT.md` for the exact current step.

## Technology Stack
- **Frontend**: React 18 (Vite), React Router, axios, `@dnd-kit` (drag-and-drop pipeline), Recharts (dashboard charts), hand-written CSS.
- **Backend**: Node.js (ESM, plain JavaScript — no TypeScript), Express.
- **Database**: PostgreSQL, accessed via Prisma ORM.
- **Auth**: JWT (`jsonwebtoken`) + `bcryptjs`, Bearer-token header (not cookies).
- **Package manager**: pnpm, workspace with `client/` and `server/`.

## Major Architectural Decisions
See `DECISIONS.md` for the full ADR log. Headline choices: PostgreSQL over MongoDB (relational fit for customers/leads/deals/reporting joins), pnpm workspace monorepo, plain JS over TypeScript, JWT-in-header over cookie sessions, `@dnd-kit` over the unmaintained `react-beautiful-dnd`.

## Important Constraints
- Local development only for now — no deployment has happened yet.
- This build is scoped to the **Core MVP**: auth/RBAC, leads, customers, sales pipeline, follow-ups, tasks, dashboard. PDF/Excel report export, notifications, and all "bonus" features (AI lead scoring, WhatsApp/SMS/email integration, PWA, CI/CD, audit logs, automated tests) are explicitly out of scope for this phase — see `FUTURE_FEATURES.md`.
- The project's git repository root is `D:\` (the whole drive), not this project folder — by design, no git commands are run as part of this build; files are written directly.

## Assumptions
- A single local PostgreSQL instance is available at `localhost:5432`; the `crm_db` database is created as part of setup.
- Single-tenant: all data belongs to one organization, no multi-tenant isolation.

## Important Terminology
- **Lead** — an unqualified/early-stage contact captured with name, company, email, phone, source, status. Not yet a customer.
- **Customer** — a real contact/account, created either by converting a Lead or added directly.
- **Opportunity** (aka "deal") — a sales pipeline entity tied to a Customer, tracked through 7 stages (New Lead → Contacted → Qualified → Proposal Sent → Negotiation → Won/Lost). Distinct from Lead — see `ARCHITECTURE.md` for how the two relate via the Convert Lead action.
- **Follow-up** — a scheduled call/meeting/reminder tied to a lead, customer, and/or opportunity.
- **Task** — an actionable to-do (e.g. "Send Proposal") assigned to a user, optionally linked to a lead/customer/opportunity.
