# CLAUDE.md

## Project Overview

Values Explorer — an interactive tool for exploring Schwartz's Theory of Basic Values. Built with React + TypeScript + Vite, styled with Tailwind CSS and shadcn/ui, backed by Supabase.

Deployed to GitHub Pages at `brtrx.github.io/values-explorer` using HashRouter.

## Commands

```bash
npm run dev        # Start dev server (port 8080)
npm run build      # Production build
npm run build:dev  # Development build
npm run lint       # ESLint
npm run preview    # Preview production build
```

No test framework is configured.

## Architecture

### Directory structure

- `src/pages/` — Route-level page components (Landing, Compare, Carriers, etc.)
- `src/components/` — Feature components (ProfileEditor, SchwartzCircle, Navigation, etc.)
- `src/components/ui/` — shadcn/ui primitives (do not edit manually)
- `src/lib/` — Business logic: value definitions, archetypes, storage, validation
- `src/hooks/` — Custom React hooks (useProfileDraft, useMobile, useToast)
- `src/integrations/supabase/` — Supabase client and generated types

### Routing

Defined in `src/App.tsx`. Uses `HashRouter` on GitHub Pages (`brtrx.github.io`), `BrowserRouter` elsewhere. Routes:

| Path | Page |
|------|------|
| `/` | Landing |
| `/editor` | ProfileEditor (via Index) |
| `/compare` | Compare |
| `/carriers` | Carriers |
| `/scenarios` | ExploreScenarios |
| `/p/:id` | SharedProfile |
| `/export` | DataExport |
| `/job-analysis` | JobAnalysis |
| `/research` | Research |

### Key patterns

- **Navigation**: All pages include `<Navigation title="..." />` — a sticky header with a dropdown menu that uses `useNavigate()` for programmatic routing (not `<Link>`, to avoid Radix event conflicts).
- **State**: React hooks + React Query. localStorage for draft profiles, sessionStorage for inter-page archetype passing, Supabase for persistence.
- **Path alias**: `@/*` maps to `src/*`.
- **Styling**: Tailwind with custom theme (Crimson Pro serif, Inter sans, Schwartz quadrant colors for self-transcendence/conservation/self-enhancement/openness).

## Environment

Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. See `.env.example`.

## CI/CD

GitHub Actions (`.github/workflows/static.yml`) builds and deploys to GitHub Pages on push to `main`. Vite base path is set to `/values-explorer/` when `GITHUB_ACTIONS` env var is present.

## TypeScript

Strict mode is OFF. `allowJs: true`, `skipLibCheck: true`. Target ES2020.
