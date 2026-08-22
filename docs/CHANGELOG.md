# Changelog

## 2026-08-14
- Project initiated. Requirements and architecture confirmed with user (stack: React/Vite + Express + PostgreSQL/Prisma; scope: Core MVP first; package manager: pnpm; language: plain JS).
- Documentation-first protocol adopted; `/docs` baseline suite created (this changelog included) reflecting the true greenfield state — no code written yet.
- pnpm workspace scaffolded (`client/` via Vite+React 19, `server/` hand-built). Prisma pinned to v6 after the default install resolved to v7's incompatible driver-adapter architecture (see `DECISIONS.md`).
- Full Prisma schema authored (User, Lead, Customer, Opportunity, FollowUp, Task) and migrated (`crm_db`, migration `20260814135645_init`).
- Backend built: auth (register/login/me, JWT+bcryptjs), RBAC + row-level ownership scoping middleware, and full CRUD modules for users, customers, leads (with duplicate prevention), the lead→customer/opportunity convert transaction, opportunities (with the kanban stage-PATCH endpoint), follow-ups, tasks, and dashboard aggregates (summary/upcoming-followups/revenue-trend).
- Frontend built: auth context + protected routing, layout shell, and full pages for leads, customers (list + detail with linked follow-ups/tasks/opportunities), the `@dnd-kit` pipeline kanban board, follow-ups, tasks, dashboard (Recharts), and admin user management.
- Bug found and fixed during end-to-end testing: Express 5 made `req.query` a getter-only property, breaking every list endpoint's query validation (`middleware/validate.js`) — see `DECISIONS.md`.
- Added a minimal global toast system (`ToastContext`/`useToast`) and wired it into the follow-up/task/user quick-action handlers that previously had no error feedback.
- Full manual verification pass completed: backend walkthrough via curl (auth, RBAC scoping, duplicate-lead 409, convert-lead + idempotency, pipeline stage transitions with `closedAt` handling, follow-up/task CRUD, dashboard aggregates for both scoped and elevated roles) and a live browser walkthrough (login, dashboard, leads, real `@dnd-kit` drag-and-drop on the pipeline board verified to persist across a refresh, customer detail, user management). See `IMPLEMENTED_FEATURES.md` for the full verified list.
- Core MVP complete and working end-to-end.

## 2026-08-17
- Resumed after a multi-day gap; confirmed `crm_db` data and both dev servers still functional (Postgres data persists independent of process lifecycle; a transient first-login network hiccup after the idle gap resolved itself on retry — not a code issue).
- Full visual redesign: dark premium theme (Linear/Vercel-style), chosen by the user from two directions (see `DECISIONS.md`). Added `lucide-react` for icon-led navigation/buttons and the Inter typeface. Every page touched — login/register, layout shell, dashboard (charts restyled for dark mode with a gradient revenue area chart and semantic Won/Lost bar coloring), leads, customers, pipeline kanban, follow-ups, tasks, users.
- Found and fixed two real CSS bugs during live-browser verification of the redesign: (1) the search bar's icon padding was silently overridden by a higher-specificity `.page-filters input` rule; (2) the Users-page role `<select>` and task-status `<select>` rendered unstyled (washed out) since they sat outside any styled wrapper. Fixed with a targeted specificity bump and a new global baseline style for native form controls respectively — see `DECISIONS.md`.
- Re-verified drag-and-drop on the redesigned kanban board still functions correctly (same realistic pointer-event simulation approach as the original build).
- Completed the redesign verification sweep across every remaining page (register, customers list, follow-ups, tasks, lead detail, 404). Found the 404 page visually inconsistent with the rest (unstyled, top-left, no card) and gave it a matching centered-card treatment with an icon, reusing the auth-page pattern.
- `pnpm build` clean throughout (2494 modules, ~740kB bundle — icon tree-shaking confirmed working, bundle size barely moved despite adding a large icon library).

## 2026-08-22
- Full UI/UX audit against a "premium product" bar; found the 2026-08-17 dark redesign already solid, so this pass fixed concrete, verified gaps rather than re-skinning.
- Fixed a real bug: `ProtectedRoute` showed a completely unstyled "Loading…" div on every app boot/refresh (referenced a `.page-loader` CSS class that was never defined) — now uses the existing `Loader` component, full-page centered.
- `Modal` (and by extension `ConfirmDialog`, and every create/edit form) gained a focus trap, Escape-to-close, `role="dialog"`/`aria-modal`/`aria-labelledby`, and body-scroll lock while open, with focus restored to the trigger on close.
- Toast notifications gained a per-tone icon (including warning/info tones, which previously had no matching CSS despite being valid), an explicit close affordance, a fade/slide exit animation, and an `aria-live="polite"` region.
- Replaced blocking full-page `<Loader/>` spinners with new shape-matched skeleton screens (`components/common/Skeleton.jsx`: `TableSkeleton`, `StatGridSkeleton`, `DashboardCardsSkeleton`, `KanbanSkeleton`, `RecordListSkeleton`, `DetailSkeleton`) across the dashboard, leads, customers, tasks, follow-ups, users, pipeline, and both detail pages; page headers now render immediately where they don't depend on the loading data.
- Mobile navigation (below 768px) replaced: was a cramped icon-only horizontal scroll strip, now a hamburger-triggered off-canvas drawer with full labels, backdrop, and Escape/backdrop-click/route-change-to-close. Desktop layout unchanged.
- Added a new `Combobox` common component (searchable single-select, ARIA combobox/listbox pattern) and used it to replace `OpportunityForm`'s customer picker and `LinkPicker`'s record picker — resolves the corresponding `TECHNICAL_DEBT.md` item. All other fixed-enum `<select>` fields left as plain selects, unchanged.
- Wired the previously-unused `ConfirmDialog` component into the Users page's "Deactivate" action, which had no confirmation despite `PROJECT_STYLE.md` requiring one for destructive actions; `ConfirmDialog` gained a `confirmLabel` prop.
- Routes now code-split via `React.lazy`/`Suspense` in `AppRoutes.jsx` — resolves the `TECHNICAL_DEBT.md` bundle-size item.
- Added global `prefers-reduced-motion` support and an `.sr-only` utility in `index.css`.
- Wired delete UI for leads, customers, opportunities, tasks, and follow-ups — the service-layer `deleteX` functions and backend routes already existed, but nothing in the UI called them until now. Lead/Customer detail pages got a header "Delete" button (with `ConfirmDialog`, navigating back to the list on success); `TaskList`/`FollowUpList` got an optional `onDelete` prop wired into the standalone Tasks/Follow-ups pages and both detail pages' embedded lists; kanban `OpportunityCard`s got a small icon delete button.
- See `DECISIONS.md` for the full rationale.
