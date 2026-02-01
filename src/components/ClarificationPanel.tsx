import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2, RefreshCw, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ValueScores } from '@/lib/schwartz-values';
import {
  ConfidenceLevel,
  analyzeForClarification,
  calculateUpdatedScores,
  responseToStrength,
  CarrierSpreadInfo,
  UndecidedValue,
} from '@/lib/job-clarification';
import { CarrierId } from '@/lib/carriers';
import { toast } from 'sonner';

const CLARIFICATION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-clarification-scenarios`;

interface Scenario {
  carrierId: string;
  carrierName: string;
  setup: string;
  optionA: string;
  optionB: string;
  interpretationA: string;
  interpretationB: string;
}

interface ClarificationPanelProps {
  jobDescription: string;
  scores: ValueScores;
  confidence: Record<string, ConfidenceLevel>;
  onScoresUpdate: (newScores: ValueScores) => void;
}

type ResponseValue = 1 | 2 | 3 | 4 | 5;

export function ClarificationPanel({
  jobDescription,
  scores,
  confidence,
  onScoresUpdate,
}: ClarificationPanelProps) {
  const [maxCarriers, setMaxCarriers] = useState(4);
  const [minSpread, setMinSpread] = useState(0.8);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingCarrier, setRegeneratingCarrier] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Analyze the job description results
  const analysis = useMemo(
    () => analyzeForClarification(scores, confidence, maxCarriers, minSpread),
    [scores, confidence, maxCarriers, minSpread]
  );

  // Calculate preview of updated scores based on current responses
  const previewScores = useMemo(() => {
    if (Object.keys(responses).length === 0) return null;

    let updatedScores = { ...scores };
    const undecidedCodes = analysis.undecidedValues.map(v => v.code);

    for (const [carrierId, response] of Object.entries(responses)) {
      const strength = responseToStrength(response);
      updatedScores = calculateUpdatedScores(
        updatedScores,
        carrierId as CarrierId,
        strength,
        undecidedCodes
      );
    }

    return updatedScores;
  }, [responses, scores, analysis.undecidedValues]);

  const generateScenarios = async () => {
    if (!analysis.canClarify) return;

    setIsGenerating(true);
    setScenarios([]);
    setResponses({});

    try {
      const response = await fetch(CLARIFICATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          jobDescription,
          carriers: analysis.selectedCarriers.map(c => ({
            carrierId: c.carrierId,
            carrierName: c.carrierName,
            carrierDescription: c.carrierDescription,
            highPolarityValues: c.highPolarityValues,
            lowPolarityValues: c.lowPolarityValues,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate scenarios');
        return;
      }

      const data = await response.json();
      setScenarios(data.scenarios || []);
    } catch (error) {
      console.error('Failed to generate scenarios:', error);
      toast.error('Failed to generate scenarios');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateScenario = async (carrierId: string) => {
    const carrier = analysis.selectedCarriers.find(c => c.carrierId === carrierId);
    if (!carrier) return;

    setRegeneratingCarrier(carrierId);

    try {
      const response = await fetch(CLARIFICATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          jobDescription,
          carriers: [{
            carrierId: carrier.carrierId,
            carrierName: carrier.carrierName,
            carrierDescription: carrier.carrierDescription,
            highPolarityValues: carrier.highPolarityValues,
            lowPolarityValues: carrier.lowPolarityValues,
          }],
        }),
      });

      if (!response.ok) {
        toast.error('Failed to regenerate scenario');
        return;
      }

      const data = await response.json();
      const newScenario = data.scenarios?.[0];

      if (newScenario) {
        setScenarios(prev =>
          prev.map(s => (s.carrierId === carrierId ? newScenario : s))
        );
        // Clear response for this carrier since scenario changed
        setResponses(prev => {
          const updated = { ...prev };
          delete updated[carrierId];
          return updated;
        });
      }
    } catch (error) {
      toast.error('Failed to regenerate scenario');
    } finally {
      setRegeneratingCarrier(null);
    }
  };

  const handleResponse = (carrierId: string, value: ResponseValue) => {
    setResponses(prev => ({ ...prev, [carrierId]: value }));
  };

  const applyUpdatedScores = () => {
    if (previewScores) {
      onScoresUpdate(previewScores);
      toast.success('Value scores updated based on your responses');
    }
  };

  // Polarity color helper
  const getPolarityColor = (polarity: number): string => {
    if (polarity >= 0.5) return 'bg-green-500/20 text-green-700';
    if (polarity >= 0.2) return 'bg-green-500/10 text-green-600';
    if (polarity <= -0.5) return 'bg-red-500/20 text-red-700';
    if (polarity <= -0.2) return 'bg-red-500/10 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };

  if (!analysis.canClarify) {
    return (
      <section className="rounded-xl border bg-card p-6">
        <h2 className="font-serif text-xl font-semibold mb-4">Clarify Uncertain Values</h2>
        <p className="text-sm text-muted-foreground">{analysis.reason}</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Clarify Uncertain Values</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowExplanation(!showExplanation)}
          className="gap-1"
        >
          <HelpCircle className="w-4 h-4" />
          How it works
          {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Algorithm explanation */}
      {showExplanation && (
        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground space-y-2">
          <p>
            <strong>The problem:</strong> Job descriptions often don't clearly specify which values
            the role prioritizes. Values marked "medium" or "unspecified" confidence need clarification.
          </p>
          <p>
            <strong>The solution:</strong> We identify "tension carriers" - situational dimensions
            that force trade-offs between different values. By presenting scenarios that activate
            these carriers, we can infer which values the role actually emphasizes.
          </p>
          <p>
            <strong>How carriers are selected:</strong> For each carrier, we calculate its "spread" -
            how much the undecided values differ in their response to that carrier. Higher spread
            means the carrier better differentiates between values. We select carriers with the
            highest spread.
          </p>
          <p>
            <strong>How scores update:</strong> When you respond to a scenario, values with positive
            polarity on that carrier increase, while values with negative polarity decrease.
            The strength of your response (strongly/somewhat) determines the magnitude.
          </p>
        </div>
      )}

      {/* Configuration sliders */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Maximum carriers</span>
            <span className="font-medium">{maxCarriers}</span>
          </div>
          <Slider
            value={[maxCarriers]}
            onValueChange={([v]) => setMaxCarriers(v)}
            min={1}
            max={4}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Minimum spread threshold</span>
            <span className="font-medium">{minSpread.toFixed(1)}</span>
          </div>
          <Slider
            value={[minSpread]}
            onValueChange={([v]) => setMinSpread(v)}
            min={0.4}
            max={1.4}
            step={0.1}
          />
        </div>
      </div>

      {/* Undecided values summary */}
      <div>
        <h3 className="text-sm font-medium mb-2">
          Undecided Values ({analysis.undecidedValues.length})
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {analysis.undecidedValues.map(v => (
            <span
              key={v.code}
              className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800"
              title={`Confidence: ${v.confidence}`}
            >
              {v.label}
            </span>
          ))}
        </div>
      </div>

      {/* Polarity matrix - showing our work */}
      <div>
        <h3 className="text-sm font-medium mb-2">
          Value × Carrier Polarity Matrix
          <span className="font-normal text-muted-foreground ml-2">
            (spread shown in header)
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b">Value</th>
                {analysis.selectedCarriers.map(c => (
                  <th key={c.carrierId} className="p-2 border-b text-center">
                    <div>{c.carrierName}</div>
                    <div className="text-muted-foreground font-normal">
                      spread: {c.spread.toFixed(2)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysis.undecidedValues.map(value => (
                <tr key={value.code}>
                  <td className="p-2 border-b font-medium">{value.label}</td>
                  {analysis.selectedCarriers.map(carrier => {
                    const polarityInfo = carrier.allPolarities.find(p => p.code === value.code);
                    const polarity = polarityInfo?.polarity ?? 0;
                    return (
                      <td key={carrier.carrierId} className="p-2 border-b text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded ${getPolarityColor(polarity)}`}
                        >
                          {polarity >= 0 ? '+' : ''}{polarity.toFixed(1)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate button */}
      {scenarios.length === 0 && (
        <Button
          onClick={generateScenarios}
          disabled={isGenerating}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Scenarios...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Clarifying Scenarios
            </>
          )}
        </Button>
      )}

      {/* Scenarios */}
      {scenarios.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Clarifying Scenarios</h3>

          {scenarios.map(scenario => {
            const carrier = analysis.selectedCarriers.find(
              c => c.carrierId === scenario.carrierId
            );
            const currentResponse = responses[scenario.carrierId];

            return (
              <Card key={scenario.carrierId} className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-primary">{scenario.carrierName}</h4>
                    <p className="text-xs text-muted-foreground">
                      Differentiates:{' '}
                      {carrier?.highPolarityValues.map(v => v.label).join(', ') || 'values'}
                      {' vs '}
                      {carrier?.lowPolarityValues.map(v => v.label).join(', ') || 'values'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => regenerateScenario(scenario.carrierId)}
                    disabled={regeneratingCarrier === scenario.carrierId}
                  >
                    {regeneratingCarrier === scenario.carrierId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <p className="text-sm">{scenario.setup}</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="text-xs font-medium text-green-800 mb-1">Option A</div>
                    <p className="text-sm text-green-900">{scenario.optionA}</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3">
                    <div className="text-xs font-medium text-red-800 mb-1">Option B</div>
                    <p className="text-sm text-red-900">{scenario.optionB}</p>
                  </div>
                </div>

                {/* 5-point response scale */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">
                    Which approach do you think this role would favor?
                  </p>
                  <div className="flex justify-center gap-1">
                    {([1, 2, 3, 4, 5] as const).map(value => {
                      const labels = {
                        1: 'Strongly A',
                        2: 'Somewhat A',
                        3: 'Equal',
                        4: 'Somewhat B',
                        5: 'Strongly B',
                      };
                      const isSelected = currentResponse === value;

                      return (
                        <button
                          key={value}
                          onClick={() => handleResponse(scenario.carrierId, value)}
                          className={`px-3 py-1.5 text-xs rounded transition-colors ${
                            isSelected
                              ? value <= 2
                                ? 'bg-green-600 text-white'
                                : value >= 4
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-600 text-white'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {labels[value]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Show interpretation based on response */}
                {currentResponse && (
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      currentResponse <= 2
                        ? 'bg-green-100 text-green-800'
                        : currentResponse >= 4
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {currentResponse <= 2
                      ? scenario.interpretationA
                      : currentResponse >= 4
                      ? scenario.interpretationB
                      : 'No strong preference indicates the role may be flexible on these values.'}
                  </div>
                )}
              </Card>
            );
          })}

          {/* Score update preview and apply button */}
          {Object.keys(responses).length > 0 && previewScores && (
            <Card className="p-4 space-y-4 border-primary/50">
              <h4 className="font-medium">Score Update Preview</h4>
              <p className="text-xs text-muted-foreground">
                Based on your {Object.keys(responses).length} response(s), these undecided values
                would be adjusted:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {analysis.undecidedValues.map(v => {
                  const oldScore = scores[v.code] ?? 3.5;
                  const newScore = previewScores[v.code] ?? 3.5;
                  const delta = newScore - oldScore;

                  if (Math.abs(delta) < 0.1) return null;

                  return (
                    <div key={v.code} className="flex items-center gap-2">
                      <span className="truncate">{v.label}</span>
                      <span className="text-muted-foreground">{oldScore.toFixed(1)}</span>
                      <span>→</span>
                      <span
                        className={
                          delta > 0
                            ? 'text-green-600 font-medium'
                            : 'text-red-600 font-medium'
                        }
                      >
                        {newScore.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Button onClick={applyUpdatedScores} className="w-full">
                Apply Updated Scores
              </Button>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
