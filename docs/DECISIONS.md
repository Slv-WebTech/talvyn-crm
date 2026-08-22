# Decisions (ADR Log)

Newest first.

---

### Decision: Project name — Talvyn
**Date**: 2026-08-22
**Context**: Ahead of the initial public push to GitHub (`Slv-WebTech/talvyn-crm`), the project needed a real name — internally it had only ever been called "the CRM"/"CRM System". A first pick, "Aurora", was flagged as too generic/overused (a common name across unrelated SaaS, databases, and consumer products) rather than genuinely distinctive.
**Options considered**: (a) keep "Aurora"; (b) pick a short, real English word (e.g. "Slate", "Loop", "Arc"); (c) an invented, non-dictionary name, verified via web search to not collide with an existing product/company.
**Decision**: (c) — "Talvyn". Verified via web search to have no existing CRM, software, or company using this name (unlike several other candidates checked and rejected for direct collisions, e.g. "Corvane", "Vantora", "Orvexa").
**Reason**: (b) turned out to have a very high collision rate — nearly every short, attractive real word in this space is already claimed by an existing product (confirmed by search during this process). An invented word, checked rather than assumed clean, was the only reliable way to get something both attractive and genuinely not copied from another brand.
**Consequences**: Sidebar wordmark, `index.html` title, and both README files use "Talvyn"; the GitHub repo was renamed from `aurora-crm` to `talvyn-crm` (`gh repo rename`) and the local `origin` remote updated to match. Internal workspace package names (`client`/`server`/`crm-application` in `package.json`) were left unchanged — purely internal build-tooling identifiers, not user-facing branding.

---

### Decision: Wire delete UI for leads/customers/opportunities/tasks/follow-ups
**Date**: 2026-08-22
**Context**: Follow-up to the same day's UI/UX audit-and-polish pass, which had explicitly left this out of scope (see the entry below — its "left out of scope" note is now superseded by this one). The service-layer `deleteX` functions and backend `DELETE` routes already existed for all five entities, but no page rendered a delete button for any of them.
**Options considered**: (a) row-level delete actions in the list tables (`LeadTable`/`CustomerTable`) for every entity; (b) delete only from the detail page for Leads/Customers (where one exists), plus an icon button directly on the kanban card for Opportunities (which have no detail page), plus a row action in the shared `TaskList`/`FollowUpList` components (used both standalone and embedded in the Lead/Customer detail pages).
**Decision**: (b).
**Reason**: Keeping destructive actions off the list-table view and requiring a click into the record first is a deliberate, common CRM pattern that reduces accidental deletes; Opportunities have no detail page so the kanban card is the only sensible location; Tasks/Follow-ups are always shown as a row list (never a table), so a per-row action fits naturally there in every context they appear.
**Consequences**: `TaskList`/`FollowUpList` gained an optional `onDelete` prop (backward compatible — omitting it renders no delete button). `LeadDetailPage`/`CustomerDetailPage` each use one discriminated `deleteTarget = { kind, record } | null` state to drive a single `ConfirmDialog` across their entity-delete and embedded task/follow-up-delete flows, rather than three separate confirm-dialog states. `OpportunityCard` reuses the existing `onPointerDown` stopPropagation technique (already used by its "View customer" link) so the new delete icon doesn't get swallowed by the `@dnd-kit` drag sensor. Added a shared `.page-header-actions` CSS class (`layout.css`) for the two-button header row on both detail pages, replacing what two independent implementations had each done as an inline style.

---

