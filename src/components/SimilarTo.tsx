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

// Default character images - using placeholder avatars based on character archetype
const CHARACTER_IMAGES: Record<string, string> = {
  // Fictional Characters
  'Tony Stark': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=face',
  'Dumbledore': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face',
  'Hermione Granger': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop&crop=face',
  'Leslie Knope': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&h=240&fit=crop&crop=face',
  'Spock': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=face',
  'Forrest Gump': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=240&h=240&fit=crop&crop=face',
  'The Joker': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=face',
  'Yoda': 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=240&h=240&fit=crop&crop=face',
  'Daenerys Targaryen': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=face',
  'Ron Swanson': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&h=240&fit=crop&crop=face',
  'Elle Woods': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&crop=face',
  'Walter White': 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=240&h=240&fit=crop&crop=face',
  'Samwise Gamgee': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&h=240&fit=crop&crop=face',
  'Hannibal Lecter': 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=240&h=240&fit=crop&crop=face',
  'Mary Poppins': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=240&h=240&fit=crop&crop=face',
  'Jack Sparrow': 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=240&h=240&fit=crop&crop=face',
  
  // Historical Figures
  'Marcus Aurelius': 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=240&h=240&fit=crop&crop=face',
  'Leonardo da Vinci': 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=240&h=240&fit=crop&crop=face',
  'Florence Nightingale': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&h=240&fit=crop&crop=face',
  'Mahatma Gandhi': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face',
  'Cleopatra': 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=240&h=240&fit=crop&crop=face',
  'Albert Einstein': 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=240&h=240&fit=crop&crop=face',
  'Napoleon Bonaparte': 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=240&h=240&fit=crop&crop=face',
  'Mother Teresa': 'https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=240&h=240&fit=crop&crop=face',
  'Genghis Khan': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=face',
  'Marie Curie': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=240&h=240&fit=crop&crop=face',
  'Abraham Lincoln': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face',
  'Nikola Tesla': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=face',
  'Queen Victoria': 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=240&h=240&fit=crop&crop=face',
  'Benjamin Franklin': 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=240&h=240&fit=crop&crop=face',
  'Frida Kahlo': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&h=240&fit=crop&crop=face',
  'Winston Churchill': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&h=240&fit=crop&crop=face',
  
  // Superheroes
  'Captain America': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=face',
  'Wonder Woman': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=face',
  'Batman': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=face',
  'Spider-Man': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=face',
  "T'Challa (Black Panther)": 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=face',
  'Superman': 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=240&h=240&fit=crop&crop=face',
  'Magneto': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face',
};

// Fallback image for characters without a specific image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=240&h=240&fit=crop&crop=face';

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

  // Get the character image from our mapping, or use fallback
  const characterImage = CHARACTER_IMAGES[archetype.name] || FALLBACK_IMAGE;

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
          {/* Archetype image - static default image */}
          <div className="mb-4">
            <div className="aspect-square w-full max-w-[200px] mx-auto rounded-xl overflow-hidden bg-muted/50 border">
              <img 
                src={characterImage} 
                alt={`Portrait representing ${archetype.name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
              />
            </div>
          </div>

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
