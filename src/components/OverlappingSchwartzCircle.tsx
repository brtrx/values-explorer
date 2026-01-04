import { useMemo, useState } from 'react';
import { 
  ValueScores, 
  SCHWARTZ_VALUES,
} from '@/lib/schwartz-values';

interface ArchetypeData {
  name: string;
  scores: ValueScores;
  color: string;
}

interface TensionLine {
  valueA: string;
  valueB: string;
  scoreDiff: number;
}

interface OverlappingSchwartzCircleProps {
  archetypes: ArchetypeData[];
  size?: number;
  tensionLines?: TensionLine[];
}

const ARCHETYPE_COLORS = [
  'hsl(220, 70%, 55%)',
  'hsl(350, 70%, 55%)',
  'hsl(160, 60%, 45%)',
  'hsl(45, 80%, 50%)',
  'hsl(280, 60%, 55%)',
];

export function OverlappingSchwartzCircle({ archetypes, size = 360, tensionLines = [] }: OverlappingSchwartzCircleProps) {
  const center = size / 2;
  const maxRadius = (size / 2) - 50;
  const minRadius = 15;
  const labelRadius = maxRadius + 30;

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: typeof SCHWARTZ_VALUES[0];
    archetypeName: string;
    score: number;
  } | null>(null);

  const scoreToRadius = (score: number) => {
    // Archetype profiles use -3 to 3 range, convert to 0-7 for display (3.5 is neutral)
    const displayScore = score + 3.5;
    const normalized = Math.max(0, Math.min(1, displayScore / 7));
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

  // Calculate tension line positions
  const tensionLineData = useMemo(() => {
    const angleStep = (2 * Math.PI) / SCHWARTZ_VALUES.length;
    const startAngle = -Math.PI / 2;
    
    return tensionLines.map((tension, idx) => {
      const valueAIndex = SCHWARTZ_VALUES.findIndex(v => v.code === tension.valueA);
      const valueBIndex = SCHWARTZ_VALUES.findIndex(v => v.code === tension.valueB);
      
      if (valueAIndex === -1 || valueBIndex === -1) return null;
      
      const angleA = startAngle + valueAIndex * angleStep;
      const angleB = startAngle + valueBIndex * angleStep;
      
      // Position at 70% of max radius for visibility
      const lineRadius = maxRadius * 0.7;
      
      return {
        x1: center + lineRadius * Math.cos(angleA),
        y1: center + lineRadius * Math.sin(angleA),
        x2: center + lineRadius * Math.cos(angleB),
        y2: center + lineRadius * Math.sin(angleB),
        tension: tension.scoreDiff,
        index: idx,
      };
    }).filter(Boolean);
  }, [tensionLines, center, maxRadius]);

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

        {/* Tension lines */}
        {tensionLineData.map((line: any) => (
          <line
            key={`tension-${line.index}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
            strokeDasharray="4 2"
            opacity={0.6}
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

        {/* Data points for each archetype with hover events */}
        {archetypePaths.map((archetype) => (
          archetype.positions.map((pos, i) => {
            const value = SCHWARTZ_VALUES[i];
            const score = archetype.scores[value.code] ?? 3.5;
            return (
              <circle
                key={`${archetype.name}-${i}`}
                cx={pos.x}
                cy={pos.y}
                r={4}
                fill={archetype.color}
                stroke="hsl(var(--background))"
                strokeWidth="1.5"
                className="transition-all duration-300 cursor-pointer hover:r-6"
                onMouseEnter={() => setTooltip({ x: pos.x, y: pos.y, value, archetypeName: archetype.name, score })}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })
        ))}

        {/* Labels with hover events */}
        {axisData.map((axis) => (
          <text
            key={axis.value.code}
            x={axis.labelX}
            y={axis.labelY}
            textAnchor={axis.textAnchor}
            dy={axis.dy}
            className="fill-muted-foreground text-[10px] font-medium cursor-pointer hover:fill-foreground"
            onMouseEnter={(e) => setTooltip({ 
              x: axis.labelX, 
              y: axis.labelY, 
              value: axis.value, 
              archetypeName: '', 
              score: 0 
            })}
            onMouseLeave={() => setTooltip(null)}
          >
            {axis.value.code}
          </text>
        ))}
      </svg>

      {/* Custom tooltip overlay */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none bg-popover border border-border rounded-md px-3 py-2 shadow-md max-w-[220px]"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-semibold text-sm">{tooltip.value.label}</p>
          <p className="text-xs text-muted-foreground">{tooltip.value.description}</p>
          {tooltip.archetypeName && (
            <p className="text-xs mt-1">{tooltip.archetypeName}: {tooltip.score.toFixed(1)}</p>
          )}
        </div>
      )}

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
