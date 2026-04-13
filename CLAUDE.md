# CLAUDE.md — Values Explorer

AI assistant guide for the `brtrx/values-explorer` codebase.

---

## Project Overview

**Values Explorer** is a React SPA for exploring human values using Schwartz's Theory of Basic Values (PVQ-RR). Users create value profiles for themselves or characters, compare them, discover value tensions through "carriers," and generate AI-powered conflict scenarios.

Live: `https://brtrx.github.io/values-explorer/`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18.3 + TypeScript 5.8 |
| Build | Vite 5.4 (SWC transpiler) |
| Routing | React Router DOM 6.30 |
| Server state | React Query 5.83 |
| Styling | Tailwind CSS 3.4 + shadcn/ui (Radix UI) |
| Forms | React Hook Form 7 + Zod |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Charts | Recharts 2.15 |
| Icons | Lucide React |
| Notifications | Sonner + shadcn Toaster |
| Theme | next-themes (dark mode via Tailwind class) |
| Deployment | GitHub Pages (HashRouter) + Supabase |

---

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:8080
npm run build      # Production build → /dist
npm run build:dev  # Development mode build
npm run lint       # ESLint check
npm run preview    # Preview production build locally
```

**No test framework is configured.** Testing is manual.

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...   # Supabase anon key (public, safe to expose)
```

- All client-side env vars must be prefixed with `VITE_` — accessed via `import.meta.env.VITE_*`
- OpenAI key is a **Supabase secret** (`OPENAI_API_KEY`) — never in `.env`, only in Supabase dashboard
- Edge Functions access secrets via `Deno.env.get('OPENAI_API_KEY')`

---

## Repository Structure

```
values-explorer/
├── src/
│   ├── App.tsx                    # Root: router + providers
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Global Tailwind styles + CSS variables
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives (do not hand-edit)
│   │   ├── ProfileEditor.tsx      # Main profile editing interface
│   │   ├── SchwartzCircle.tsx     # Circular radar visualization (19 values)
│   │   ├── OverlappingSchwartzCircle.tsx  # Multi-profile overlay
│   │   ├── ConflictScenario.tsx   # AI scenario display
│   │   ├── GenerationPanel.tsx    # Trigger AI generation
│   │   ├── ClarificationPanel.tsx # Deep-dive question interface
│   │   ├── CarrierSensitivityPanel.tsx
│   │   ├── ProfileTensionCarriers.tsx
│   │   ├── SimilarTo.tsx          # Archetype matching
│   │   ├── ProfileSidebar.tsx     # Profile metadata editing
│   │   ├── Navigation.tsx         # Top nav dropdown
│   │   ├── ValueAbbreviation.tsx  # Renders 3-letter value codes
│   │   └── ValueEditor.tsx        # Individual value slider
│   ├── pages/
│   │   ├── Landing.tsx            # Home: archetype browser + saved profiles
│   │   ├── Index.tsx              # Profile editor wrapper
│   │   ├── Compare.tsx            # Multi-profile comparison
│   │   ├── Carriers.tsx           # Tension carrier explorer
│   │   ├── ExploreScenarios.tsx   # AI scenario generation
│   │   ├── JobAnalysis.tsx        # Analyze job descriptions
│   │   ├── DataExport.tsx         # Export profiles as JSON
│   │   ├── Research.tsx           # Literature review background
│   │   ├── SharedProfile.tsx      # Public profile view (/p/:id)
│   │   └── NotFound.tsx           # 404
│   ├── lib/
│   │   ├── schwartz-values.ts     # 19 PVQ-RR value definitions + helpers
│   │   ├── archetypes.ts          # 90+ character profiles with value weights
│   │   ├── carriers.ts            # 12 tension carrier definitions
│   │   ├── carrier-sensitivity.ts # Maps values → carrier polarities
│   │   ├── profile-storage.ts     # Supabase CRUD + localStorage draft
│   │   ├── profile-generator.ts   # AI profile generation logic
│   │   ├── polarity-explanations.ts
│   │   ├── job-clarification.ts   # Job description analysis
│   │   ├── validation.ts          # Zod schemas
│   │   └── utils.ts               # cn() Tailwind class merge helper
│   ├── hooks/
│   │   ├── use-profile-draft.ts   # Draft persistence (localStorage)
│   │   ├── use-toast.ts           # Toast notifications
│   │   └── use-mobile.tsx         # Responsive breakpoint detection
│   └── integrations/supabase/
│       ├── client.ts              # Supabase JS client (localStorage auth)
│       └── types.ts               # Auto-generated DB types (do not hand-edit)
├── supabase/
│   ├── config.toml                # Supabase CLI config
│   ├── migrations/                # SQL schema migrations
│   └── functions/                 # Deno Edge Functions
│       ├── generate-conflict-scenario/
│       ├── generate-clarification-scenarios/
│       ├── generate-persona-scenario/
│       ├── compare-archetypes/
│       ├── analyze-job-description/
│       └── generate-archetype-image/
├── public/                        # Static assets
├── .github/                       # GitHub Actions CI/CD
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json                # shadcn/ui CLI config
└── .env.example
```