### Decision: UI/UX audit-and-polish pass (accessibility, skeleton loading, mobile nav, searchable pickers)
**Date**: 2026-08-22
**Context**: User requested a full premium UI/UX transformation pass. A fresh audit found the 2026-08-17 dark redesign already solid, so the work targeted concrete, verified gaps instead of a re-skin: `ProtectedRoute` rendered a raw unstyled "Loading…" div (referencing a `.page-loader` class that was never defined) on every app boot; `Modal` had no focus trap, Escape handling, or ARIA dialog semantics; toasts had no icons, no `aria-live`, and popped out of existence with no exit animation (two of the four documented tones, warning/info, had no matching CSS at all); mobile nav below 768px was a cramped icon-only horizontal scroll strip; every list/dashboard/kanban/detail page blocked on a full-page spinner instead of a shaped loading state; routes weren't code-split (see `TECHNICAL_DEBT.md`); `OpportunityForm`'s customer picker and `LinkPicker`'s record picker were plain `<select>`s with no search (also already flagged in `TECHNICAL_DEBT.md`); and `ConfirmDialog` existed but was never actually wired into the one destructive action that needed it (Users page "Deactivate"), despite `PROJECT_STYLE.md` requiring confirmation for destructive actions.
**Options considered**: (a) another visual re-skin on top of the existing theme; (b) leave the design tokens/theme untouched and fix the specific gaps found.
**Decision**: (b).
**Reason**: The dark premium direction was already a deliberate, working choice from 2026-08-17 — replacing it again would be change for its own sake. The actual gap between this app and a "category-defining" product was in correctness/accessibility/perceived performance, not color or layout.
**Consequences**: New common components: `Skeleton.jsx` (`Skeleton`, `TableSkeleton`, `StatGridSkeleton`, `DashboardCardsSkeleton`, `KanbanSkeleton`, `RecordListSkeleton`, `DetailSkeleton`) and `Combobox.jsx` (searchable single-select, ARIA combobox/listbox pattern). `Modal` gained a focus trap, Escape-to-close, `role="dialog"`/`aria-modal`/`aria-labelledby`, and body-scroll lock; `ConfirmDialog` gained a `confirmLabel` prop. `ToastContext` toasts now carry a per-tone icon, a close affordance, an exit animation, and `role="status" aria-live="polite"`. Mobile nav is now a hamburger-triggered off-canvas drawer (desktop layout unchanged). `AppRoutes.jsx` now lazy-loads every page via `React.lazy`/`Suspense`. `index.css` now respects `prefers-reduced-motion` globally. Resolves two `TECHNICAL_DEBT.md` items (bundle code-splitting, customer-picker search) — see that file. Full delete-UI wiring for leads/customers/opportunities/tasks/follow-ups was initially left out of scope as a pre-existing functional gap; see the follow-up decision above — it was wired in later the same day.

---

### Decision: Dark premium visual redesign (Linear/Vercel-style)
**Date**: 2026-08-17
**Context**: The initial MVP UI was functional but visually plain (default light theme, no icons, system-ui font). The user asked for a "pleasant and premium UI, login to whole application."
**Options considered**: (a) clean light SaaS style (Stripe/Notion-like); (b) dark premium (Vercel/Linear-style — deep charcoal surfaces, glowing violet accent); (c) defer the choice entirely to Claude's judgment. Presented to the user as a choice; they picked (b).
**Decision**: Full dark theme — layered near-black surfaces (`--color-bg` → `--color-surface` → `--color-surface-2`), a violet/indigo accent (`--color-primary: #7c6ef2`) with soft glow shadows, Inter typeface (Google Fonts), and `lucide-react` for icon-led navigation and buttons throughout every page (login through dashboard, leads, customers, pipeline, follow-ups, tasks, users).
**Reason**: User's explicit choice between two concrete directions, not guessed.
**Consequences**: Every `styles/*.css` file and most page/component files touched. New dependency: `lucide-react`. Design tokens live in `styles/index.css` as CSS custom properties — a future light-mode/theme-toggle would extend this token set rather than replace it.

### Decision: Add a global baseline style for native `input`/`select`/`textarea`, not just wrapper-scoped rules
**Date**: 2026-08-17
**Context**: During the redesign's browser verification, two real bugs surfaced from CSS specificity conflicts: (1) the search bar's icon padding was silently overridden by the more-specific `.page-filters input` rule (search input is nested inside `.page-filters`), and (2) the Users page's role `<select>` and the task-status `<select>` (both bare, outside any styled wrapper) rendered with washed-out default browser styling since no rule targeted them at all.
**Options considered**: (a) keep patching each unstyled element's specific selector as found; (b) add a low-specificity global baseline (`input, select, textarea { background, border, color-scheme: dark }` in `index.css`) that every more-specific component rule naturally overrides.
**Decision**: (b), plus bumping the search bar's own selector to `.search-wrap .search-bar` so it reliably beats `.page-filters input` regardless of where it's used.
**Reason**: (a) only fixes what's been visually spotted — genuinely unstyled elements in front-end code are invisible until someone looks at that exact page. A global baseline closes the whole class of bug at once. `color-scheme: dark` also fixes native browser chrome (dropdown arrows, etc.) that CSS alone can't restyle.
**Consequences**: `styles/index.css` now sets baseline `input`/`select`/`textarea` styling; component-level rules in `components.css` still apply for refinement (padding, focus rings) since they're more specific.

