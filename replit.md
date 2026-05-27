# Digital Reality — Project Management

A mobile field project management app for survey and geospatial teams. Manage projects, log field activities, track equipment, handle billing, and record expenses — all from your phone.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native), Expo Router, AsyncStorage
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/digital-reality/` — Expo mobile app
- `artifacts/digital-reality/app/` — Expo Router screens
- `artifacts/digital-reality/context/AppContext.tsx` — Global state, data types, seed data (AsyncStorage)
- `artifacts/digital-reality/constants/colors.ts` — Brand color tokens
- `artifacts/digital-reality/components/` — Reusable UI components
- `artifacts/api-server/src/routes/` — Express API routes
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)

## Architecture decisions

- All app data stored locally via AsyncStorage (no backend required for first build)
- Seed data pre-loaded in AppContext for demo purposes
- Uses Expo Router file-based routing with (tabs) group for bottom navigation
- Colors fully tokenized through `constants/colors.ts` + `useColors()` hook
- No auth backend — login accepts any email/password for demo

## Product

- **Login**: Email/password + social login buttons
- **Dashboard**: Active project banner, stats (Active Projects, Today's Activities, Equipment in Use, Pending Billing), recent projects list
- **Projects**: Filterable list (All / Active / Completed / On Hold) with progress bars; tap to view full Project Detail
- **Project Detail**: Full metadata, progress, team, tabbed content (Field Work, Processing, Deliverables, Billing, Documents)
- **Activities**: Field activity log with equipment tags, location, area covered, progress
- **Add Activity**: Full form — project, type, date, location, GPS coords, equipment multi-select, progress slider, remarks, photos
- **Billing**: Invoice list with PO Value / Raised / Received / Pending summary
- **Add Expense**: Form with project, type, amount, paid-by, bill photo upload, GPS location, remarks
- **Equipment**: Filterable list by status (In Use / Available / Maintenance)
- **More**: Profile card, navigation to Equipment, Team, Reports, Settings, Logout

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run codegen after changing `lib/api-spec/openapi.yaml`
- Expo workflow uses `REPLIT_EXPO_DEV_DOMAIN` — do not hardcode ports
- Web preview renders fonts slightly differently than native (Expo Go is the source of truth)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