---

## Routing

Defined in `src/App.tsx`:

| Path | Component | Purpose |
|---|---|---|
| `/` | `Landing` | Home page, archetype browser |
| `/editor` | `Index` | Create/edit a value profile |
| `/compare` | `Compare` | Compare multiple profiles |
| `/carriers` | `Carriers` | Explore tension carriers |
| `/scenarios` | `ExploreScenarios` | AI scenario generation |
| `/job-analysis` | `JobAnalysis` | Analyze job descriptions |
| `/export` | `DataExport` | Export profiles as JSON |
| `/research` | `Research` | Academic background |
| `/p/:id` | `SharedProfile` | Publicly shared profile |

**Router selection:** `HashRouter` on `brtrx.github.io` (GitHub Pages), `BrowserRouter` elsewhere. The base path is `/values-explorer/` when built via GitHub Actions.

---

## Domain Concepts

### Schwartz Values (PVQ-RR)

19 values scored 1–6, grouped into 4 higher-order clusters arranged in a motivational circle:

| Code | Label | Higher-Order |
|---|---|---|
| SDT | Self-direction – thought | Openness |
| SDA | Self-direction – action | Openness |
| STI | Stimulation | Openness |
| HED | Hedonism | Openness |
| ACM | Achievement | Self-Enhancement |
| POD | Power – dominance | Self-Enhancement |
| POR | Power – resources | Self-Enhancement |
| FAC | Face | Self-Enhancement |
| SEO | Security – personal | Conservation |
| SES | Security – societal | Conservation |
| TRD | Tradition | Conservation |
| COR | Conformity – rules | Conservation |
| COI | Conformity – interpersonal | Conservation |
| HUM | Humility | Conservation |
| BEC | Benevolence – caring | Self-Transcendence |
| BED | Benevolence – dependability | Self-Transcendence |
| UNC | Universalism – concern | Self-Transcendence |
| UNN | Universalism – nature | Self-Transcendence |
| UNT | Universalism – tolerance | Self-Transcendence |

Default score: `3.5` (midpoint of 1–6 range). Source in `src/lib/schwartz-values.ts`.

### Archetypes

90+ predefined profiles in `src/lib/archetypes.ts`. Each archetype has relative value weightings (−3 to +3 delta). Categories: fictional characters, historical figures, superheroes, mythological, literary, cultural roles.

Inter-page state: `sessionStorage.loadArchetype` passes an archetype to the editor.

### Tension Carriers

12 "decision-space primitives" in `src/lib/carriers.ts` — constraints that force value tradeoffs and make latent value differences visible. Examples: `risk_uncertainty`, `control_authority`, `resources_allocation`, `time_urgency`, `attention_recognition`, `norm_enforcement`.

Each carrier has a **polarity vector** mapping each Schwartz value to `+1/−1`, indicating whether increasing that carrier's intensity satisfies or frustrates the value. Opposite polarities on a carrier = visible conflict between two values.

### Profiles

Stored in Supabase `profiles` table:

```sql
id           UUID (primary key)
name         TEXT
description  TEXT
system_prompt TEXT
scores       JSONB  -- { SDT: 4.2, SDA: 3.1, ... }
created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
```

RLS policies: public read/write/delete (no auth required).

Draft profiles are auto-saved to `localStorage` via `use-profile-draft.ts` and cleared on save.

---

## State Management

| Concern | Mechanism |
|---|---|
| Server/DB data | React Query (`useQuery`, `useMutation`) |
| Form state | `useState` + React Hook Form |
| Draft persistence | localStorage via `useProfileDraft` hook |
| Inter-page state | `sessionStorage` (archetype loading, compare preselect) |
| Dark mode | next-themes + Tailwind `dark:` class |
| Toasts | Sonner + shadcn `useToast` |
| Navigation | React Router URL state |

