import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, RefreshCw, User } from 'lucide-react';
import { ValueScores, getValueByCode } from '@/lib/schwartz-values';
import { 
  ArchetypeCategory, 
  ARCHETYPE_CATEGORIES, 
  findBestArchetype, 
  getMatchingValues,
  getMatchScore,
  findSimilarArchetypes,
  archetypeToScores,
  Archetype 
} from '@/lib/archetypes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WhoAmIMostLikeProps {
  scores: ValueScores;
  onLoadArchetypeProfile?: (scores: ValueScores, name: string) => void;
}

export function WhoAmIMostLike({ scores, onLoadArchetypeProfile }: WhoAmIMostLikeProps) {
  const [category, setCategory] = useState<ArchetypeCategory>('fictional');
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [similarArchetypes, setSimilarArchetypes] = useState<Archetype[]>([]);
  const [matchPercent, setMatchPercent] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  // Update archetype when scores or category change
  useEffect(() => {
    const newArchetype = findBestArchetype(scores, category);
    setArchetype(newArchetype);
    // Calculate match percentage (score is roughly 0-1.5, normalize to 0-100)
    const rawScore = getMatchScore(scores, newArchetype);
    const percent = Math.min(100, Math.round(rawScore * 70 + 20)); // Scale to 20-100%
    setMatchPercent(percent);
    // Find similar archetypes
    setSimilarArchetypes(findSimilarArchetypes(newArchetype, 4));
    setImageUrl(null); // Reset image when archetype changes
    setHasGenerated(false);
  }, [scores, category]);

  const handleCategoryChange = (newCategory: ArchetypeCategory) => {
    setCategory(newCategory);
  };

  const handleLoadArchetype = (arch: Archetype) => {
    if (onLoadArchetypeProfile) {
      const newScores = archetypeToScores(arch);
      onLoadArchetypeProfile(newScores, arch.name);
      toast({
        title: `Loaded ${arch.name}'s profile`,
        description: 'Value scores have been updated to match this character.',
      });
    }
  };

  const generateImage = async () => {
    if (!archetype) return;

    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-archetype-image', {
        body: {
          prompt: archetype.imagePrompt,
          archetypeName: archetype.name,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
        setHasGenerated(true);
        toast({
          title: 'Image generated',
          description: `Portrait of ${archetype.name} created successfully.`,
        });
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast({
        title: 'Image generation failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (!archetype) return null;

  const matchingValues = getMatchingValues(scores, archetype);
  const matchingLabels = matchingValues
    .map(code => getValueByCode(code)?.label)
    .filter(Boolean);

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-serif text-lg font-semibold">Who Am I Most Like?</h3>
          <Select value={category} onValueChange={(v) => handleCategoryChange(v as ArchetypeCategory)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {ARCHETYPE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-5">
        {/* Archetype image */}
        <div className="mb-4 relative">
          <div className="aspect-square w-full max-w-[240px] mx-auto rounded-xl overflow-hidden bg-muted/50 border">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={`Portrait of ${archetype.name}`}
                className="w-full h-full object-cover animate-fade-in"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                <User className="w-16 h-16 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground text-center">
                  Click generate to create a portrait
                </p>
              </div>
            )}
          </div>

          {/* Generate/Regenerate button */}
          <div className="flex justify-center mt-3">
            <Button
              onClick={generateImage}
              disabled={isGeneratingImage}
              variant={hasGenerated ? 'outline' : 'default'}
              size="sm"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : hasGenerated ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Portrait
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Archetype name and description */}
        <div className="text-center mb-4">
          <h4 className="font-serif text-xl font-bold text-primary">
            {archetype.name}
          </h4>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground capitalize">
              {ARCHETYPE_CATEGORIES.find(c => c.value === category)?.label}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {matchPercent}% match
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {archetype.description}
        </p>

        {/* Matching values */}
        {matchingLabels.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Shared values:</p>
            <div className="flex flex-wrap gap-1.5">
              {matchingLabels.map((label, i) => (
                <span 
                  key={i}
                  className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Similar characters */}
        {similarArchetypes.length > 0 && (
          <div className="pt-3 mt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Similar to…</p>
            <div className="flex flex-wrap gap-1.5">
              {similarArchetypes.map((similar) => (
                <button
                  key={similar.name}
                  onClick={() => handleLoadArchetype(similar)}
                  className="px-2.5 py-1 text-xs rounded-full border border-border bg-background hover:bg-muted hover:border-primary/50 transition-colors cursor-pointer font-medium text-foreground"
                  title={`Load ${similar.name}'s value profile`}
                >
                  {similar.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
