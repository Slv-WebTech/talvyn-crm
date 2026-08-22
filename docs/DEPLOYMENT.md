# Deployment

## Current Status
Not deployed. Local development only.

## Local Environment
- Node v24.13.0+, pnpm 10+
- PostgreSQL 17, local instance on `localhost:5432`, database `crm_db`
- `server/.env` — see `server/.env.example` for required keys (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CLIENT_URL`)
- `pnpm install` at the repo root, then `pnpm dev` runs client (`:5173`) and server (`:5000`) together

## Target Deployment (per original project spec — not yet executed)
- **Frontend**: Vercel
- **Backend**: Render or Railway
- **Database**: managed PostgreSQL (e.g. Render Postgres, Supabase, or Neon) rather than local

## Not Yet Decided
- Exact managed Postgres provider
- Environment/secrets management approach for production `JWT_SECRET`/`DATABASE_URL`
- CI/CD pipeline (deferred — see `FUTURE_FEATURES.md`)

This file will be updated with real steps once a deployment is actually attempted — not written speculatively beyond the target platform choice already implied by the original spec.
