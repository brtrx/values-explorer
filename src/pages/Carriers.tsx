import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Info, Zap, TrendingUp, Minus, ChevronDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SCHWARTZ_VALUES, HIGHER_ORDER_VALUES, HigherOrderValue, getValueByCode } from '@/lib/schwartz-values';
import { 
  CARRIERS, 
  CARRIER_IDS, 
  VALUE_POLARITY_MAP, 
  findBestCarriersForTension,
  CarrierId,
  getPolarity,
} from '@/lib/carriers';
import { getPolarityExplanation } from '@/lib/polarity-explanations';
import { ValueAbbreviation } from '@/components/ValueAbbreviation';
import { cn } from '@/lib/utils';

function getPolarityColor(polarity: number): string {
  if (polarity >= 0.7) return 'bg-emerald-500';
  if (polarity >= 0.3) return 'bg-emerald-300';
  if (polarity > 0.1) return 'bg-emerald-200';
  if (polarity >= -0.1) return 'bg-muted';
  if (polarity >= -0.3) return 'bg-rose-200';
  if (polarity >= -0.7) return 'bg-rose-300';
  return 'bg-rose-500';
}

function getPolarityTextColor(polarity: number): string {
  if (Math.abs(polarity) >= 0.7) return 'text-white';
  return 'text-foreground';
}

