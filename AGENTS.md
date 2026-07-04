# AGENTS.md

## Cursor Cloud specific instructions

### What this is
Single-product web app: **PGR UAE** — a React 19 + Vite 6 storefront/lead-desk for precious-metals (gold/silver) bullion, served together with its `/api/*` backend by **one Express process** (`server.ts`, run via `tsx`). It is not a monorepo; everything lives off the root `package.json`.

### Running / building (standard commands live in `package.json` scripts)
- Dev: `npm run dev` → `tsx server.ts` serves the SPA (Vite middleware) **and** all `/api/*` routes on **http://0.0.0.0:3000** (single process, one port). Use this for development and E2E testing.
- Lint / typecheck: `npm run lint` (`tsc --noEmit`).
- Build: `npm run build` (Vite client build + esbuild bundle → `dist/server.cjs`). Production run is `npm run start` (`NODE_ENV=production node dist/server.cjs`), which serves static `dist/` instead of Vite middleware.

### Non-obvious caveats
- **All external services are optional and have built-in fallbacks.** With no secrets set, the app runs in "LOCAL SIMULATION": Supabase → seeded `localStorage` mock DB (`src/lib/supabase.ts`), Gemini chat → scripted fallback, metal prices → reference spot values. So `npm run dev` works with zero configuration; missing `GEMINI_API_KEY` etc. is expected and only logs a warning.
- **Env vars are all optional** (see `.env.example`). Put them in `.env.local` or `.env` (git-ignored). `GEMINI_API_KEY`, `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, `METAL_PRICE_API_KEY`/`METALS_API_KEY`/`GOLD_API_KEY`, `PGR_SIGNATURE_SECRET`.
- **Fallback pricing leaves platinum/palladium null.** In the no-API-key fallback branch, `/api/prices` returns `rates.platinum` and `rates.palladium` as `null` (`server.ts` ~L226-283); only gold/silver have reference values. `src/components/LiveMarket.tsx` guards for this (`getPriceData` null-checks the metal, and missing metals render an "Unavailable" card), so the homepage renders fine with no API key. If you edit the price ticker, keep those null guards — otherwise the SPA crashes into its `ErrorBoundary` on load. Backend `/api/*` endpoints are unaffected either way.
- The backend `server.ts` and Vercel serverless variants (`api/chat.ts`, `api/prices.ts`) duplicate the same pricing/chat logic; keep them in sync when editing.
