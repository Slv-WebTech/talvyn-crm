# QA Report — Talvyn CRM

Date: 2026-11-20 · Scope: live app (Chrome), API, business logic, performance, UX, tests.
Environment: local PostgreSQL 17, server on :5100, client (Vite dev) on :5273 (5000/5173 were occupied by other processes).

## Summary

~75 API/security checks and a live UI pass. **7 defects fixed**, **9 findings open** (none Critical). All QA data was removed from the database.

| Severity | Found | Fixed | Open |
|---|---|---|---|
| High | 2 | 2 | 0 |
| Medium | 6 | 4 (+3 in round 2) | see round 2 |
| Low | 8 | 1 (+7 in round 2) | see round 2 |

## Round 2 — remediation of the open findings

Every finding that was left open above has been triaged. Verified with `pnpm --filter server test` (15 pass, 1 skipped), `RUN_DB_TESTS=1` DB suite (10 pass), client lint (only the 2 pre-existing warnings) and build, plus live checks in Chrome.

| # | Finding | Sev | Status | Change / reason |
|---|---|---|---|---|
| 1 | Computed overdue/upcoming reminders keep the bell badge lit | Medium | **Fixed** | `notifications.service.js`: `unreadCount` counts persisted notifications only; reminders stay listed. DB test added. |
| 2 | Mobile tables only scroll sideways | Medium | **Fixed** | `useTableLabels` hook + CSS: under 600px tables become stacked label/value cards. Verified at 390px in Chrome (no horizontal overflow). |
| 3 | Admin can demote/deactivate self → no admin left | Low | **Fixed** | `users.service.js` `assertNotLastAdmin` (400 if it would leave zero active admins). DB test added. |
| 4 | Weak password policy (8 chars only) | Low | **Fixed** | Shared `passwordSchema`: 8–72 chars, letter + digit; used by register and admin user creation. Unit test added. Existing passwords are unaffected. |
| 5 | Rate limiter per-IP behind a proxy | Low | **Fixed** | New `TRUST_PROXY` env (hop count) sets Express `trust proxy`. A shared store for multi-instance deployments still needs infrastructure (Redis) — see "Not fixed". |
| 6 | Converting a lead onto another rep's existing customer | Low | **Fixed** | `convertLead`: non-elevated users get 409 if the matching customer is owned by someone else. DB test added. |
| 7 | Tap targets <32px, no skip link, static page titles | Low | **Fixed** | Skip link, per-route `document.title`, 44px minimum on touch devices, taller link hit areas. Verified live (title "Leads · Talvyn CRM", skip link present). |
| 8 | Kanban is pointer-only | Low | **Fixed (alternative)** | Each card has a "Move to stage" select (keyboard/touch). Verified live: choosing Negotiation persisted. Arrow-key dragging via dnd-kit's keyboard sensor was tried but does not reliably cross columns in this horizontally-scrolling layout, so it was not shipped. |
| 9 | Login form autofill / `autocomplete` hints | Low | **Fixed** | Email field now `autocomplete="username"` (password was already `current-password`). Chrome's saved-credential autofill on a shared profile is browser behaviour and cannot be fully prevented. |

### Not fixed — needs a product or infrastructure decision
- **JWT in `localStorage`, 7-day lifetime, no revocation (Medium):** moving to httpOnly cookies + refresh tokens also requires CSRF protection, same-site/domain configuration and a client auth rewrite. This is an architecture decision for the deployment model, not a surgical fix. Mitigations in place: strict CSP via `helmet`, no `dangerouslySetInnerHTML`, deactivation takes effect immediately.
- **Open registration / email enumeration via 409 (Medium):** a generic response is impossible while signup returns a session token; the real fix is email verification or invite-only signup (product decision). Mitigation: `ALLOW_REGISTRATION=false`, rate limiting.
- **Shared rate-limit store for multiple instances (Low):** needs Redis or similar infrastructure.
- **Pipeline/picker 100-row cap and trigram search indexes (Medium at scale):** needs UI pagination design and a DBA-approved `pg_trgm` migration; not a risk at current data volumes.
- **Audit writes outside the transaction (Low):** deliberate design (an audit failure must not block the business action); changing it is a trade-off decision.
- **Call-log UI and dashboard chart bundle size (Low):** feature work / optimisation rather than defects.

The sections below describe the state at the end of round 1; items marked Open there are resolved or triaged in the table above.

## 1. UI (desktop 1280 / tablet 768 / mobile 390, a11y)

Method note: Chrome window resize did not change the viewport, so widths were tested by loading each page in same-origin iframes at 390/768/1280 and measuring overflow, tap targets and labels. Pixel-level visual diffing was not performed (no baseline).

