import { useMemo, useState } from 'react';
import { ChevronDown, Zap, TrendingUp, ArrowUpDown } from 'lucide-react';
import { ValueScores } from '@/lib/schwartz-values';
import {
  getTopSensitiveCarriers,
  getTopInternalTensionCarriers,
  CarrierSensitivity,
  CarrierInternalTension,
} from '@/lib/carrier-sensitivity';
import { ValueAbbreviation } from '@/components/ValueAbbreviation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface CarrierSensitivityPanelProps {
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

function TopCarrierCard({ sensitivity, maxSensitivity }: { 
  sensitivity: CarrierSensitivity; 
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
              <h4 className="font-medium text-sm truncate">{sensitivity.carrierName}</h4>
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

function InternalTensionCard({ tension }: { tension: CarrierInternalTension }) {
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
              <h4 className="font-medium text-sm truncate">{tension.carrierName}</h4>
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
                This carrier creates internal conflict between your high and low priority values.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function CarrierSensitivityPanel({ scores }: CarrierSensitivityPanelProps) {
  const topCarriers = useMemo(() => getTopSensitiveCarriers(scores, 5), [scores]);
  const internalTensions = useMemo(() => getTopInternalTensionCarriers(scores, 5), [scores]);
  
  const maxSensitivity = useMemo(() => {
    return Math.max(...topCarriers.map(c => c.absoluteSensitivity), 0.1);
  }, [topCarriers]);
  
  return (
    <div className="space-y-6">
      {/* Top Sensitive Carriers */}
      <div>
        <h3 className="font-serif text-lg font-semibold mb-2">
          Carrier Sensitivity
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          These carriers have the strongest effect on this profile. Positive values indicate 
          the carrier satisfies the profile's values; negative values indicate frustration.
        </p>
        <div className="space-y-2">
          {topCarriers.map(sensitivity => (
            <TopCarrierCard 
              key={sensitivity.carrierId} 
              sensitivity={sensitivity} 
              maxSensitivity={maxSensitivity}
            />
          ))}
        </div>
      </div>
      
      {/* Internal Tension Carriers */}
      <div>
        <h3 className="font-serif text-lg font-semibold mb-2">
          Internal Tension Carriers
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          These carriers create the most internal conflict within this profile—situations 
          where your high-priority values respond very differently.
        </p>
        <div className="space-y-2">
          {internalTensions.map(tension => (
            <InternalTensionCard key={tension.carrierId} tension={tension} />
          ))}
        </div>
      </div>
    </div>
  );
}
