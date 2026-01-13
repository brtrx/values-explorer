import { useMemo, useState } from 'react';
import { ChevronDown, Swords, Users } from 'lucide-react';
import { ValueScores } from '@/lib/schwartz-values';
import {
  getTopProfileTensionCarriers,
  ProfileTensionCarrier,
} from '@/lib/carrier-sensitivity';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ProfileTensionCarriersProps {
  profiles: { name: string; scores: ValueScores }[];
}

function TensionBar({ value, max }: { value: number; max: number }) {
  const percentage = Math.min(100, (value / max) * 100);
  
  return (
    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function ProfileSensitivityDot({ 
  sensitivity, 
  max, 
  name 
}: { 
  sensitivity: number; 
  max: number; 
  name: string;
}) {
  // Map sensitivity to position: -max to +max → 0% to 100%
  const position = ((sensitivity + max) / (2 * max)) * 100;
  const isPositive = sensitivity >= 0;
  
  // Determine tooltip alignment based on position to prevent overflow
  const tooltipAlign = position < 30 ? 'left' : position > 70 ? 'right' : 'center';
  
  return (
    <div 
      className="absolute top-1/2 -translate-y-1/2 group"
      style={{ left: `${Math.max(0, Math.min(100, position))}%` }}
    >
      <div className={cn(
        "w-3 h-3 rounded-full border-2 border-background shadow-sm -translate-x-1/2",
        isPositive ? "bg-emerald-500" : "bg-rose-500"
      )} />
      <div className={cn(
        "absolute bottom-full mb-1 px-2 py-1 rounded bg-popover border shadow-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10",
        tooltipAlign === 'left' && "left-0",
        tooltipAlign === 'right' && "right-0",
        tooltipAlign === 'center' && "left-1/2 -translate-x-1/2"
      )}>
        {name}: {sensitivity > 0 ? '+' : ''}{sensitivity.toFixed(2)}
      </div>
    </div>
  );
}

function TensionCarrierCard({ 
  carrier, 
  maxTension,
  maxSensitivity,
}: { 
  carrier: ProfileTensionCarrier; 
  maxTension: number;
  maxSensitivity: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const tensionLevel = carrier.tensionScore >= maxTension * 0.7 ? 'high' 
    : carrier.tensionScore >= maxTension * 0.4 ? 'moderate' 
    : 'low';
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-card overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              tensionLevel === 'high' ? "bg-rose-100 text-rose-700" :
              tensionLevel === 'moderate' ? "bg-amber-100 text-amber-700" :
              "bg-muted text-muted-foreground"
            )}>
              <Swords className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="font-medium text-sm truncate">{carrier.carrierName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <TensionBar value={carrier.tensionScore} max={maxTension} />
                <span className="text-xs text-muted-foreground font-mono w-12 text-right">
                  {carrier.tensionScore.toFixed(2)}
                </span>
              </div>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform shrink-0",
              isOpen && "rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 border-t">
            <div className="pt-3 space-y-4">
              {/* Sensitivity spectrum */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Profile Sensitivities:
                </p>
                <div className="relative h-6 bg-gradient-to-r from-rose-100 via-muted to-emerald-100 rounded-full">
                  {/* Center line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
                  {/* Profile dots */}
                  {carrier.profileSensitivities.map((ps, i) => (
                    <ProfileSensitivityDot 
                      key={i}
                      name={ps.profileName}
                      sensitivity={ps.sensitivity}
                      max={maxSensitivity}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Frustrated</span>
                  <span>Neutral</span>
                  <span>Satisfied</span>
                </div>
              </div>
              
              {/* Most conflicting pair */}
              <div className="p-2 rounded bg-muted/50 border">
                <div className="flex items-center gap-2 text-xs">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Highest conflict:</span>
                  <span className="font-medium">
                    {carrier.conflictingProfiles[0]} vs {carrier.conflictingProfiles[1]}
                  </span>
                  <span className="text-muted-foreground ml-auto">
                    Δ{carrier.conflictMagnitude.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function ProfileTensionCarriers({ profiles }: ProfileTensionCarriersProps) {
  const tensionCarriers = useMemo(
    () => getTopProfileTensionCarriers(profiles, 6),
    [profiles]
  );
  
  const maxTension = useMemo(() => {
    return Math.max(...tensionCarriers.map(c => c.tensionScore), 0.1);
  }, [tensionCarriers]);
  
  const maxSensitivity = useMemo(() => {
    const allSensitivities = tensionCarriers.flatMap(c => 
      c.profileSensitivities.map(ps => Math.abs(ps.sensitivity))
    );
    return Math.max(...allSensitivities, 0.5);
  }, [tensionCarriers]);
  
  if (profiles.length < 2) {
    return null;
  }
  
  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="font-serif text-lg font-semibold mb-2">
        Tension-Amplifying Carriers
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        These carriers would most amplify conflicts between the selected profiles. 
        Scenarios involving these pressures will reveal the sharpest value differences.
      </p>
      <div className="space-y-2">
        {tensionCarriers.map(carrier => (
          <TensionCarrierCard 
            key={carrier.carrierId} 
            carrier={carrier} 
            maxTension={maxTension}
            maxSensitivity={maxSensitivity}
          />
        ))}
      </div>
    </div>
  );
}
