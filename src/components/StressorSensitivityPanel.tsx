import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Zap, TrendingUp, ArrowUpDown, ArrowRight } from 'lucide-react';
import { ValueScores } from '@/lib/schwartz-values';
import {
  getTopSensitiveStressors,
  getTopInternalTensionStressors,
  StressorSensitivity,
  StressorInternalTension,
} from '@/lib/stressor-sensitivity';
import { STRESSORS, StressorId } from '@/lib/stressors';
import { ValueAbbreviation } from '@/components/ValueAbbreviation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface StressorSensitivityPanelProps {
  scores: ValueScores;
}

function SensitivityBar({ value, max }: { value: number; max: number }) {
  const percentage = Math.min(100, (Math.abs(value) / max) * 100);
  const isPositive = value >= 0;
  
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="w-16 text-right text-xs font-mono">
        {value > 0 ? '+' : ''}{value.toFixed(2)}
      </div>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all",
            isPositive ? "bg-emerald-500" : "bg-rose-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TopStressorCard({ sensitivity, maxSensitivity }: { 
  sensitivity: StressorSensitivity; 
  maxSensitivity: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isPositive = sensitivity.totalSensitivity >= 0;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-card overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            )}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="font-medium text-sm truncate">{sensitivity.stressorName}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                {STRESSORS[sensitivity.stressorId as StressorId]?.description}
              </p>
              <SensitivityBar value={sensitivity.totalSensitivity} max={maxSensitivity} />
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform shrink-0",
              isOpen && "rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 border-t">
            <div className="pt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Top Contributing Values:</p>
              <div className="space-y-1">
                {sensitivity.topContributors.slice(0, 3).map(contrib => (
                  <div key={contrib.valueCode} className="flex items-center gap-2 text-xs">
                    <ValueAbbreviation code={contrib.valueCode} className="text-xs" />
                    <span className="text-muted-foreground">
                      (weight: {contrib.weight > 0 ? '+' : ''}{contrib.weight.toFixed(2)}, 
                      polarity: {contrib.polarity > 0 ? '+' : ''}{contrib.polarity.toFixed(1)})
                    </span>
                    <span className={cn(
                      "ml-auto font-mono",
                      contrib.contribution > 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {contrib.contribution > 0 ? '+' : ''}{contrib.contribution.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function InternalTensionCard({ tension }: { tension: StressorInternalTension }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-card overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="font-medium text-sm truncate">{tension.stressorName}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                {STRESSORS[tension.stressorId as StressorId]?.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Range: {tension.range.toFixed(2)} (σ: {tension.standardDeviation.toFixed(3)})
              </p>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform shrink-0",
              isOpen && "rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 border-t">
            <div className="pt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Tension Extremes:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 font-medium">Highest</span>
                  <div className="flex items-center gap-1 mt-1">
                    <ValueAbbreviation code={tension.highestValue.code} className="text-xs" />
                    <span className="text-emerald-600 font-mono ml-auto">
                      +{tension.highestValue.weightedPolarity.toFixed(3)}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded bg-rose-50 border border-rose-200">
                  <span className="text-rose-700 font-medium">Lowest</span>
                  <div className="flex items-center gap-1 mt-1">
                    <ValueAbbreviation code={tension.lowestValue.code} className="text-xs" />
                    <span className="text-rose-600 font-mono ml-auto">
                      {tension.lowestValue.weightedPolarity.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This stressor creates internal conflict between your high and low priority values.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function StressorSensitivityPanel({ scores }: StressorSensitivityPanelProps) {
  const topStressors = useMemo(() => getTopSensitiveStressors(scores, 5), [scores]);
  const internalTensions = useMemo(() => getTopInternalTensionStressors(scores, 5), [scores]);
  
  const maxSensitivity = useMemo(() => {
    return Math.max(...topStressors.map(c => c.absoluteSensitivity), 0.1);
  }, [topStressors]);
  
  return (
    <div className="space-y-6">
      {/* Top Sensitive Stressors */}
      <div>
        <h3 className="font-serif text-lg font-semibold mb-2">
          Stressor Sensitivity
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          These stressors have the strongest effect on this profile. Positive values indicate 
          the stressor satisfies the profile's values; negative values indicate frustration.
        </p>
        <Link 
          to="/stressors" 
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4"
        >
          Explore Stressors
          <ArrowRight className="w-3 h-3" />
        </Link>
        <div className="space-y-2">
          {topStressors.map(sensitivity => (
            <TopStressorCard 
              key={sensitivity.stressorId} 
              sensitivity={sensitivity} 
              maxSensitivity={maxSensitivity}
            />
          ))}
        </div>
      </div>
      
      {/* Internal Stressors */}
      <div>
        <h3 className="font-serif text-lg font-semibold mb-2">
          Internal Stressors
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          These stressors create the most internal conflict within this profile—situations 
          where your high-priority values respond very differently.
        </p>
        <div className="space-y-2">
          {internalTensions.map(tension => (
            <InternalTensionCard key={tension.stressorId} tension={tension} />
          ))}
        </div>
      </div>
    </div>
  );
}
