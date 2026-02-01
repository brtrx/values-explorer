import { useMemo, useState } from 'react';
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
  const labelPadding = 35; // Space for labels outside the chart
  const chartSize = size - (labelPadding * 2);
  const center = size / 2;
  const maxRadius = chartSize / 2 - 20;
  const minRadius = 15;
  const labelRadius = maxRadius + 25;

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: typeof SCHWARTZ_VALUES[0];
    score: number;
  } | null>(null);

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

        {/* Data points with hover events */}
        {valuePositions.map(({ value, x, y, color, score }) => (
          <circle
            key={value.code}
            cx={x}
            cy={y}
            r={5}
            fill={color}
            stroke="hsl(var(--background))"
            strokeWidth="2"
            className="transition-all duration-300 cursor-pointer"
            onMouseEnter={() => setTooltip({ x, y, value, score })}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        {/* Labels with hover events */}
        {valuePositions.map(({ value, labelX, labelY, angle, score }) => {
          // Determine text anchor based on position around the circle
          // angle: -π/2 = top, 0 = right, π/2 = bottom, ±π = left
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          const normalizedAngle = angle;

          // Right side of circle (roughly -π/3 to π/3)
          if (normalizedAngle > -Math.PI / 3 && normalizedAngle < Math.PI / 3) {
            textAnchor = 'start';
          }
          // Left side of circle (roughly 2π/3 to -2π/3, wrapping around ±π)
          else if (normalizedAngle > (2 * Math.PI) / 3 || normalizedAngle < -(2 * Math.PI) / 3) {
            textAnchor = 'end';
          }
          // Top and bottom - middle anchor
          else {
            textAnchor = 'middle';
          }

          // Adjust vertical alignment based on position
          let dy = '0.35em';
          // Top area - push text down slightly
          if (normalizedAngle < -Math.PI / 3 && normalizedAngle > -(2 * Math.PI) / 3) {
            dy = '0.7em';
          }
          // Bottom area - push text up slightly
          else if (normalizedAngle > Math.PI / 3 && normalizedAngle < (2 * Math.PI) / 3) {
            dy = '0em';
          }

          return (
            <text
              key={value.code}
              x={labelX}
              y={labelY}
              textAnchor={textAnchor}
              dy={dy}
              className="fill-muted-foreground text-[10px] font-medium cursor-pointer hover:fill-foreground"
              onMouseEnter={() => setTooltip({ x: labelX, y: labelY, value, score })}
              onMouseLeave={() => setTooltip(null)}
            >
              {value.code}
            </text>
          );
        })}
      </svg>

      {/* Custom tooltip overlay */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none bg-popover border border-border rounded-md px-3 py-2 shadow-md max-w-[200px]"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-semibold text-sm">{tooltip.value.label}</p>
          <p className="text-xs text-muted-foreground">{tooltip.value.description}</p>
          <p className="text-xs mt-1">Score: {tooltip.score.toFixed(1)}</p>
        </div>
      )}

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