function PolarityCell({ polarity, valueCode, carrierId }: { polarity: number; valueCode: string; carrierId: CarrierId }) {
  const [open, setOpen] = useState(false);
  const value = getValueByCode(valueCode);
  const carrier = CARRIERS[carrierId];
  const explanation = getPolarityExplanation(valueCode, carrierId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'w-full h-8 flex items-center justify-center text-xs font-medium rounded cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-1 transition-all',
            getPolarityColor(polarity),
            getPolarityTextColor(polarity)
          )}
          onClick={() => setOpen(true)}
        >
          {polarity > 0 ? '+' : ''}{polarity.toFixed(1)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="top">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{value?.label ?? valueCode}</p>
              <p className="text-xs text-muted-foreground">{carrier.name}</p>
            </div>
            <div className={cn(
              'px-2 py-1 rounded text-sm font-bold',
              getPolarityColor(polarity),
              getPolarityTextColor(polarity)
            )}>
              {polarity > 0 ? '+' : ''}{polarity.toFixed(1)}
            </div>
          </div>
          {explanation && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {explanation}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function generateTensionExplanation(
  valueCodeA: string,
  valueCodeB: string,
  carrierId: CarrierId
): string {
  const carrier = CARRIERS[carrierId];
  const valueA = getValueByCode(valueCodeA);
  const valueB = getValueByCode(valueCodeB);
  const polarityA = getPolarity(valueCodeA, carrierId) ?? 0;
  const polarityB = getPolarity(valueCodeB, carrierId) ?? 0;
  const explanationA = getPolarityExplanation(valueCodeA, carrierId);
  const explanationB = getPolarityExplanation(valueCodeB, carrierId);
  const diff = Math.abs(polarityA - polarityB);

  if (!valueA || !valueB) return '';

  const describePolarity = (p: number) => {
    if (p >= 0.7) return 'strongly satisfied';
    if (p >= 0.3) return 'moderately satisfied';
    if (p > 0.1) return 'slightly satisfied';
    if (p >= -0.1) return 'largely unaffected';
    if (p >= -0.3) return 'slightly frustrated';
    if (p >= -0.7) return 'moderately frustrated';
    return 'strongly frustrated';
  };

  const aEffect = describePolarity(polarityA);
  const bEffect = describePolarity(polarityB);

  // Build a richer explanation using the polarity explanations
  let explanation = '';
  
  if (diff >= 1.2) {
    explanation = `This carrier creates **high tension** because the two values respond in opposite ways when ${carrier.name.toLowerCase()} increases.`;
  } else if (diff >= 0.7) {
    explanation = `This carrier creates **moderate tension**. The two values respond differently to changes in ${carrier.name.toLowerCase()}.`;
  } else {
    explanation = `This carrier creates **weak tension** because both values respond similarly to ${carrier.name.toLowerCase()}.`;
  }

  explanation += `\n\n**${valueA.label}** (${polarityA > 0 ? '+' : ''}${polarityA.toFixed(1)}): ${explanationA || `Is ${aEffect} when this carrier increases.`}`;
  explanation += `\n\n**${valueB.label}** (${polarityB > 0 ? '+' : ''}${polarityB.toFixed(1)}): ${explanationB || `Is ${bEffect} when this carrier increases.`}`;

  return explanation;
}

function TensionResult({ 
  carrierId, 
  polarityDiff,
  valueCodeA,
  valueCodeB,
}: { 
  carrierId: CarrierId; 
  polarityDiff: number;
  valueCodeA: string;
  valueCodeB: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const carrier = CARRIERS[carrierId];
  const absDiff = Math.abs(polarityDiff);
  const explanation = generateTensionExplanation(valueCodeA, valueCodeB, carrierId);
  const valueA = getValueByCode(valueCodeA);
  const valueB = getValueByCode(valueCodeB);

  // Parse markdown-like bold syntax
  const formatExplanation = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div id={`carrier-${carrierId}`} className="rounded-lg border bg-card overflow-hidden scroll-mt-24">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold shrink-0',
              absDiff >= 1.5 ? 'bg-rose-500 text-white' :
              absDiff >= 1.0 ? 'bg-amber-400 text-amber-900' :
              absDiff >= 0.5 ? 'bg-yellow-200 text-yellow-800' :
              'bg-muted text-muted-foreground'
            )}>
              {absDiff.toFixed(1)}
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-semibold">{carrier.name}</h4>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {absDiff >= 1.2 ? (
                <span className="flex items-center gap-1 text-sm text-rose-600 font-medium">
                  <Zap className="w-4 h-4" /> High
                </span>
              ) : absDiff >= 0.7 ? (
                <span className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                  <TrendingUp className="w-4 h-4" /> Moderate
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Minus className="w-4 h-4" /> Weak
                </span>
              )}
              <ChevronDown className={cn(
                "w-5 h-5 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )} />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 border-t">
            <div className="pt-4 space-y-4">
              {/* Explanation */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Impact on {valueA?.label} vs {valueB?.label} tension
                </h5>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  {explanation.split('\n\n').map((para, i) => (
                    <p key={i}>{formatExplanation(para)}</p>
                  ))}
                </div>
              </div>

              {/* Link to carrier details */}
              <a 
                href={`#carrier-list-${carrierId}`} 
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ArrowUp className="w-4 h-4" />
                View full carrier description & parameters
              </a>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function Carriers() {
  const [selectedValueA, setSelectedValueA] = useState<string>('');
  const [selectedValueB, setSelectedValueB] = useState<string>('');
  
  const tensionResults = useMemo(() => {
    if (!selectedValueA || !selectedValueB || selectedValueA === selectedValueB) {
      return [];
    }
    return findBestCarriersForTension(selectedValueA, selectedValueB, 12);
  }, [selectedValueA, selectedValueB]);

  const valuesByQuadrant = useMemo(() => {
    const quadrants: Record<HigherOrderValue, typeof SCHWARTZ_VALUES> = {
      'openness': [],
      'self-enhancement': [],
      'conservation': [],
      'self-transcendence': [],
    };
    SCHWARTZ_VALUES.forEach(v => {
      quadrants[v.higherOrderValue].push(v);
    });
    return quadrants;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-2xl font-bold">Carriers & Polarity</h1>
            <p className="text-sm text-muted-foreground">
              Decision-space primitives that expose value tensions
            </p>
          </div>
        </div>
      </header>

      {/* Conceptual Overview */}
      <section className="py-12 border-b">
        <div className="container max-w-4xl">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2 className="font-serif text-3xl font-bold mb-6">Understanding Carriers</h2>
            
            <div className="grid md:grid-cols-2 gap-6 not-prose mb-8">
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="font-serif text-lg font-semibold mb-2 text-primary">Motivation Space</h3>
                <p className="text-muted-foreground">
                  <strong>Schwartz values</strong> describe what people care about — their underlying motivations. 
                  But values alone don't predict behavior.
                </p>
              </div>
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="font-serif text-lg font-semibold mb-2 text-primary">Decision Space</h3>
                <p className="text-muted-foreground">
                  <strong>Carriers</strong> are forms of scarcity or constraint that force tradeoffs. 
                  They make latent value differences behaviorally visible.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-muted/50 border not-prose">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-2">Why Carriers Matter</p>
                  <p className="text-sm text-muted-foreground">
                    Without a relevant carrier, two people with very different values may behave identically — 
                    no scarcity means no forced choice. Carriers are the "pressure" that reveals what people truly prioritize.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 12 Carriers */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container">
          <h2 className="font-serif text-3xl font-bold mb-8">The 12 Carriers</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CARRIER_IDS.map(id => {
              const carrier = CARRIERS[id];
              return (
                <div key={id} id={`carrier-list-${id}`} className="p-5 rounded-xl border bg-card scroll-mt-24">
                  <h3 className="font-serif text-lg font-semibold mb-2">{carrier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{carrier.description}</p>
                  <div className="space-y-2">
                    {carrier.parameters.map(param => (
                      <div key={param.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{param.lowLabel}</span>
                        <span className="px-2 py-0.5 rounded bg-muted font-medium">{param.name}</span>
                        <span className="text-muted-foreground">{param.highLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Polarity Heatmap */}
      <section className="py-12 border-b">
        <div className="container">
          <h2 className="font-serif text-3xl font-bold mb-4">Polarity Heatmap</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Each cell shows how increasing a carrier's intensity tends to <span className="text-emerald-600 font-medium">satisfy (+)</span> or{' '}
            <span className="text-rose-600 font-medium">frustrate (-)</span> a value.
          </p>

          <div className="overflow-x-auto pb-4">
            <table className="w-full border-collapse min-w-[1200px]">
              <thead>
                <tr>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground sticky left-0 bg-background z-10">
                    Value
                  </th>
                  {CARRIER_IDS.map(id => (
                    <th key={id} className="p-2 text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs font-medium text-muted-foreground cursor-help whitespace-nowrap">
                            {CARRIERS[id].name.split(' / ')[0]}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="font-semibold">{CARRIERS[id].name}</p>
                          <p className="text-xs text-muted-foreground">{CARRIERS[id].description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(valuesByQuadrant) as HigherOrderValue[]).map(quadrant => (
                  <>
                    <tr key={`header-${quadrant}`}>
                      <td 
                        colSpan={CARRIER_IDS.length + 1} 
                        className="pt-6 pb-2 px-2 text-sm font-semibold"
                        style={{ color: `hsl(var(--${HIGHER_ORDER_VALUES[quadrant].color}))` }}
                      >
                        {HIGHER_ORDER_VALUES[quadrant].label}
                      </td>
                    </tr>
                    {valuesByQuadrant[quadrant].map(value => (
                      <tr key={value.code} className="hover:bg-muted/50">
                        <td className="p-2 sticky left-0 bg-background z-10">
                          <ValueAbbreviation code={value.code} className="text-sm" />
                        </td>
                        {CARRIER_IDS.map(carrierId => {
                          const polarity = VALUE_POLARITY_MAP[value.code]?.[carrierId] ?? 0;
                          return (
                            <td key={carrierId} className="p-1">
                              <PolarityCell polarity={polarity} valueCode={value.code} carrierId={carrierId} />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            <span className="text-sm text-muted-foreground mr-2">Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 rounded bg-rose-500" />
              <span className="text-xs">-1.0</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 rounded bg-rose-300" />
              <span className="text-xs">-0.5</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 rounded bg-muted border" />
              <span className="text-xs">0</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 rounded bg-emerald-300" />
              <span className="text-xs">+0.5</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 rounded bg-emerald-500" />
              <span className="text-xs">+1.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tension Analyzer */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <h2 className="font-serif text-3xl font-bold mb-4">Tension Analyzer</h2>
          <p className="text-muted-foreground mb-8">
            Select two values to see which carriers will most strongly expose the tension between them.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="text-sm font-medium mb-2 block">First Value</label>
              <Select value={selectedValueA} onValueChange={setSelectedValueA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a value..." />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(valuesByQuadrant) as HigherOrderValue[]).map(quadrant => (
                    <div key={quadrant}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {HIGHER_ORDER_VALUES[quadrant].label}
                      </div>
                      {valuesByQuadrant[quadrant].map(value => (
                        <SelectItem 
                          key={value.code} 
                          value={value.code}
                          disabled={value.code === selectedValueB}
                        >
                          {value.code} – {value.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Second Value</label>
              <Select value={selectedValueB} onValueChange={setSelectedValueB}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a value..." />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(valuesByQuadrant) as HigherOrderValue[]).map(quadrant => (
                    <div key={quadrant}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {HIGHER_ORDER_VALUES[quadrant].label}
                      </div>
                      {valuesByQuadrant[quadrant].map(value => (
                        <SelectItem 
                          key={value.code} 
                          value={value.code}
                          disabled={value.code === selectedValueA}
                        >
                          {value.code} – {value.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedValueA && selectedValueB && selectedValueA !== selectedValueB && (
            <div className="space-y-3">
              <h3 className="font-serif text-xl font-semibold mb-4">
                Carriers ranked by tension exposure
              </h3>
              {tensionResults.map(result => (
                <TensionResult 
                  key={result.carrier.id} 
                  carrierId={result.carrier.id} 
                  polarityDiff={result.polarityDiff}
                  valueCodeA={selectedValueA}
                  valueCodeB={selectedValueB}
                />
              ))}
            </div>
          )}

          {(!selectedValueA || !selectedValueB) && (
            <div className="text-center py-12 text-muted-foreground">
              <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select two values above to analyze which carriers expose their tension.</p>
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
