import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Sparkles, Loader2, X } from 'lucide-react';
import { ARCHETYPES, ARCHETYPE_CATEGORIES, archetypeToScores } from '@/lib/archetypes';
import { OverlappingSchwartzCircle } from '@/components/OverlappingSchwartzCircle';
import { ConflictScenario } from '@/components/ConflictScenario';
import { toast } from 'sonner';

const COMPARE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compare-archetypes`;

export default function Compare() {
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>([]);
  const [comparison, setComparison] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    ARCHETYPE_CATEGORIES.map(c => c.value)
  );

  const selectedArchetypeData = useMemo(() => {
    return selectedArchetypes.map((name, index) => {
      const archetype = ARCHETYPES.find(a => a.name === name)!;
      return {
        name: archetype.name,
        scores: archetypeToScores(archetype),
        color: '',
      };
    });
  }, [selectedArchetypes]);

  const toggleArchetype = (name: string) => {
    setSelectedArchetypes(prev => {
      if (prev.includes(name)) {
        return prev.filter(n => n !== name);
      }
      if (prev.length >= 5) {
        toast.error('Maximum 5 archetypes can be compared at once');
        return prev;
      }
      return [...prev, name];
    });
    setComparison(''); // Clear comparison when selection changes
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const generateComparison = async () => {
    if (selectedArchetypes.length < 2) {
      toast.error('Select at least 2 archetypes to compare');
      return;
    }

    setIsGenerating(true);
    setComparison('');

    const archetypesData = selectedArchetypes.map(name => {
      const archetype = ARCHETYPES.find(a => a.name === name)!;
      return {
        name: archetype.name,
        description: archetype.description,
        valueProfile: archetype.valueProfile,
      };
    });

    try {
      const response = await fetch(COMPARE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ archetypes: archetypesData }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 402) {
          toast.error('AI credits exhausted. Please add funds.');
        } else {
          toast.error(error.error || 'Failed to generate comparison');
        }
        setIsGenerating(false);
        return;
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setComparison(fullText);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Comparison error:', error);
      toast.error('Failed to generate comparison');
    } finally {
      setIsGenerating(false);
    }
  };

  const archetypesByCategory = ARCHETYPE_CATEGORIES.map(cat => ({
    ...cat,
    archetypes: ARCHETYPES.filter(a => a.category === cat.value),
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 py-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-xl font-bold">Compare Archetypes</h1>
            <p className="text-sm text-muted-foreground">
              Select 2-5 characters to compare their value profiles
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Selection */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold">
                Select Archetypes ({selectedArchetypes.length}/5)
              </h2>
              {selectedArchetypes.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedArchetypes([]);
                    setComparison('');
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Selected chips */}
            {selectedArchetypes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedArchetypes.map(name => (
                  <button
                    key={name}
                    onClick={() => toggleArchetype(name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm"
                  >
                    {name}
                    <X className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            )}

            {/* Category accordions */}
            <div className="space-y-3">
              {archetypesByCategory.map(category => (
                <div key={category.value} className="rounded-lg border bg-card">
                  <button
                    onClick={() => toggleCategory(category.value)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div>
                      <h3 className="font-medium">{category.label}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <span className="text-muted-foreground">
                      {expandedCategories.includes(category.value) ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedCategories.includes(category.value) && (
                    <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                      {category.archetypes.map(archetype => (
                        <label
                          key={archetype.name}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedArchetypes.includes(archetype.name)}
                            onCheckedChange={() => toggleArchetype(archetype.name)}
                          />
                          <span className="text-sm">{archetype.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visualization & Comparison */}
          <div className="space-y-6">
            {selectedArchetypes.length >= 2 ? (
              <>
                <div className="rounded-xl border bg-card p-6">
                  <h2 className="font-serif text-lg font-semibold mb-4 text-center">
                    Value Profile Comparison
                  </h2>
                  <div className="flex justify-center">
                    <OverlappingSchwartzCircle 
                      archetypes={selectedArchetypeData} 
                      size={340} 
                    />
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-lg font-semibold">
                      AI Analysis
                    </h2>
                    <Button 
                      onClick={generateComparison}
                      disabled={isGenerating}
                      className="gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Comparison
                        </>
                      )}
                    </Button>
                  </div>

                  {comparison ? (
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      {comparison.split('\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Click "Generate Comparison" to see an AI-powered analysis of how these 
                      characters differ in their core values and motivations.
                    </p>
                  )}
                </div>

                <ConflictScenario selectedArchetypes={selectedArchetypes} />
              </>
            ) : (
              <div className="rounded-xl border bg-card/50 p-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-serif text-lg font-semibold mb-2">
                  Select at least 2 archetypes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose characters from the list to compare their value profiles 
                  and see how they differ philosophically.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
