import { useMemo } from 'react';
import { 
  ValueScores, 
  calculateHigherOrderScores, 
  HIGHER_ORDER_VALUES,
  HigherOrderValue 
} from '@/lib/schwartz-values';

interface SchwartzCircleProps {
  scores: ValueScores;
  size?: number;
}

export function SchwartzCircle({ scores, size = 280 }: SchwartzCircleProps) {
  const hoScores = useMemo(() => calculateHigherOrderScores(scores), [scores]);
  
  const quadrants: { key: HigherOrderValue; angle: number; color: string }[] = [
    { key: 'openness', angle: -45, color: 'hsl(200, 70%, 50%)' },
    { key: 'self-enhancement', angle: 45, color: 'hsl(25, 75%, 55%)' },
    { key: 'conservation', angle: 135, color: 'hsl(140, 45%, 40%)' },
    { key: 'self-transcendence', angle: 225, color: 'hsl(280, 55%, 55%)' },
  ];

  const center = size / 2;
  const maxRadius = (size / 2) - 30;
  const minRadius = 20;

  // Convert score (0-7) to radius
  const scoreToRadius = (score: number) => {
    const normalized = score / 7;
    return minRadius + normalized * (maxRadius - minRadius);
  };

  // Generate path for the radar polygon
  const radarPoints = quadrants.map(({ key, angle }) => {
    const score = hoScores[key] ?? 3.5;
    const radius = scoreToRadius(score);
    const radians = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  });

  const radarPath = `M ${radarPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circles */}
        {[1, 2, 3, 4, 5, 6, 7].map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={scoreToRadius(level)}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border/40"
            strokeDasharray="4 4"
          />
        ))}
        
        {/* Quadrant lines */}
        {quadrants.map(({ angle }) => {
          const radians = (angle * Math.PI) / 180;
          const x2 = center + maxRadius * Math.cos(radians);
          const y2 = center + maxRadius * Math.sin(radians);
          return (
            <line
              key={angle}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border/60"
            />
          );
        })}

        {/* Radar polygon fill */}
        <path
          d={radarPath}
          fill="hsl(var(--primary) / 0.15)"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className="transition-all duration-300"
        />

        {/* Data points */}
        {quadrants.map(({ key, angle, color }) => {
          const score = hoScores[key] ?? 3.5;
          const radius = scoreToRadius(score);
          const radians = (angle * Math.PI) / 180;
          const x = center + radius * Math.cos(radians);
          const y = center + radius * Math.sin(radians);
          
          return (
            <circle
              key={key}
              cx={x}
              cy={y}
              r={6}
              fill={color}
              stroke="hsl(var(--background))"
              strokeWidth="2"
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      {/* Labels */}
      <div className="absolute inset-0 pointer-events-none">
        {quadrants.map(({ key, angle, color }) => {
          const labelDistance = maxRadius + 20;
          const radians = ((angle - 90) * Math.PI) / 180; // Adjust for SVG rotation
          const x = center + labelDistance * Math.cos(radians);
          const y = center + labelDistance * Math.sin(radians);
          const score = hoScores[key] ?? 3.5;
          
          return (
            <div
              key={key}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: x, top: y }}
            >
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {HIGHER_ORDER_VALUES[key].label.split(' ')[0]}
              </div>
              <div 
                className="text-sm font-bold"
                style={{ color }}
              >
                {score.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
