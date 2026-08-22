# Implemented Features

Everything below exists in real code and was verified working — either via a live curl walkthrough against the running server, a live browser walkthrough, or both. Core MVP verified 2026-08-14; the visual redesign verified 2026-08-17. Nothing here is claimed on the strength of a plan alone.

## UI/UX Audit & Polish Pass (2026-08-22)
- **Where**: `client/src/components/common/Modal.jsx`, `ConfirmDialog.jsx`, `Skeleton.jsx` (new), `Combobox.jsx` (new), `context/ToastContext.jsx`, `routes/ProtectedRoute.jsx`, `routes/AppRoutes.jsx`, `components/layout/{AppLayout,Sidebar,Topbar}.jsx`, `pages/UsersPage.jsx`, `components/pipeline/OpportunityForm.jsx`, `components/common/LinkPicker.jsx`, `styles/*.css`.
- **What**: focus-trapped, ARIA-compliant `Modal` with Escape-to-close and body-scroll lock; toast notifications with per-tone icons, an exit animation, and `aria-live`; a new `Skeleton` family replacing blocking spinners on the dashboard, leads, customers, tasks, follow-ups, users, pipeline, and both detail pages; a new `Combobox` searchable picker replacing the plain customer/record `<select>`s; a hamburger-triggered off-canvas mobile nav drawer; route-based code-splitting (`React.lazy`/`Suspense`); `ConfirmDialog` wired into the Users page's Deactivate action; global `prefers-reduced-motion` support; the unstyled `ProtectedRoute` loading state fixed.
- **Verified**: `pnpm lint` clean and `pnpm build` succeeds with the expected per-route chunk splitting (confirmed `DashboardPage`/`PipelinePage` split into their own chunks, main bundle down from the prior monolith). A live-browser click-through walkthrough of this pass had not been logged as of this doc update — per this project's own verification convention, update this entry once that walkthrough runs.

## Delete UI for Leads/Customers/Opportunities/Tasks/Follow-ups (2026-08-22)
- **Where**: `client/src/pages/LeadDetailPage.jsx`, `CustomerDetailPage.jsx`, `TasksPage.jsx`, `FollowUpsPage.jsx`, `PipelinePage.jsx`, `components/tasks/TaskList.jsx`, `components/followups/FollowUpList.jsx`, `components/pipeline/{OpportunityCard,KanbanColumn,KanbanBoard}.jsx`, `styles/{layout,pipeline}.css`.
- **What**: the service-layer `deleteX` functions (and backend `DELETE` routes) for all five entities already existed but nothing in the UI called them. Added: a danger "Delete" button on the Lead/Customer detail page header (confirms via `ConfirmDialog`, then navigates back to the list on success); an optional `onDelete` prop on `TaskList`/`FollowUpList` rendering a small danger delete button per row, wired on the standalone Tasks/Follow-ups pages and inside both detail pages' embedded lists; a small icon-only delete button on each kanban `OpportunityCard` (using the same `onPointerDown` stopPropagation technique as the card's existing "View customer" link, so it doesn't get swallowed by the drag sensor). Leads/customers deliberately only get a delete affordance on their detail page, not a row action in the list table — a scoped, low-risk decision to keep destructive actions off the list view.
- **Verified**: `pnpm lint` and `pnpm build` clean after this change. Live-browser click-through not yet logged as of this doc update.

## Dark Premium UI Redesign (2026-08-17)
- **Where**: `client/src/styles/*.css` (all 5 files), `client/index.html` (Inter font), every page and most components (icon integration)
- **Verified**: visually confirmed live in-browser across **every page in the app** — login, register, dashboard, leads (list + detail), customers (list + detail), pipeline (including a real drag-and-drop re-test), follow-ups, tasks, user management, and the 404 page. Three real CSS bugs found and fixed across two verification passes: search bar padding overridden by a higher-specificity rule; unstyled native `<select>` elements outside styled wrappers; the 404 page had no dark-theme styling applied at all (found on the second, full-sweep pass) — see `DECISIONS.md` and `CHANGELOG.md` for all three.
- **Limitations**: dark theme only, no light-mode toggle (was an explicit user choice, not an oversight — see `DECISIONS.md`).

