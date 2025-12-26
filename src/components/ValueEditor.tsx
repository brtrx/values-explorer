import { useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  SchwartzValue, 
  ValueScores, 
  HIGHER_ORDER_VALUES,
  getValuesByHigherOrder,
  HigherOrderValue 
} from '@/lib/schwartz-values';

interface ValueSliderProps {
  value: SchwartzValue;
  score: number;
  onChange: (code: string, value: number) => void;
}

function ValueSlider({ value, score, onChange }: ValueSliderProps) {
  const [inputValue, setInputValue] = useState(score.toFixed(2));

  const handleSliderChange = useCallback((values: number[]) => {
    const newValue = values[0];
    onChange(value.code, newValue);
    setInputValue(newValue.toFixed(2));
  }, [value.code, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    
    const parsed = parseFloat(text);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 7) {
      onChange(value.code, parsed);
    }
  }, [value.code, onChange]);

  const handleInputBlur = useCallback(() => {
    setInputValue(score.toFixed(2));
  }, [score]);

  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-mono text-muted-foreground">{value.code}</span>
          <span className="text-sm font-medium truncate">{value.label}</span>
        </div>
        <Slider
          value={[score]}
          min={0}
          max={7}
          step={0.01}
          onValueChange={handleSliderChange}
          className="w-full"
        />
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className="w-16 h-8 text-center text-sm font-mono"
      />
    </div>
  );
}

interface ValueQuadrantProps {
  higherOrder: HigherOrderValue;
  scores: ValueScores;
  onChange: (code: string, value: number) => void;
}

function ValueQuadrant({ higherOrder, scores, onChange }: ValueQuadrantProps) {
  const config = HIGHER_ORDER_VALUES[higherOrder];
  const values = getValuesByHigherOrder(higherOrder);
  
  // Calculate average score for this quadrant
  const avgScore = values.reduce((sum, v) => sum + (scores[v.code] ?? 3.5), 0) / values.length;

  return (
    <AccordionItem value={higherOrder} className="border rounded-xl bg-card overflow-hidden">
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
        <div className="flex items-center justify-between w-full pr-2">
          <div className="text-left">
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {config.label}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.description}
            </p>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary`}>
            Avg: {avgScore.toFixed(2)}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {/* Individual value sliders only - coarse-grained slider removed */}
        <div className="space-y-1 divide-y divide-border/50">
          {values.map((value) => (
            <ValueSlider
              key={value.code}
              value={value}
              score={scores[value.code] ?? 3.5}
              onChange={onChange}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface ValueEditorProps {
  scores: ValueScores;
  onChange: (scores: ValueScores) => void;
}

export function ValueEditor({ scores, onChange }: ValueEditorProps) {
  const handleValueChange = useCallback((code: string, value: number) => {
    onChange({
      ...scores,
      [code]: value,
    });
  }, [scores, onChange]);

  const quadrants: HigherOrderValue[] = [
    'openness',
    'self-enhancement', 
    'conservation',
    'self-transcendence',
  ];

  return (
    <Accordion type="multiple" defaultValue={['openness']} className="space-y-3">
      {quadrants.map((ho) => (
        <ValueQuadrant
          key={ho}
          higherOrder={ho}
          scores={scores}
          onChange={handleValueChange}
        />
      ))}
    </Accordion>
  );
}