- **Pass:** no horizontal page overflow at any width; mobile gets an off-canvas nav (hamburger); modals are `role=dialog`, `aria-modal`, labelled, trap focus, close on Esc and return focus; `lang`, viewport meta, landmarks (`nav/header/main`), `:focus-visible` styles, no images without alt, one `h1` per page.
- **Fixed (Low):** search inputs had only a placeholder, no accessible name → `aria-label` added (`SearchBar.jsx`). Muted text (`#7a7a87`, 4.1:1 on card surfaces) raised to `#8b8b99` (≥4.5:1).
- **Open (Medium):** data tables on mobile just scroll sideways; Status/Created columns are off-screen with no cue. Consider a stacked-card layout under 600px.
- **Open (Low):** ~20 interactive elements per list page are under 32px (text links in table rows) — below the 44px touch guideline. No "skip to content" link. Static `<title>` on every route. Pipeline kanban is pointer-only (dnd-kit's keyboard sensor is not configured, no non-drag "move to stage" control).

## 2. API security & contracts

Executed against the live API with admin, manager, two executives and a deactivated user.

**Passed**
- All 36 endpoint/method combinations return 401 without a token; garbage and `alg=none` JWTs are rejected.
- Role matrix correct: `/users` (list: Admin+Manager, write: Admin only), `/audit-logs` (Admin+Manager), executives denied.
- Row-level access (BOLA/IDOR): executive B gets 403 on A's lead for GET/PUT/DELETE/convert, and cannot attach an opportunity/follow-up to A's records; lists are scoped.
- Mass assignment: registration ignores `role:"ADMIN"`; `id`/`status:"CONVERTED"` in create bodies are stripped.
- Injection: SQL-looking search strings are harmless (Prisma parameterised; raw SQL in the revenue trend uses bound parameters); object-typed fields rejected by zod; XSS payloads are stored verbatim but React escapes on output (no `dangerouslySetInnerHTML` anywhere).
- Responses never include `password`; audit logs are redacted.
- Deactivated users are rejected immediately (token and login). Admin cannot deactivate self.
- `helmet` headers present, no `X-Powered-By`; CORS rejects foreign origins; login/register rate limit returns 429 after 20 attempts per 15 min.

**Defects fixed**
1. **High — Broken access control:** a Sales Executive could `PUT /opportunities/:id {assignedToId}` and hand their deal to anyone (leads already blocked this). Now 403 for non-elevated roles.
2. **High — Malformed JSON / oversized body returned 500** (and logged a stack trace). Now 400 / 413 with a clean message (`errorHandler.js`).
3. **Medium — Foreign-key violations returned 500** (unknown `assignedToId`/`leadId`, deleting a customer that still has opportunities). `P2003` now maps to 409 with a safe message.

**Open**
- **Medium:** JWT in `localStorage`, 7-day lifetime, no refresh/revocation (a deactivation is the only kill switch). Move to httpOnly cookie + short-lived access token if internet-facing.
- **Medium:** `/auth/register` is open by default and reveals existing emails via 409. Set `ALLOW_REGISTRATION=false` in production; consider a generic response.
- **Low:** rate limiter is in-memory and per-IP (behind a proxy set `trust proxy`; use a shared store for multiple instances). No account lockout. Passwords only need 8 characters. No `Strict-Transport-Security` concern in dev, but verify at the proxy. FK errors (409) are generic — a 404/400 naming the missing relation would be friendlier.
- **Low:** an Admin can demote themselves (`PUT /users/:id {role}`), which could remove the last admin.

## 3. Business logic

Checked against intended behaviour in `docs/DECISIONS.md` / `FEATURES.md`.

- **Lead conversion** — pass: creates customer (deduped by email) + QUALIFIED opportunity + CONVERTED lead atomically; second call 409 with `customerId`; LOST lead 400; direct `status: CONVERTED` rejected; two simultaneous converts → exactly one 200, one 409, **one opportunity** (the row-claim guard works). Non-owner 403.
- **Fixed (Medium):** a CONVERTED lead could be set back to `NEW` via `PUT`, which re-opened it for a second conversion (duplicate opportunity). Converted leads are now frozen (400).
- **Pipeline stages** — pass: invalid stage 400, negative value 400, moving into WON/LOST sets `closedAt`, leaving clears it, value serialised as a number.
- **Fixed (Medium):** creating an opportunity directly as WON/LOST left `closedAt` null, so it vanished from monthly revenue/trend. Now set on create. **Fixed (Low):** re-saving WON→WON reset `closedAt` to "now"; original time is kept.
- **Audit logs** — create/update/delete are recorded for all modules including call logs; user passwords never appear; actions by deactivated users still attribute correctly. Gap (Low): audit writes are fire-and-forget outside transactions, so a failed audit insert is only logged to the console.
- **Notifications** — assignment, stage-change and conversion notifications reach the right user and only that user can mark them read. Correction to my earlier hand-over: overdue-task and upcoming-follow-up notifications are computed at read time (no scheduler needed). **Open (Medium, UX):** those computed items can never be marked read, so the bell badge can't reach 0 while a task is overdue.
- **Open (Low):** converting a lead whose email matches another rep's existing customer attaches the new opportunity to that customer without checking ownership.
- **Open (Low):** no lead→opportunity link back from the lead page after conversion; call logs have an API but no UI.

## 4. Performance

Local, single user, ~140 leads at peak (p50 of 8 requests): list endpoints 4–13 ms (`/leads?limit=100` 11 ms → 18 ms with 190 rows), dashboard summary 13 ms (max 99 ms cold), revenue trend 4 ms, notifications 5 ms, audit logs 5 ms. 60 parallel lead creates: 406 ms. No N+1 patterns found: services use `findMany`+`count` in parallel and grouped aggregates; the dashboard uses `groupBy` + one user lookup. Indexes exist on assignee/status/stage/date columns. Not covered: remote DB latency, large datasets (>10k rows), concurrent load tests.

Client: production build 846 KB total, entry chunk 287 KB (94 KB gz), Dashboard chunk 381 KB (109 KB gz, Recharts) — routes are lazy-loaded so only the dashboard pays for it. **Open (Low):** the dashboard chart bundle could be reduced by importing fewer Recharts parts. **Open (Medium at scale):** the kanban and pickers fetch at most 100 rows, with no pagination; list endpoints use `contains` ILIKE searches (no trigram index) which will slow down on large tables.

## 5. UX

- Flows tested end-to-end as Admin and Executive: login → add lead (assign to rep) → convert → follow-up → mark done → task → drag deal across stages → notifications → audit log. All worked without console errors or failed requests.
- Good: skeleton/loader states, toasts on actions, role-aware navigation (executives don't see Audit Log/Users), clear validation messages from the API.
- Friction (Low–Medium): Chrome password autofill overwrote the login fields when switching accounts (the form has no `autocomplete` hints — add `autocomplete="username"/"current-password"`); no "remember where you were" after a 401 redirect; no confirmation or undo feedback visible after a drag fails (verify the optimistic rollback toast); convert button gives no summary of what was created before navigating away; empty states are minimal.

## 6. Unit and integration tests

`pnpm --filter server test` → **14 pass, 1 skipped** (no database needed):
`ownership` (RBAC scoping), `http` (auth guards, validation, security headers, redaction, call-log/follow-up schemas), `errorHandler` (400/413/409/404/500 mapping).

`RUN_DB_TESTS=1 pnpm --filter server test` additionally runs a DB-backed regression suite (**7 pass**) that creates and removes its own `qa<timestamp>` users/records: malformed JSON, opportunity reassign 403, `closedAt` rules, FK errors, concurrent conversion producing exactly one opportunity, frozen converted lead, audit password redaction. Use a disposable database. Not covered: client component tests, browser E2E automation, load tests. A reusable full API probe script (~75 checks) was used for this pass but is not committed.

## 7. Recommendations (priority order)

1. **Auth hardening before any public deploy:** httpOnly cookie + short-lived token with refresh, `ALLOW_REGISTRATION=false`, shared-store rate limiter, `trust proxy`, stronger password policy. (Medium)
2. **Prevent last-admin lockout:** block self-demotion and deactivating the last active admin. (Medium)
3. **Notifications:** make computed (overdue/upcoming) items dismissible or exclude them from the unread badge. (Medium)
4. **Mobile tables:** card layout under 600px; raise tap targets to 44px; add keyboard sensor / "Move to…" menu on the kanban; skip-link and per-route titles. (Medium/Low)
5. **Scale:** server-side pagination for the pipeline board and pickers; trigram indexes for search. (Medium at scale)
6. **Add CI** running lint, build, unit tests and the DB suite against a throwaway Postgres; add Playwright smoke tests for login → convert → drag. (Medium)
7. **Ownership check when converting into an existing customer**, and wrap audit writes in the same transaction for mutations that must be auditable. (Low)
8. Add `autocomplete` attributes to auth forms; surface a call-log UI. (Low)

## Could not test / limitations

- Real viewport emulation and visual regression (iframe width simulation only; no pixel baseline).
- Real keyboard Tab-order walkthrough and screen-reader testing (inspected focus/ARIA programmatically instead).
- Real mouse drag on the kanban beyond the synthetic pointer sequence (the automation's single-jump drag does not trigger dnd-kit).
- Load/stress, production build served behind a proxy, HTTPS/HSTS, multi-instance rate limiting, email/SMS (none exist).
- Sales Manager role was exercised via API only, not in the UI.
