import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';

interface SimilarToProps {
  scores: ValueScores;
  onLoadArchetypeProfile?: (scores: ValueScores, name: string) => void;
}

export function SimilarTo({ scores, onLoadArchetypeProfile }: SimilarToProps) {
  const [category, setCategory] = useState<ArchetypeCategory>('fictional');
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [similarArchetypes, setSimilarArchetypes] = useState<Archetype[]>([]);
  const [matchPercent, setMatchPercent] = useState(0);
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

  if (!archetype) return null;

  const matchingValues = getMatchingValues(scores, archetype);
  const matchingLabels = matchingValues
    .map(code => getValueByCode(code)?.label)
    .filter(Boolean);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl font-semibold">Similar To...</h2>
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

      <Card className="overflow-hidden">
        <div className="p-5">

          {/* Archetype name and description */}
          <div className="text-center mb-4">
            <h3 className="font-serif text-xl font-bold text-primary">
              {archetype.name}
            </h3>
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
              <p className="text-xs text-muted-foreground mb-2">Similar:</p>
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
    </section>
  );
}
