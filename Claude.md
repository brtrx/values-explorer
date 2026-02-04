# Values Explorer

A React-based interactive exploration of human values using Schwartz's Theory of Basic Values. Users can create value profiles, compare them, discover tensions, and explore how values express themselves through everyday constraints.

## Project Overview

This application allows users to:
- **Create Value Profiles**: Map 19 Schwartz values (1-6 scale) for yourself, fictional characters, or archetypes
- **Compare Profiles**: Visualize tensions between different value schemes
- **Explore Tension Carriers**: Discover constraints (money, time, attention) that force tradeoffs
- **Generate Conflict Scenarios**: AI-powered scenarios exploring value conflicts between profiles
- **Match Archetypes**: See which famous figures (fictional, historical, mythological) share your values
- **Analyze Job Descriptions**: Compare job value requirements against profiles

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **State**: React Query for server state
- **Routing**: React Router DOM

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui primitives
│   ├── ProfileEditor.tsx
│   ├── SchwartzCircle.tsx
│   └── ...
├── pages/              # Route pages
│   ├── Landing.tsx     # Home page with archetypes
│   ├── Index.tsx       # Profile editor
│   ├── Compare.tsx     # Profile comparison
│   ├── Carriers.tsx    # Tension carriers explorer
│   ├── ExploreScenarios.tsx
│   └── ...
├── lib/                # Core logic
│   ├── schwartz-values.ts  # 19 PVQ-RR values definition
│   ├── archetypes.ts       # 90+ character archetypes
│   ├── carriers.ts         # Tension carrier definitions
│   └── ...
├── hooks/              # Custom React hooks
└── integrations/       # Supabase client
supabase/
└── functions/          # Edge functions for AI features
    ├── generate-conflict-scenario/
    ├── compare-archetypes/
    ├── analyze-job-description/
    └── ...
```

## Key Concepts

### Schwartz Values (PVQ-RR)
The app uses the 19-value refined Schwartz framework:
- **Openness**: Self-direction (thought/action), Stimulation, Hedonism
- **Self-Enhancement**: Achievement, Power (dominance/resources), Face
- **Conservation**: Security (personal/societal), Tradition, Conformity (rules/interpersonal), Humility
- **Self-Transcendence**: Benevolence (caring/dependability), Universalism (concern/nature/tolerance)

### Archetypes
90+ predefined value profiles across categories:
- Fictional characters (Dumbledore, Tony Stark, etc.)
- Historical figures (Einstein, Gandhi, etc.)
- Superheroes (Batman, Wonder Woman, etc.)
- Mythological (Zeus, Athena, etc.)
- Literary (Sherlock Holmes, Elizabeth Bennet, etc.)
- Cultural roles (Patrick, Patricia)

### Tension Carriers
Constraints that make value tradeoffs visible: money, time, attention, energy, reputation, etc.

## Development

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (Vite)
npm run build    # Production build
npm run lint     # ESLint
```

## Database

Profiles are stored in Supabase PostgreSQL with:
- `id`: UUID
- `name`: Profile name
- `description`: Optional description
- `scores`: JSON object mapping value codes to scores (1-6)
- `created_at`, `updated_at`: Timestamps

## Deployment

- Hosted on GitHub Pages (uses HashRouter for compatibility)
- Supabase handles backend/database
