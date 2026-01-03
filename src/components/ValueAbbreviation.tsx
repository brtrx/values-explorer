/**
 * A reusable component for displaying Schwartz value abbreviations.
 * Clicking reveals the full name and description in a popover.
 * Use this universally whenever displaying value codes (e.g., SDT, BEC, UNC).
 */

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getValueByCode, HIGHER_ORDER_VALUES } from '@/lib/schwartz-values';
import { cn } from '@/lib/utils';

interface ValueAbbreviationProps {
  /** The Schwartz value code (e.g., "SDT", "BEC") */
  code: string;
  /** Optional additional className */
  className?: string;
  /** Whether to show the higher-order value color indicator */
  showColor?: boolean;
}

export function ValueAbbreviation({ code, className, showColor = true }: ValueAbbreviationProps) {
  const [open, setOpen] = useState(false);
  const value = getValueByCode(code);
  
  if (!value) {
    return <span className={className}>{code}</span>;
  }

  const higherOrder = HIGHER_ORDER_VALUES[value.higherOrderValue];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "font-medium underline decoration-dotted underline-offset-2 cursor-pointer hover:text-primary transition-colors",
            className
          )}
          onClick={() => setOpen(true)}
        >
          {code}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" side="top">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            {showColor && (
              <div 
                className="w-3 h-3 rounded-full mt-1 shrink-0"
                style={{ backgroundColor: `hsl(var(--${higherOrder.color}))` }}
              />
            )}
            <div>
              <h4 className="font-semibold">{value.label}</h4>
              <p className="text-xs text-muted-foreground">{code}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{value.description}</p>
          <p 
            className="text-xs font-medium"
            style={{ color: `hsl(var(--${higherOrder.color}))` }}
          >
            {higherOrder.label}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
