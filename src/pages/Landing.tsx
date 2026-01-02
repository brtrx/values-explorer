import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Compass, Users, Sparkles, ArrowRight, Plus, Star, GitCompare } from 'lucide-react';
import { DbProfile } from '@/lib/profile-storage';
import { ValueScores } from '@/lib/schwartz-values';
import { Json } from '@/integrations/supabase/types';
import { ARCHETYPES, ARCHETYPE_CATEGORIES, archetypeToScores } from '@/lib/archetypes';

function jsonToScores(json: Json): ValueScores {
  return json as unknown as ValueScores;
}

export default function Landing() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const archetypesByCategory = ARCHETYPE_CATEGORIES.map((cat) => ({
    ...cat,
    archetypes: ARCHETYPES.filter((a) => a.category === cat.value),
  }));

  const handleLoadArchetype = (archetypeName: string) => {
    const archetype = ARCHETYPES.find((a) => a.name === archetypeName);
    if (archetype) {
      const scores = archetypeToScores(archetype);
      // Store in sessionStorage so editor can pick it up
      sessionStorage.setItem('loadArchetype', JSON.stringify({ name: archetype.name, scores }));
      navigate('/editor');
    }
  };

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
      } else if (data) {
        setProfiles(
          data.map((p) => ({
            ...p,
            scores: jsonToScores(p.scores),
          }))
        );
      }
      setLoading(false);
    }

    fetchProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-hero mb-6 shadow-glow">
              <Compass className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Schwartz Values
              <span className="block text-primary">Profile Builder</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Map your personal values using the scientifically validated PVQ-RR framework, 
              then generate AI-ready personality profiles and system prompts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/editor">
                  <Plus className="w-5 h-5" />
                  Create New Profile
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/compare">
                  <GitCompare className="w-5 h-5" />
                  Compare Archetypes
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works */}
      <section className="py-16 border-t bg-muted/30">
        <div className="container">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                <span className="font-serif text-xl font-bold">1</span>
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Set Your Values</h3>
              <p className="text-muted-foreground">
                Adjust 19 value dimensions across four quadrants: Openness, Self-Enhancement, 
                Conservation, and Self-Transcendence.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                <span className="font-serif text-xl font-bold">2</span>
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Discover Matches</h3>
              <p className="text-muted-foreground">
                See which famous figures, heroes, gods, and literary characters share 
                your value profile.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                <span className="font-serif text-xl font-bold">3</span>
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Generate Prompts</h3>
              <p className="text-muted-foreground">
                Get AI-ready system prompts that capture the personality essence for 
                use with ChatGPT, Claude, or other LLMs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Start with an Example */}
      <section className="py-16 border-t bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-3xl font-bold">Start with an Example</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Explore value profiles of famous characters and historical figures. 
              Click any name to load their profile and see how they map.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archetypesByCategory.map((category) => (
              <div key={category.value} className="rounded-xl border bg-card p-5">
                <h3 className="font-serif text-lg font-semibold mb-1">{category.label}</h3>
                <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                <div className="flex flex-wrap gap-2">
                  {category.archetypes.map((archetype) => (
                    <button
                      key={archetype.name}
                      onClick={() => handleLoadArchetype(archetype.name)}
                      className="text-sm px-3 py-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {archetype.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Saved Profiles */}
      <section id="profiles" className="py-16 border-t">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold">Saved Profiles</h2>
              <p className="text-muted-foreground mt-1">
                Click on any profile to load and explore it
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/editor">
                <Plus className="w-4 h-4" />
                New Profile
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-xl border bg-card animate-pulse" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-16 rounded-xl border bg-card/50">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-xl font-semibold mb-2">No profiles yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first value profile to get started
              </p>
              <Button asChild>
                <Link to="/editor">Create Profile</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <Link
                  key={profile.id}
                  to={`/p/${profile.id}`}
                  className="group rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif text-lg font-semibold group-hover:text-primary transition-colors">
                      {profile.name}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  {profile.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {profile.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    Updated {new Date(profile.updated_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Based on the{' '}
            <a
              href="https://www.researchgate.net/publication/316705732"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              PVQ-RR (Revised)
            </a>
            {' '}by Shalom H. Schwartz
          </p>
        </div>
      </footer>
    </div>
  );
}
