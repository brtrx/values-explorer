import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Compass, Sparkles, ArrowRight, Plus, Star, GitCompare, Trash2, Layers, Users } from 'lucide-react';
import { DbProfile, deleteProfile } from '@/lib/profile-storage';
import { ValueScores } from '@/lib/schwartz-values';
import { Json } from '@/integrations/supabase/types';
import { ARCHETYPES, ARCHETYPE_CATEGORIES, archetypeToScores } from '@/lib/archetypes';
import { useToast } from '@/hooks/use-toast';

function jsonToScores(json: Json): ValueScores {
  return json as unknown as ValueScores;
}

export default function Landing() {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleDeleteProfile = async (e: React.MouseEvent, profileId: string, profileName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Delete "${profileName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteProfile(profileId);
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      toast({
        title: 'Profile deleted',
        description: `"${profileName}" has been removed.`,
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-hero mb-6 shadow-glow">
              <Compass className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Exploring Values
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              A Philosophical Experiment by Justin Tauber
            </p>
          </div>
        </div>
      </header>

      {/* Overview Section */}
      <section className="py-12 border-t">
        <div className="container">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <p className="text-lg text-muted-foreground leading-relaxed">
              This site is an interactive exploration of human values—what we care about, why it matters, 
              and how different value priorities create both harmony and conflict. Using Schwartz's 
              scientifically validated framework, you can map value profiles, discover tensions, and 
              explore how values express themselves through everyday carriers like money, time, and attention.
            </p>
          </div>
        </div>
      </section>

      {/* Schwartz Theory Section */}
      <section className="py-12 border-t bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-2xl font-bold mb-6">The Schwartz Theory of Basic Values</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Shalom Schwartz's theory identifies 19 universal values that exist across all human cultures. 
                These values—from Security and Tradition to Stimulation and Self-Direction—are arranged in a 
                circular structure where adjacent values are compatible and opposing values are in tension.
              </p>
              <p>
                The theory has been validated across 80+ countries and hundreds of thousands of participants, 
                making it one of the most robust cross-cultural frameworks for understanding what humans 
                fundamentally care about. The circular structure reveals a deeper truth: pursuing some values 
                necessarily comes at the cost of others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tensions & Carriers Section */}
      <section className="py-12 border-t">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-2xl font-bold mb-6">Tensions & Carriers</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-3">Value Tensions</h3>
                <p className="text-muted-foreground">
                  Not all values can be maximized simultaneously. Security opposes Stimulation. 
                  Self-Enhancement conflicts with Self-Transcendence. Understanding these tensions 
                  helps explain interpersonal conflicts and internal dilemmas—they're not failures 
                  of character, but fundamental trade-offs in what we can prioritize.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Value Carriers</h3>
                <p className="text-muted-foreground">
                  Values don't exist in abstraction—they're expressed through "carriers" like money, 
                  time, attention, and social status. Each carrier has a different polarity for each 
                  value. Understanding carriers reveals how abstract values become concrete conflicts 
                  and how the same resource can mean completely different things to different people.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Do Section */}
      <section className="py-12 border-t bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-2xl font-bold mb-6">What You Can Do Here</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/editor" className="group p-5 rounded-xl border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Plus className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold group-hover:text-primary transition-colors">Create Value Profiles</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Build profiles for yourself, fictional characters, or archetypes. See which famous figures share your values.
                </p>
              </Link>
              <Link to="/compare" className="group p-5 rounded-xl border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <GitCompare className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold group-hover:text-primary transition-colors">Compare Profiles</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Visualize tensions between different value schemes and discover where conflicts arise.
                </p>
              </Link>
              <Link to="/carriers" className="group p-5 rounded-xl border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold group-hover:text-primary transition-colors">Explore Carriers</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  See how values express through concrete carriers like money, time, and attention.
                </p>
              </Link>
              <Link to="/scenarios" className="group p-5 rounded-xl border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold group-hover:text-primary transition-colors">Explore Scenarios</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate AI-powered scenarios that explore how different values create conflict.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Start with Example Value Schemes */}
      <section className="py-12 border-t">
        <div className="container">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold">Start with Example Value Schemes</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Explore value profiles of archetypes, characters, and historical figures. 
              Click any name to load their profile.
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
      <section id="profiles" className="py-12 border-t bg-muted/30">
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
                  className="group rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all relative"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif text-lg font-semibold group-hover:text-primary transition-colors pr-8">
                      {profile.name}
                    </h3>
                    <div className="flex items-center gap-2 absolute top-5 right-5">
                      <button
                        onClick={(e) => handleDeleteProfile(e, profile.id, profile.name)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
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
            Based on{' '}
            <a
              href="https://www.researchgate.net/publication/306432422_The_Refined_Theory_of_Basic_Values"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              "The Refined Theory of Basic Values"
            </a>
            {' '}by Shalom H. Schwartz
          </p>
        </div>
      </footer>
    </div>
  );
}
