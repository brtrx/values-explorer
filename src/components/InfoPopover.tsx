import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface InfoPopoverProps {
  content: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export function InfoPopover({ content, side = 'left' }: InfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
          <Info className="w-4 h-4" />
          <span className="sr-only">More information</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} className="max-w-xs text-sm">
        {content}
      </PopoverContent>
    </Popover>
  );
}
