import { useMemo } from 'react';
import { 
  ValueScores, 
  SCHWARTZ_VALUES,
  HIGHER_ORDER_VALUES,
  HigherOrderValue 
} from '@/lib/schwartz-values';

interface SchwartzCircleProps {
  scores: ValueScores;
  size?: number;
}

const HIGHER_ORDER_COLORS: Record<HigherOrderValue, string> = {
  'openness': 'hsl(200, 70%, 50%)',
  'self-enhancement': 'hsl(25, 75%, 55%)',
  'conservation': 'hsl(140, 45%, 40%)',
  'self-transcendence': 'hsl(280, 55%, 55%)',
};

export function SchwartzCircle({ scores, size = 320 }: SchwartzCircleProps) {
  const center = size / 2;
  const maxRadius = (size / 2) - 45;
  const minRadius = 15;
  const labelRadius = maxRadius + 28;

  // Convert score (0-7) to radius
  const scoreToRadius = (score: number) => {
    const normalized = score / 7;
    return minRadius + normalized * (maxRadius - minRadius);
  };

  // Calculate positions for each of the 19 values
  const valuePositions = useMemo(() => {
    const angleStep = (2 * Math.PI) / SCHWARTZ_VALUES.length;
    const startAngle = -Math.PI / 2; // Start from top
    
    return SCHWARTZ_VALUES.map((value, index) => {
      const angle = startAngle + index * angleStep;
      const score = scores[value.code] ?? 3.5;
      const radius = scoreToRadius(score);
      
      return {
        value,
        angle,
        score,
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        labelX: center + labelRadius * Math.cos(angle),
        labelY: center + labelRadius * Math.sin(angle),
        color: HIGHER_ORDER_COLORS[value.higherOrderValue],
      };
    });
  }, [scores, center, labelRadius]);

  // Generate radar polygon path
  const radarPath = useMemo(() => {
    const points = valuePositions.map(p => `${p.x},${p.y}`).join(' L ');
    return `M ${points} Z`;
  }, [valuePositions]);

  // Generate axis lines
  const axisLines = useMemo(() => {
    const angleStep = (2 * Math.PI) / SCHWARTZ_VALUES.length;
    const startAngle = -Math.PI / 2;
    
    return SCHWARTZ_VALUES.map((_, index) => {
      const angle = startAngle + index * angleStep;
      return {
        x2: center + maxRadius * Math.cos(angle),
        y2: center + maxRadius * Math.sin(angle),
      };
    });
  }, [center, maxRadius]);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background concentric circles with scale numbers */}
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
            {/* Scale numbers on the right side */}
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
        
        {/* Axis lines from center to edge */}
        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={line.x2}
            y2={line.y2}
            stroke="currentColor"
            strokeWidth="1"
            className="text-border/40"
          />
        ))}

        {/* Radar polygon fill */}
        <path
          d={radarPath}
          fill="hsl(var(--primary) / 0.2)"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className="transition-all duration-300"
        />

        {/* Data points */}
        {valuePositions.map(({ value, x, y, color }) => (
          <circle
            key={value.code}
            cx={x}
            cy={y}
            r={5}
            fill={color}
            stroke="hsl(var(--background))"
            strokeWidth="2"
            className="transition-all duration-300"
          />
        ))}

        {/* Labels */}
        {valuePositions.map(({ value, labelX, labelY, angle }) => {
          // Determine text anchor based on position
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (angle > -Math.PI / 4 && angle < Math.PI / 4) {
            textAnchor = 'middle'; // top
          } else if (angle >= Math.PI / 4 && angle <= (3 * Math.PI) / 4) {
            textAnchor = 'start'; // right
          } else if (angle > (3 * Math.PI) / 4 || angle < -(3 * Math.PI) / 4) {
            textAnchor = 'middle'; // bottom
          } else {
            textAnchor = 'end'; // left
          }

          // Adjust vertical alignment
          let dy = '0.35em';
          if (angle > -Math.PI * 0.6 && angle < -Math.PI * 0.4) {
            dy = '0.8em'; // top area
          } else if (angle > Math.PI * 0.4 && angle < Math.PI * 0.6) {
            dy = '-0.3em'; // bottom area
          }

          return (
            <text
              key={value.code}
              x={labelX}
              y={labelY}
              textAnchor={textAnchor}
              dy={dy}
              className="fill-muted-foreground text-[10px] font-medium"
            >
              {value.code}
            </text>
          );
        })}
      </svg>

      {/* Legend - arranged in 2 rows */}
      <div className="absolute -bottom-16 left-0 right-0 flex flex-col items-center gap-1.5 px-4">
        <div className="flex justify-center gap-4">
          {(['openness', 'self-transcendence'] as HigherOrderValue[]).map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: HIGHER_ORDER_COLORS[key] }}
              />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {HIGHER_ORDER_VALUES[key].label.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4">
          {(['conservation', 'self-enhancement'] as HigherOrderValue[]).map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: HIGHER_ORDER_COLORS[key] }}
              />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {HIGHER_ORDER_VALUES[key].label.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
