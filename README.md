# Values Explorer

An interactive philosophical tool for exploring Schwartz's Theory of Basic Human Values. Create value profiles, compare archetypes (fictional, historical, mythological characters), and generate AI-powered scenarios that reveal value tensions.

**Live Demo**: https://brtrx.github.io/values-explorer/

## Features

- **Value Profile Editor**: Create and customize profiles using the 19 Schwartz PVQ-RR values
- **Schwartz Circumplex Visualization**: Interactive circular display of value relationships
- **Archetype Library**: 80+ pre-built character profiles (historical figures, fictional characters, mythological beings)
- **Profile Comparison**: Compare multiple profiles to identify value alignments and tensions
- **Carrier Analysis**: Explore 12 decision-space dimensions that force value trade-offs
- **AI Scenario Generation**: Generate narratives that reveal how value tensions play out

## Schwartz Values Framework

The tool implements the refined 19-value model from the Portrait Values Questionnaire (PVQ-RR), organized into four higher-order values:

| Quadrant | Values |
|----------|--------|
| **Openness to Change** | Self-Direction (Thought/Action), Stimulation, Hedonism |
| **Self-Enhancement** | Achievement, Power (Dominance/Resources), Face |
| **Conservation** | Security (Personal/Societal), Tradition, Conformity (Rules/Interpersonal), Humility |
| **Self-Transcendence** | Benevolence (Caring/Dependability), Universalism (Nature/Concern/Tolerance) |

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 5, TailwindCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **State**: React Query, localStorage for drafts
- **Routing**: React Router v6 (HashRouter for GitHub Pages)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/brtrx/values-explorer.git
cd values-explorer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:8080

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes (for Edge Functions) |

The `OPENAI_API_KEY` must be set as a Supabase secret for the Edge Functions:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

## Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build to /dist
npm run lint     # ESLint validation
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── pages/           # Route components
├── components/      # React components
│   ├── ui/          # shadcn/ui primitives
│   ├── ProfileEditor.tsx
│   └── SchwartzCircle.tsx
├── lib/             # Core business logic
│   ├── schwartz-values.ts
│   ├── archetypes.ts
│   └── carriers.ts
├── hooks/           # Custom React hooks
└── integrations/    # Supabase client config

supabase/
├── migrations/      # Database schema
└── functions/       # Edge functions for AI features
```

## License

This project is a philosophical experiment by Justin Tauber.