No global state store (no Redux/Zustand/Context for app state). Data flows via props for simple cases and React Query for async operations.

---

## Styling Conventions

- **Utility-first Tailwind** — avoid inline styles
- **`cn()` helper** from `src/lib/utils.ts` for conditional class merging (`clsx` + `tailwind-merge`)
- **CSS variables** defined in `src/index.css` using HSL format (e.g., `--primary: 185 45% 28%`)
- **Dark mode** via `dark:` prefix; use CSS variables rather than hardcoded colors
- **Quadrant colors** (Tailwind custom classes):
  - `quadrant-openness` → blue (`200 70% 50%`)
  - `quadrant-self-enhancement` → orange (`25 75% 55%`)
  - `quadrant-conservation` → green (`140 45% 40%`)
  - `quadrant-self-transcendence` → purple (`280 55% 55%`)
- **Typography**: `font-serif` = Crimson Pro; `font-sans` = Inter (Google Fonts)
- **shadcn/ui components** in `src/components/ui/` — add via `npx shadcn@latest add <component>`, do not hand-edit these files

---

## Component Conventions

- **PascalCase** filenames and exports for components
- **Function components** with typed props interface:
  ```typescript
  interface MyComponentProps { ... }
  export function MyComponent({ prop }: MyComponentProps) { ... }
  ```
- Custom hooks in `src/hooks/` with `use` prefix
- Business logic in `src/lib/`, not in components
- `useCallback` / `useMemo` for expensive calculations (e.g., `SchwartzCircle.tsx` geometry)
- Error handling: `try/catch` with `toast.error(...)` for user-facing errors

---

## Edge Functions

Located in `supabase/functions/*/index.ts`. Each runs as Deno on Supabase's Edge runtime.

| Function | Purpose |
|---|---|
| `generate-conflict-scenario` | AI scenario between two profiles |
| `generate-clarification-scenarios` | Deep-dive clarifying questions |
| `generate-persona-scenario` | Persona-based scenario |
| `compare-archetypes` | Comparison analysis |
| `analyze-job-description` | Extract value requirements from job posting |
| `generate-archetype-image` | DALL-E image for archetypes |

All functions call OpenAI (key via `Deno.env.get('OPENAI_API_KEY')`). Called from the client via `supabase.functions.invoke(...)`.

---

## Path Aliases

`@/` maps to `src/` (configured in `tsconfig.json` and `vite.config.ts`):

```typescript
import { cn } from "@/lib/utils";
import { SCHWARTZ_VALUES } from "@/lib/schwartz-values";
```

---

## Git Workflow

- **Default branch:** `main`
- **Feature branches:** `claude/{feature-description}-{RANDOM_ID}` (e.g., `claude/add-homepage-menu-uACr8`)
- **Deployment:** GitHub Actions automatically builds and deploys `main` to GitHub Pages with base path `/values-explorer/`

When working on Claude-assisted tasks, develop on the designated branch and push before creating a PR.

---

## Key Files to Know

| File | Why it matters |
|---|---|
| `src/App.tsx` | All routes defined here |
| `src/lib/schwartz-values.ts` | Canonical value definitions and helpers |
| `src/lib/archetypes.ts` | All 90+ archetype profiles |
| `src/lib/carriers.ts` | Carrier framework and polarity vectors |
| `src/lib/profile-storage.ts` | All Supabase DB operations |
| `src/integrations/supabase/client.ts` | Supabase client (singleton) |
| `src/integrations/supabase/types.ts` | Auto-generated DB types (do not edit) |
| `src/index.css` | CSS variable definitions and theme tokens |
| `tailwind.config.ts` | Custom colors, fonts, animations |
| `supabase/migrations/` | Database schema history |

---

## What NOT to Do

- Do not hand-edit files in `src/components/ui/` — use the shadcn CLI
- Do not hand-edit `src/integrations/supabase/types.ts` — regenerate via Supabase CLI
- Do not add `OPENAI_API_KEY` to `.env` — it belongs in Supabase secrets only
- Do not push to `main` directly — use feature branches and PRs
- Do not add a test framework without discussion — none is currently configured
- Do not introduce global state management (Redux/Zustand) without discussion
