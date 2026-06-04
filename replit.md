# EthioBiz

Multilingual business discovery platform for Ethiopia — search, browse, and connect with Ethiopian businesses in English, Amharic (አማርኛ), and Afaan Oromoo.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — cookie signing

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + shadcn/ui (at `/`)
- API: Express 5 (at `/api`)
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB schema (users, categories, businesses, claims, ads)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — generated React Query hooks + Zod schemas
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/ethiobiz/src/pages/` — React pages
- `artifacts/ethiobiz/src/lib/i18n.tsx` — translation context (EN/AM/ORM)
- `artifacts/ethiobiz/src/components/layout.tsx` — nav + footer wrapper

## Architecture decisions

- **Contract-first API**: OpenAPI spec in `lib/api-spec`, Orval generates typed React Query hooks. Never write manual fetch calls in the frontend.
- **Drizzle `inArray()` for array lookups**: Never use `sql\`col = ANY(ARRAY[...])\`` with node-postgres driver — it fails. Always use `inArray(col, ids)` from drizzle-orm.
- **Cookie-based sessions**: Signed JSON cookies (`session` cookie) using `cookie-parser`. Admin login at `/api/auth/login` with `{ email, password }`.
- **Multilingual fields**: DB stores `name_en`, `name_am`, `name_orm`. Frontend uses `getLocalizedField(obj, 'name', language)` helper to pick the right one.
- **i18n hook**: `useI18n()` returns `{ language, setLanguage, t }`. Language switcher in layout header. State is local (no persistence) for MVP.

## Product

- **Homepage**: Hero search + category cards + featured businesses
- **Directory (`/businesses`)**: Full business listing with search, category + city filters, pagination
- **Business detail (`/businesses/:id`)**: Full profile — description, contact, services/products, verified badge, claim prompt
- **Search (`/search`)**: Full-text search with category filter, list-view results
- **Admin dashboard (`/admin`)**: Stats overview + recent businesses + top categories (requires login)
- **Admin businesses (`/admin/businesses`)**: Business management table with verify + delete actions

## Seed data

- Admin user: `admin@ethiobiz.et` / `admin_001`
- 7 top-level categories (Real Estate, Jobs, Cars, Import & Export, Brokers, Clinics, Miscellaneous), 24 subcategories
- 10 sample businesses across categories
- 3 sample ads

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Always use `inArray()` from drizzle-orm for array WHERE clauses** — `sql.join` approach fails with node-postgres driver
- Run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Generated hook names: `useListBusinesses`, `useListCategories` (not `useGetBusinesses`/`useGetCategories`)
- `useGetBusiness(id)` takes a `number`, not a string

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
