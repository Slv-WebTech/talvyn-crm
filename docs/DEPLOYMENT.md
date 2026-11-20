# Deployment

## Current Status
Not deployed. Local development only.

## Local Environment
- Node v24.13.0+, pnpm 10+
- PostgreSQL 17, local instance on `localhost:5432`, database `crm_db`
- `server/.env` — see `server/.env.example` for required keys (`DATABASE_URL` and `JWT_SECRET` are required; also `JWT_EXPIRES_IN`, `PORT`, `CLIENT_URL`, `ALLOW_REGISTRATION`, `TRUST_PROXY` (set to the proxy hop count when behind a reverse proxy), `NODE_ENV`)
- `pnpm install` at the repo root, then `pnpm dev` runs client (`:5173`) and server (`:5000`) together

## Target Deployment (per original project spec — not yet executed)
- **Frontend**: Vercel
- **Backend**: Render or Railway
- **Database**: managed PostgreSQL (e.g. Render Postgres, Supabase, or Neon) rather than local

## Not Yet Decided
- Exact managed Postgres provider
- Environment/secrets management approach for production `JWT_SECRET`/`DATABASE_URL`
- Continuous deployment (a CI workflow for lint/test/build exists in `.github/workflows/ci.yml`; no deploy job)

This file will be updated with real steps once a deployment is actually attempted — not written speculatively beyond the target platform choice already implied by the original spec.