## Authentication & RBAC
- **Where**: `server/src/modules/auth/`, `server/src/middleware/auth.js`, `client/src/context/AuthContext.jsx`
- **Verified**: register (auto-assigns `SALES_EXECUTIVE`), login, `/auth/me` session rehydration, JWT re-validates the user from the DB on every request. Role gate confirmed: a Sales Executive gets `403` on `GET /users`; an Admin gets `200`.
- **Limitations**: no rate limiting on login/register (see `TECHNICAL_DEBT.md`).

## User Management (Admin)
- **Where**: `server/src/modules/users/`, `client/src/pages/UsersPage.jsx`
- **Verified**: Admin can list users, create a user with any role, change a user's role inline, and deactivate a user (soft delete via `isActive=false`). Confirmed live in-browser.

## Lead Management + Duplicate Prevention
- **Where**: `server/src/modules/leads/`, `client/src/pages/LeadsPage.jsx` / `LeadDetailPage.jsx`
- **Verified**: create/list/search/filter/update/delete. Duplicate prevention confirmed both case-sensitive-looking and case-insensitive (`Acme Corp` vs `ACME CORP` + differently-cased email) — both correctly return `409`.

## Customer Management
- **Where**: `server/src/modules/customers/`, `client/src/pages/CustomersPage.jsx` / `CustomerDetailPage.jsx`
- **Verified**: create/list/search/update/delete, ownership scoping. Customer detail page confirmed showing profile fields and linked opportunities ("purchase history").

## Convert Lead
- **Where**: `server/src/modules/leads/leads.service.js` (`convertLead`), `client/src/components/leads/ConvertLeadButton.jsx`
- **Verified**: converting a lead creates a Customer + an Opportunity at `QUALIFIED` stage, marks the Lead `CONVERTED`. Converting the same lead a second time correctly returns `409` with the existing `customerId` and creates no duplicate rows. Confirmed the resulting Customer/Opportunity appear correctly in both the API response and the live UI.

## Sales Pipeline (Kanban)
- **Where**: `server/src/modules/opportunities/`, `client/src/components/pipeline/`, `client/src/pages/PipelinePage.jsx`
- **Verified**: all 7 stages render as columns; `PATCH /opportunities/:id/stage` walked through `PROPOSAL_SENT → NEGOTIATION → WON` via curl, confirming `closedAt` gets set on entering `WON`. **Real drag-and-drop verified in a live browser** — dragging a card between columns updates its stage and the change persists across a full page reload. (Automated single-jump synthetic drags didn't trigger `@dnd-kit`'s pointer sensor — verified instead with a realistic simulated pointer-event sequence; this is a testing-tool limitation, not an app bug, confirmed by the identical successful outcome both times the interaction was tested this way.)

## Follow-up Management
- **Where**: `server/src/modules/followups/`, `client/src/components/followups/`, `client/src/pages/FollowUpsPage.jsx`
- **Verified**: scheduling a follow-up linked to a lead/customer/opportunity, the "must link to at least one" validation (confirmed `400` on an unlinked attempt), marking complete, and the dashboard's upcoming-follow-ups widget correctly showing/clearing it.

## Task Management
- **Where**: `server/src/modules/tasks/`, `client/src/components/tasks/`, `client/src/pages/TasksPage.jsx`
- **Verified**: create/list/filter/status-cycle. Confirmed a Sales Executive gets `403` attempting to assign a task to someone else.

## Dashboard
- **Where**: `server/src/modules/dashboard/`, `client/src/pages/DashboardPage.jsx`
- **Verified**: `totalCustomers`, `totalLeads`, `dealsWon`, `dealsLost`, `monthlyRevenue`, `pipelineByStage`, and `salesPerformance` all confirmed correct against manually-tallied test data, for both a scoped Sales Executive view and the team-wide Admin view. Revenue trend chart (raw SQL month-truncation query) confirmed returning the correct month/value. All three Recharts visualizations (line, bar, table) render correctly in-browser.

## Cross-cutting
- Row-level ownership scoping (`utils/ownership.js`) confirmed correctly gating access across leads, customers, opportunities, follow-ups, and tasks for a Sales Executive vs. Admin/Sales Manager.
- Global error handling (`ApiError`/`asyncHandler`/`errorHandler`) confirmed mapping Prisma `P2002`→409 and validation failures→400 with field-level detail.
- Toast notifications for quick actions (follow-up complete, task/user status changes) — added during the polish pass.

## Known Gaps (not bugs, deliberately out of scope for this build)
See `FUTURE_FEATURES.md`: report export, notifications system, and all bonus features. See `TECHNICAL_DEBT.md` for confirmed limitations within what was built.
