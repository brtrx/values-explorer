import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitCompare } from 'lucide-react';
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
  profileName: string;
  profileId: string | null;
  profileDescription?: string | null;
  onLoadArchetypeProfile?: (scores: ValueScores, name: string) => void;
  onRequestSave?: () => Promise<string | null>;
}

export function SimilarTo({
  scores,
  profileName,
  profileId,
  profileDescription,
  onLoadArchetypeProfile,
  onRequestSave
}: SimilarToProps) {
  const [category, setCategory] = useState<ArchetypeCategory>('fictional');
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [similarArchetypes, setSimilarArchetypes] = useState<Archetype[]>([]);
  const [matchPercent, setMatchPercent] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Update archetype when scores or category change
  useEffect(() => {
    const newArchetype = findBestArchetype(scores, category);
    setArchetype(newArchetype);
    // Calculate match percentage (score is 0-1, convert to 0-100%)
    const rawScore = getMatchScore(scores, newArchetype);
    const percent = Math.round(rawScore * 100);
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

  // Navigate to compare page with the current profile and selected archetype
  const handleCompareWithArchetype = async (archetypeName: string) => {
    // If profile is not saved, prompt to save first
    if (!profileId && onRequestSave) {
      toast({
        title: 'Save profile first',
        description: 'Please name and save your profile before comparing.',
      });
      const savedId = await onRequestSave();
      if (!savedId) {
        return; // User cancelled save
      }
    }

    // Store comparison data in sessionStorage
    const compareData = {
      customProfile: {
        name: profileName,
        scores: scores,
        description: profileDescription || undefined,
      },
      archetypeName: archetypeName,
    };
    sessionStorage.setItem('compareProfiles', JSON.stringify(compareData));

    // Navigate to compare page
    navigate('/compare');
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

          {/* Compare Profiles button */}
          <div className="flex justify-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCompareWithArchetype(archetype.name)}
              className="gap-2"
            >
              <GitCompare className="w-4 h-4" />
              Compare Profiles
            </Button>
          </div>

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

          {/* Similar characters - click to compare */}
          {similarArchetypes.length > 0 && (
            <div className="pt-3 mt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Compare with similar:</p>
              <div className="flex flex-wrap gap-1.5">
                {similarArchetypes.map((similar) => {
                  const similarMatchPercent = Math.round(getMatchScore(scores, similar) * 100);
                  return (
                    <button
                      key={similar.name}
                      onClick={() => handleCompareWithArchetype(similar.name)}
                      className="px-2.5 py-1 text-xs rounded-full border border-border bg-background hover:bg-muted hover:border-primary/50 transition-colors cursor-pointer font-medium text-foreground"
                      title={`Compare your profile with ${similar.name}`}
                    >
                      {similar.name}
                      <span className="ml-1 text-muted-foreground">{similarMatchPercent}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
