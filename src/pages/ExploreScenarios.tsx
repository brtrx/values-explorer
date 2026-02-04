import { useState, useMemo } from 'react';
import { Users, Zap, Play, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ARCHETYPES, ARCHETYPE_CATEGORIES, Archetype } from '@/lib/archetypes';
import { SCHWARTZ_VALUES } from '@/lib/schwartz-values';
import { CARRIERS, VALUE_POLARITY_MAP, CarrierId, findBestCarriersForTension, getCarrierById } from '@/lib/carriers';
import { OverlappingSchwartzCircle } from '@/components/OverlappingSchwartzCircle';
import { ValueAbbreviation } from '@/components/ValueAbbreviation';
import { toast } from 'sonner';

const SCENARIO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-persona-scenario`;

// Predefined colors for the two personas
const PERSONA_COLORS = ['#3b82f6', '#ef4444'];

interface TensionLine {
  valueA: string;
  valueB: string;
  scoreDiff: number;
  carriers: Array<{ carrierId: CarrierId; polarityDiff: number }>;
}

export default function ExploreScenarios() {
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedCarriers, setSelectedCarriers] = useState<CarrierId[]>([]);
  const [scenario, setScenario] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['fictional']);

  // Weight to score mapping: -3 to 3 range → 0.5 to 6.5 (0-7 scale)
  const weightToScore = (weight: number) => {
    const mapping: Record<number, number> = {
      [-3]: 0.5, [-2]: 1.5, [-1]: 2.5, [0]: 3.5, [1]: 4.5, [2]: 5.5, [3]: 6.5,
    };
    return mapping[weight] ?? 3.5;
  };

  // Get archetype data for selected personas
  const personaData = useMemo(() => {
    return selectedPersonas.map((name, index) => {
      const archetype = ARCHETYPES.find(a => a.name === name);
      if (!archetype) return null;
      
      // Convert valueProfile (-3 to 3) to scores (0-7 scale)
      const scores: Record<string, number> = {};
      SCHWARTZ_VALUES.forEach(v => {
        const weight = archetype.valueProfile[v.code] ?? 0;
        scores[v.code] = weightToScore(weight);
      });
      
      return {
        name: archetype.name,
        description: archetype.description,
        valueProfile: archetype.valueProfile,
        scores,
        color: PERSONA_COLORS[index],
      };
    }).filter(Boolean) as Array<{
      name: string;
      description: string;
      valueProfile: Record<string, number>;
      scores: Record<string, number>;
      color: string;
    }>;
  }, [selectedPersonas]);

  // Calculate top tension lines between the two personas
  // Calculate geometric position on circumplex for a value
  const getValuePosition = (valueIndex: number, score: number) => {
    const angleStep = (2 * Math.PI) / SCHWARTZ_VALUES.length;
    const startAngle = -Math.PI / 2;
    const angle = startAngle + valueIndex * angleStep;
    // Convert -3 to 3 score range to radius (0-7 display range)
    const displayScore = score + 3.5;
    const radius = displayScore / 7;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  };

  // Calculate Euclidean distance between two points
  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const tensionLines = useMemo(() => {
    if (personaData.length !== 2) return [];
    
    const [persona1, persona2] = personaData;
    const tensions: TensionLine[] = [];
    
    // Calculate BETWEEN-PERSONA tensions, not geometric opposition
    // A real tension is when persona1 is high on valueA while persona2 is high on valueB
    // AND these values are conceptually opposed (different areas of the circumplex)
    SCHWARTZ_VALUES.forEach((valueA, indexA) => {
      SCHWARTZ_VALUES.forEach((valueB, indexB) => {
        if (indexA >= indexB) return; // Avoid duplicates
        
        const score1A = persona1.valueProfile[valueA.code] ?? 0;
        const score1B = persona1.valueProfile[valueB.code] ?? 0;
        const score2A = persona2.valueProfile[valueA.code] ?? 0;
        const score2B = persona2.valueProfile[valueB.code] ?? 0;
        
        // Cross-preference tension: persona1 prefers A over B, persona2 prefers B over A
        // Calculate how much persona1 leans toward A and persona2 leans toward B
        const persona1PreferenceForA = score1A - score1B; // positive = prefers A
        const persona2PreferenceForB = score2B - score2A; // positive = prefers B
        
        // Both should be positive for a true cross-preference tension
        // The tension magnitude is the product of these preferences
        const crossPreferenceTension = persona1PreferenceForA * persona2PreferenceForB;
        
        // Also consider direct score divergence: persona1 high on A, persona2 low on A
        // AND persona1 low on B, persona2 high on B
        const divergenceA = score1A - score2A; // positive = persona1 higher on A
        const divergenceB = score2B - score1B; // positive = persona2 higher on B
        const directDivergenceTension = (divergenceA + divergenceB) / 2;
        
        // Combined tension score: cross-preference + direct divergence
        const combinedTension = Math.max(0, crossPreferenceTension) + Math.max(0, directDivergenceTension * 2);
        
        // Only consider significant tensions
        if (combinedTension > 1.0) {
          const carrierImpacts = findBestCarriersForTension(valueA.code, valueB.code, 3);
          
          tensions.push({
            valueA: valueA.code,
            valueB: valueB.code,
            scoreDiff: combinedTension,
            carriers: carrierImpacts.map(c => ({
              carrierId: c.carrier.id as CarrierId,
              polarityDiff: c.polarityDiff,
            })),
          });
        }
      });
    });
    
    // Sort by tension score and take top 3
    return tensions
      .sort((a, b) => b.scoreDiff - a.scoreDiff)
      .slice(0, 3);
  }, [personaData]);

  // Get all carriers that impact the tensions
  const impactingCarriers = useMemo(() => {
    const carrierMap = new Map<CarrierId, { carrier: typeof CARRIERS[CarrierId]; tensions: string[] }>();
    
    tensionLines.forEach(tension => {
      tension.carriers.forEach(({ carrierId }) => {
        const carrier = CARRIERS[carrierId];
        if (carrier) {
          if (!carrierMap.has(carrierId)) {
            carrierMap.set(carrierId, { carrier, tensions: [] });
          }
          carrierMap.get(carrierId)!.tensions.push(`${tension.valueA} vs ${tension.valueB}`);
        }
      });
    });
    
    return Array.from(carrierMap.entries()).map(([id, data]) => ({
      id,
      ...data,
    }));
  }, [tensionLines]);

  const togglePersona = (name: string) => {
    setSelectedPersonas(prev => {
      if (prev.includes(name)) {
        return prev.filter(n => n !== name);
      }
      if (prev.length >= 2) {
        return [prev[1], name]; // Replace oldest selection
      }
      return [...prev, name];
    });
    // Reset carriers when personas change
    setSelectedCarriers([]);
    setScenario('');
  };

  const toggleCarrier = (carrierId: CarrierId) => {
    setSelectedCarriers(prev => 
      prev.includes(carrierId) 
        ? prev.filter(c => c !== carrierId)
        : [...prev, carrierId]
    );
  };

  const selectAllCarriers = () => {
    setSelectedCarriers(impactingCarriers.map(c => c.id));
  };

  const generateScenario = async () => {
    if (personaData.length !== 2 || selectedCarriers.length === 0) {
      toast.error('Select 2 personas and at least 1 carrier');
      return;
    }

    setIsGenerating(true);
    setScenario('');

    try {
      const carriers = selectedCarriers.map(id => {
        const carrier = CARRIERS[id];
        return {
          id,
          name: carrier.name,
          description: carrier.description,
        };
      });

      const tensions = tensionLines
        .filter(t => t.carriers.some(c => selectedCarriers.includes(c.carrierId)))
        .map(t => ({
          valueA: SCHWARTZ_VALUES.find(v => v.code === t.valueA)?.label || t.valueA,
          valueB: SCHWARTZ_VALUES.find(v => v.code === t.valueB)?.label || t.valueB,
          carrier: t.carriers.find(c => selectedCarriers.includes(c.carrierId))?.carrierId || '',
          explanation: `${personaData[0].name} values ${t.valueA} while ${personaData[1].name} values ${t.valueB}`,
        }));

      const response = await fetch(SCENARIO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personas: personaData.map(p => ({
            name: p.name,
            description: p.description,
            valueProfile: p.valueProfile,
          })),
          carriers,
          tensions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 402) {
          toast.error('AI credits exhausted.');
        } else {
          toast.error(error.error || 'Failed to generate scenario');
        }
        setIsGenerating(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                setScenario(prev => prev + content);
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('Scenario generation error:', error);
      toast.error('Failed to generate scenario');
    } finally {
      setIsGenerating(false);
    }
  };

  const archetypesByCategory = useMemo(() => {
    return ARCHETYPE_CATEGORIES.map(cat => ({
      ...cat,
      archetypes: ARCHETYPES.filter(a => a.category === cat.value),
    }));
  }, []);

  const renderScenario = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-bold text-primary mt-6 mb-3 first:mt-0">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.trim() === '') {
        return <br key={idx} />;
      }
      return (
        <p key={idx} className="text-muted-foreground leading-relaxed mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        title="Explore Scenarios"
        description="Compare personas and generate conflict scenarios"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Persona Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select Two Personas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {archetypesByCategory.map(category => (
                  <Collapsible
                    key={category.value}
                    open={expandedCategories.includes(category.value)}
                    onOpenChange={(open) => {
                      setExpandedCategories(prev => 
                        open ? [...prev, category.value] : prev.filter(c => c !== category.value)
                      );
                    }}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left">
                      <span className="font-medium">{category.label}</span>
                      {expandedCategories.includes(category.value) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {category.archetypes.map(archetype => {
                          const isSelected = selectedPersonas.includes(archetype.name);
                          const personaIndex = selectedPersonas.indexOf(archetype.name);
                          return (
                            <button
                              key={archetype.name}
                              onClick={() => togglePersona(archetype.name)}
                              className={`
                                p-2 rounded-md text-left text-sm transition-all border
                                ${isSelected 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-border hover:border-primary/50'}
                              `}
                              style={isSelected ? { borderColor: PERSONA_COLORS[personaIndex] } : undefined}
                            >
                              <div className="font-medium flex items-center gap-2">
                                {isSelected && (
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: PERSONA_COLORS[personaIndex] }}
                                  />
                                )}
                                {archetype.name}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            {/* Selected Personas Summary */}
            {personaData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Personas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {personaData.map((persona, idx) => (
                    <div 
                      key={persona.name}
                      className="p-3 rounded-lg border"
                      style={{ borderColor: persona.color }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: persona.color }}
                        />
                        <span className="font-medium">{persona.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{persona.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Visualization & Analysis */}
          <div className="space-y-6">
            {/* Spider Diagram */}
            {personaData.length === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Value Comparison</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <OverlappingSchwartzCircle
                    archetypes={personaData}
                    size={340}
                    tensionLines={tensionLines}
                  />
                </CardContent>
              </Card>
            )}

            {/* Tension Lines */}
            {tensionLines.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Top Value Tensions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tensionLines.map((tension, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2 mb-1">
                        <ValueAbbreviation code={tension.valueA} />
                        <span className="text-muted-foreground">vs</span>
                        <ValueAbbreviation code={tension.valueB} />
                        <span className="ml-auto text-xs text-muted-foreground">
                          Tension: {tension.scoreDiff.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Amplified by: {tension.carriers.map(c => 
                          CARRIERS[c.carrierId]?.name
                        ).filter(Boolean).join(', ')}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Impacting Carriers */}
            {impactingCarriers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Select Carriers for Scenario</span>
                    <Button variant="ghost" size="sm" onClick={selectAllCarriers}>
                      Select All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {impactingCarriers.map(({ id, carrier, tensions }) => (
                    <label 
                      key={id}
                      className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedCarriers.includes(id)}
                        onCheckedChange={() => toggleCarrier(id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{carrier.name}</div>
                        <p className="text-sm text-muted-foreground">{carrier.description}</p>
                        <p className="text-xs text-primary mt-1">
                          Aggravates: {tensions.join(', ')}
                        </p>
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Generate Button */}
            {personaData.length === 2 && (
              <Button
                onClick={generateScenario}
                disabled={isGenerating || selectedCarriers.length === 0}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Scenario...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Conflict Scenario
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Generated Scenario */}
        {(scenario || isGenerating) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Generated Scenario</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              {scenario ? renderScenario(scenario) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Placeholder when nothing selected */}
        {personaData.length < 2 && (
          <div className="mt-8 text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select two personas to compare their value systems and generate conflict scenarios.</p>
          </div>
        )}
      </div>
    </div>
  );
}
