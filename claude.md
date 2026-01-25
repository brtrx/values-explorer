# Trait Generator

An interactive philosophical tool for exploring Schwartz's Theory of Basic Human Values. Users can create value profiles, compare archetypes (fictional, historical, mythological characters), and generate AI-powered scenarios that reveal value tensions.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 5, TailwindCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **State**: React Query, localStorage for drafts
- **Routing**: React Router v6 (HashRouter for GitHub Pages)

## Project Structure

```
src/
├── pages/           # Route components (Landing, Index, Compare, Carriers, ExploreScenarios)
├── components/      # React components
│   ├── ui/          # shadcn/ui primitives (40+ components)
│   ├── ProfileEditor.tsx      # Main editor with sidebar & visualization
│   ├── SchwartzCircle.tsx     # Value circumplex visualization
│   └── ...
├── lib/             # Core business logic
│   ├── schwartz-values.ts     # 19 Schwartz value definitions
│   ├── archetypes.ts          # 50+ character profiles (~1000 lines)
│   ├── carriers.ts            # 12 decision-space carriers (~1100 lines)
│   ├── profile-storage.ts     # Supabase + localStorage integration
│   └── validation.ts          # Zod schemas
├── hooks/           # Custom hooks (use-profile-draft, use-toast, use-mobile)
└── integrations/    # Supabase client config

supabase/
├── migrations/      # Database schema (profiles table with JSONB scores)
└── functions/       # Edge functions (compare-archetypes, generate-persona-scenario)
```

## Commands

```bash
npm run dev      # Start dev server (localhost:8080)
npm run build    # Production build to /dist
npm run lint     # ESLint validation
npm run preview  # Preview production build
```

## Domain Concepts

### Schwartz Values (19 values, 4 quadrants)
- **Openness to Change**: Self-Direction (Thought/Action), Stimulation, Hedonism
- **Self-Enhancement**: Achievement, Power (Dominance/Resources), Face
- **Conservation**: Security (Personal/Societal), Tradition, Conformity (Rules/Interpersonal), Humility
- **Self-Transcendence**: Benevolence (Caring/Dependability), Universalism (Nature/Concern/Tolerance)

### Value Scores
- User profiles: 0-7 scale (importance)
- Archetype profiles: -3 to +3 scale (weighted emphasis)

### Carriers (Decision Spaces)
12 dimensions representing constraints that force value trade-offs:
- Risk/Uncertainty, Control/Authority, Resources Allocation
- Time Urgency, Attention/Recognition, Norm Enforcement
- Choice/Freedom, Inclusion/Exclusion, Truth/Disclosure
- Effort/Sacrifice, Change/Stability, Boundary Permeability

### Polarity Vectors
Map value-to-carrier relationships (-1 to +1) showing if a carrier satisfies or frustrates a value. Used to detect tensions between profiles.

## Key Patterns

- **Path alias**: `@/*` maps to `./src/*`
- **Storage**: Supabase for persistence, localStorage for draft auto-save
- **Styling**: Tailwind with custom quadrant colors (openness, self-transcendence, conservation, self-enhancement)
- **Fonts**: Crimson Pro (headings), Inter (body)
- **Deployment**: GitHub Pages via Actions, HashRouter for SPA routing

## Database Schema

```sql
profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  scores JSONB,        -- Record of 19 value scores
  description TEXT,
  system_prompt TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Important Files

- `src/lib/archetypes.ts` - All character definitions with value profiles
- `src/lib/carriers.ts` - Carrier definitions and polarity vectors
- `src/components/ProfileEditor.tsx` - Main editing interface
- `src/components/SchwartzCircle.tsx` - Circumplex visualization
- `src/pages/Carriers.tsx` - Interactive value-carrier matrix
