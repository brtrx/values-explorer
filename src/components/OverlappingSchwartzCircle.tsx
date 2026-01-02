import { useMemo } from 'react';
import { 
  ValueScores, 
  SCHWARTZ_VALUES,
  HIGHER_ORDER_VALUES,
  HigherOrderValue,
  getValueByCode
} from '@/lib/schwartz-values';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ArchetypeData {
  name: string;
  scores: ValueScores;
  color: string;
}

interface OverlappingSchwartzCircleProps {
  archetypes: ArchetypeData[];
  size?: number;
}

const ARCHETYPE_COLORS = [
  'hsl(220, 70%, 55%)',
  'hsl(350, 70%, 55%)',
  'hsl(160, 60%, 45%)',
  'hsl(45, 80%, 50%)',
  'hsl(280, 60%, 55%)',
];

export function OverlappingSchwartzCircle({ archetypes, size = 360 }: OverlappingSchwartzCircleProps) {
  const center = size / 2;
  const maxRadius = (size / 2) - 50;
  const minRadius = 15;
  const labelRadius = maxRadius + 30;

  const scoreToRadius = (score: number) => {
    const normalized = score / 7;
    return minRadius + normalized * (maxRadius - minRadius);
  };

  // Calculate radar paths for each archetype
  const archetypePaths = useMemo(() => {
    const angleStep = (2 * Math.PI) / SCHWARTZ_VALUES.length;
    const startAngle = -Math.PI / 2;

    return archetypes.map((archetype, archetypeIndex) => {
      const positions = SCHWARTZ_VALUES.map((value, index) => {
        const angle = startAngle + index * angleStep;
        const score = archetype.scores[value.code] ?? 3.5;
        const radius = scoreToRadius(score);
        
        return {
          x: center + radius * Math.cos(angle),
          y: center + radius * Math.sin(angle),
        };
      });

      const pathData = positions.map((p, i) => 
        `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
      ).join(' ') + ' Z';

      return {
        ...archetype,
        path: pathData,
        color: ARCHETYPE_COLORS[archetypeIndex % ARCHETYPE_COLORS.length],
        positions,
      };
    });
  }, [archetypes, center]);

  // Generate axis lines and labels
  const axisData = useMemo(() => {
    const angleStep = (2 * Math.PI) / SCHWARTZ_VALUES.length;
    const startAngle = -Math.PI / 2;
    
    return SCHWARTZ_VALUES.map((value, index) => {
      const angle = startAngle + index * angleStep;
      
      let textAnchor: 'start' | 'middle' | 'end' = 'middle';
      if (angle > -Math.PI / 4 && angle < Math.PI / 4) {
        textAnchor = 'middle';
      } else if (angle >= Math.PI / 4 && angle <= (3 * Math.PI) / 4) {
        textAnchor = 'start';
      } else if (angle > (3 * Math.PI) / 4 || angle < -(3 * Math.PI) / 4) {
        textAnchor = 'middle';
      } else {
        textAnchor = 'end';
      }

      let dy = '0.35em';
      if (angle > -Math.PI * 0.6 && angle < -Math.PI * 0.4) {
        dy = '0.8em';
      } else if (angle > Math.PI * 0.4 && angle < Math.PI * 0.6) {
        dy = '-0.3em';
      }

      return {
        value,
        lineX: center + maxRadius * Math.cos(angle),
        lineY: center + maxRadius * Math.sin(angle),
        labelX: center + labelRadius * Math.cos(angle),
        labelY: center + labelRadius * Math.sin(angle),
        textAnchor,
        dy,
      };
    });
  }, [center, maxRadius, labelRadius]);

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background concentric circles */}
        {[1, 2, 3, 4, 5, 6, 7].map((level) => (
          <g key={level}>
            <circle
              cx={center}
              cy={center}
              r={scoreToRadius(level)}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-border/30"
            />
            <text
              x={center + 8}
              y={center - scoreToRadius(level) + 4}
              className="fill-muted-foreground text-[9px]"
              textAnchor="start"
            >
              {level}
            </text>
          </g>
        ))}
        
        {/* Axis lines */}
        {axisData.map((axis, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={axis.lineX}
            y2={axis.lineY}
            stroke="currentColor"
            strokeWidth="1"
            className="text-border/40"
          />
        ))}

        {/* Radar polygons for each archetype */}
        {archetypePaths.map((archetype, i) => (
          <path
            key={archetype.name}
            d={archetype.path}
            fill={archetype.color}
            fillOpacity={0.25}
            stroke={archetype.color}
            strokeWidth="2"
            className="transition-all duration-300"
          />
        ))}

        {/* Data points for each archetype with tooltips */}
        {archetypePaths.map((archetype) => (
          archetype.positions.map((pos, i) => {
            const value = SCHWARTZ_VALUES[i];
            const score = archetype.scores[value.code] ?? 3.5;
            return (
              <TooltipProvider key={`${archetype.name}-${i}`} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={4}
                      fill={archetype.color}
                      stroke="hsl(var(--background))"
                      strokeWidth="1.5"
                      className="transition-all duration-300 cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px]">
                    <p className="font-semibold">{value.label}</p>
                    <p className="text-xs text-muted-foreground">{value.description}</p>
                    <p className="text-xs mt-1">{archetype.name}: {score.toFixed(1)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })
        ))}

        {/* Labels */}
        {axisData.map((axis) => (
          <text
            key={axis.value.code}
            x={axis.labelX}
            y={axis.labelY}
            textAnchor={axis.textAnchor}
            dy={axis.dy}
            className="fill-muted-foreground text-[10px] font-medium"
          >
            {axis.value.code}
          </text>
        ))}
      </svg>

      {/* Archetype Legend */}
      {archetypes.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {archetypePaths.map((archetype) => (
            <div key={archetype.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: archetype.color }}
              />
              <span className="text-sm text-muted-foreground">{archetype.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
