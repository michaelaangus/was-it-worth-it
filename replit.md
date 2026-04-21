# Workspace

## Overview

**Was It Worth It?** — a reflection-based discretionary spending tracker for college students and early-career young adults. Users log purchases, wait through a configurable reflection window (default 14 days), then evaluate whether each purchase was Worth It / Not Worth It / Uncertain, and review category-level satisfaction patterns over time.

Built as a pnpm workspace monorepo using TypeScript.

## Artifacts

- `artifacts/was-it-worth-it` — React + Vite frontend at `/` (landing page) and `/app/*` (product). Bold dark UI per the prototype prompt.
- `artifacts/api-server` — Express 5 API at `/api` (purchases, reflections, dashboard, insights, profile).
- `artifacts/mockup-sandbox` — design sandbox (not deployed).

## Database

Postgres on **Supabase** (external). Connection string is in the `SUPABASE_DATABASE_URL` secret. `lib/db` falls back to it when `DATABASE_URL` isn't set. Schema lives in `lib/db/src/schema/` (purchases, reflections, profile). Push schema with `pnpm --filter @workspace/db run push`. Seed sample data with `pnpm --filter @workspace/scripts run seed`.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