---

### Decision: Add a minimal global toast system rather than duplicating inline error state
**Date**: 2026-08-14
**Context**: During the polish pass, several "quick action" handlers (completing a follow-up, changing a task's status, changing a user's role, deactivating a user) had no error handling — a failed request would produce an unhandled promise rejection with no user feedback. `PROJECT_STYLE.md` had already specified a "lightweight toast/banner component for success/error feedback" as the intended pattern.
**Decision**: Added `context/ToastContext.jsx` + `hooks/useToast.js` (a `showToast(message)` call, auto-dismissing after 5s, rendered in a fixed-position stack) and wired it into the 6 fire-and-forget handlers across `LeadDetailPage`, `CustomerDetailPage`, `FollowUpsPage`, `TasksPage`, and `UsersPage`.
**Reason**: Matches the already-documented design intent; a shared component was more proportionate than duplicating try/catch + inline error state six times.
**Consequences**: `App.jsx` now wraps the tree in `ToastProvider`. Form-level errors still use the existing inline `.form-error` pattern (better fit for validation feedback tied to a specific field); the toast is reserved for actions with no adjacent form.

---

### Decision: Fix Express 5's read-only `req.query` in the validation middleware
**Date**: 2026-08-14
**Context**: End-to-end testing (`GET /leads`, and every other list endpoint) returned 500 with `TypeError: Cannot set property query of #<IncomingMessage> which has only a getter`. Express 5 changed `req.query` to a getter-only accessor (unlike Express 4, where it was a plain writable property) — `middleware/validate.js`'s `req.query = result.data` assignment, which worked in Express 4-era examples the pattern was based on, throws under Express 5.
**Options considered**: (a) store validated query data on a new property (`req.validatedQuery`) and update every controller that reads query params; (b) redefine `req.query` as an own, writable, configurable property via `Object.defineProperty`, shadowing the inherited getter.
**Decision**: (b).
**Reason**: Zero changes needed to any controller — they keep reading `req.query` exactly as before. This is the standard workaround for this specific, well-known Express 5 compatibility gap.
**Consequences**: None beyond the one-line fix in `validate.js`. Caught by the end-to-end verification pass, not by `node --check` or the build (both are purely syntactic and can't catch a runtime property-descriptor conflict like this).

---

### Decision: Pin Prisma to major version 6, not the latest 7
**Date**: 2026-08-14
**Context**: `pnpm add prisma @prisma/client` resolved to 7.9.1 by default. Prisma 7 changes the default generator from `prisma-client-js` to a new `prisma-client` generator that outputs into a custom project folder, defaults to the driver-adapter pattern (`@prisma/adapter-pg` + `pg`, constructing `PrismaClient` with an explicit `adapter` instead of relying on `datasource url` alone), and moves CLI datasource config into a separate `prisma.config.ts`/`.js` file.
**Options considered**: (a) adopt Prisma 7's new adapter-based architecture; (b) pin to Prisma 6, keeping the classic `prisma-client-js` generator + `datasource db { url = env("DATABASE_URL") }` + plain `new PrismaClient()`.
**Decision**: (b).
**Reason**: The v7 pattern is materially different and newer than what's well-established in the plan and in general Prisma documentation at the time of this build; adopting it correctly would need `@prisma/adapter-pg`/`pg` as extra dependencies not in the original design and introduces more surface area for subtle mistakes (generated output path, exact import path, config file resolution) for no MVP benefit. Prisma 6 confirmed working with the traditional Node-API query engine binary already present after install.
**Consequences**: `server/package.json` pins `"prisma": "^6.19.3"` and `"@prisma/client": "^6.19.3"` rather than accepting whatever `^7` would float to. Revisit if a future need (e.g. edge/serverless deployment) specifically requires driver adapters.

---

### Decision: Adopt a documentation-first development protocol
**Date**: 2026-08-14
**Context**: Before any feature work began, the project owner specified a standing process requiring a maintained `/docs` knowledge base, honest status tracking, and a plan→implement→verify→document cycle for every future feature.
**Options considered**: (a) build first, document later; (b) lightweight README only; (c) full structured `/docs` suite maintained continuously.
**Decision**: (c) — full suite, created at Phase 0 before any code, updated at every build step.
**Reason**: Keeps the project resumable by another developer/AI without re-reading the whole codebase or conversation history, and forces honesty about what's actually built vs. planned.
**Consequences**: Every build step now carries a documentation-sync overhead. Worth it for a project explicitly designed to be portfolio/interview-ready and resumable.

---

### Decision: Core MVP scope cut
**Date**: 2026-08-14
**Context**: The original spec includes report export (PDF/Excel), notifications, and ~10 "bonus" features (AI scoring, WhatsApp/SMS, PWA, CI/CD, audit logs, etc.) alongside the core CRM workflow.
**Options considered**: (a) build everything in one pass; (b) core workflow first, defer the rest.
**Decision**: (b).
**Reason**: The full list is enterprise-scope; attempting it all at once risks a large amount of half-finished work. A working core (auth, leads, customers, pipeline, follow-ups, tasks, dashboard) is a complete, demonstrable product on its own.
**Consequences**: `FUTURE_FEATURES.md` tracks the deferred list so it isn't lost, just sequenced later.

---

### Decision: PostgreSQL over MongoDB
**Date**: 2026-08-14
**Context**: Spec allowed either. Local Postgres 17 was already installed and running; no local MongoDB.
**Options considered**: PostgreSQL + Prisma vs. MongoDB + Mongoose.
**Decision**: PostgreSQL + Prisma.
**Reason**: The data is inherently relational (Users, Customers, Leads, Opportunities, FollowUps, Tasks all reference each other), and dashboard/reporting requirements (revenue by month, sales performance by rep, pipeline funnel) are join/aggregate-heavy — a better fit for SQL than a document store. Local Postgres was also already available, avoiding an extra install.
**Consequences**: Requires a real DB password for migrations (see `PROJECT_PLAN.md` Blocked). Schema changes require migrations rather than being schema-less.

---

### Decision: Plain JavaScript (ESM), no TypeScript
**Date**: 2026-08-14
**Context**: The source spec lists HTML5/CSS3/JavaScript/React — no TypeScript mentioned.
**Decision**: Plain `.js`/`.jsx`, ES modules, no build-time type checking.
**Reason**: Matches the stated stack, avoids adding a compilation step, keeps the project approachable.
**Consequences**: No compile-time type safety — relies on `zod` request validation at the API boundary and disciplined manual review instead.

---

### Decision: pnpm workspace (client + server monorepo)
**Date**: 2026-08-14
**Reason**: Single `pnpm install`/`pnpm dev` for both halves of the app; user already has a pnpm store in active use on this machine.
**Consequences**: `pnpm-workspace.yaml` at the root; scripts use `pnpm --filter`.

---

### Decision: JWT in Authorization header, not cookies
**Date**: 2026-08-14
**Context**: Dev setup runs client (Vite, :5173) and server (Express, :5000) as separate processes, proxied together in dev.
**Decision**: Client stores the JWT (in `localStorage` via `AuthContext`) and sends it as `Authorization: Bearer <token>`, rather than the server setting an httpOnly cookie.
**Reason**: Avoids CORS/credentials complexity for a two-port local setup; standard pattern for this project shape.
**Consequences**: Token is readable by JS on the client (XSS risk if the app has an XSS hole) — acceptable tradeoff for this MVP; would reconsider for a production-hardened deployment.

---

### Decision: `@dnd-kit` for the pipeline kanban board
**Date**: 2026-08-14
**Context**: Needed drag-and-drop for moving Opportunities between pipeline stages.
**Options considered**: `react-beautiful-dnd` (the historically popular choice) vs. `@dnd-kit`.
**Decision**: `@dnd-kit`.
**Reason**: `react-beautiful-dnd` is deprecated/unmaintained; `@dnd-kit` is the actively maintained modern equivalent.

---

### Decision: No git commits made by the implementing agent
**Date**: 2026-08-14
**Context**: `D:\crm-application` is empty, but its git repository root is `D:\` itself — the whole drive, including unrelated personal files (resumes, other projects, etc.).
**Decision**: Write files only; no `git add`/`git commit` run as part of this build.
**Reason**: Committing would operate on a repo scoped to the entire D: drive, risking entangling this project's history with unrelated personal content.
**Consequences**: The user is responsible for git operations on this project (e.g. running `git init` inside `crm-application` if they want an isolated repo, per the option they were offered).
