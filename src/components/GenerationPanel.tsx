import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { ValueScores } from '@/lib/schwartz-values';
import { generateDescription, generateSystemPrompt } from '@/lib/profile-generator';
import { WhoAmIMostLike } from '@/components/WhoAmIMostLike';
import { useToast } from '@/hooks/use-toast';

interface GenerationPanelProps {
  scores: ValueScores;
  description: string | null;
  systemPrompt: string | null;
  onDescriptionChange: (description: string) => void;
  onSystemPromptChange: (systemPrompt: string) => void;
  onLoadArchetypeProfile?: (scores: ValueScores, name: string) => void;
}

export function GenerationPanel({
  scores,
  description,
  systemPrompt,
  onDescriptionChange,
  onSystemPromptChange,
  onLoadArchetypeProfile,
}: GenerationPanelProps) {
  const [copiedField, setCopiedField] = useState<'description' | 'prompt' | null>(null);
  const { toast } = useToast();

  // Auto-generate on every score change
  useEffect(() => {
    const newDescription = generateDescription(scores);
    const newSystemPrompt = generateSystemPrompt(scores);
    onDescriptionChange(newDescription);
    onSystemPromptChange(newSystemPrompt);
  }, [scores, onDescriptionChange, onSystemPromptChange]);

  const handleCopy = async (text: string, field: 'description' | 'prompt') => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: 'Copied to clipboard',
      description: `${field === 'description' ? 'Description' : 'System prompt'} copied.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Who Am I Most Like - Featured component at top */}
      <WhoAmIMostLike scores={scores} onLoadArchetypeProfile={onLoadArchetypeProfile} />

      {/* Profile Description - As readable text */}
      <div className="generation-panel">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-serif font-semibold">Profile Description</h4>
          {description && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(description, 'description')}
              className="copy-button"
            >
              {copiedField === 'description' ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              Copy
            </Button>
          )}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {description || 'Adjust your value scores to see your profile description...'}
          </p>
        </div>
      </div>

      {/* System prompt output - As code at bottom */}
      <div className="generation-panel">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-serif font-semibold">System Prompt</h4>
          {systemPrompt && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(systemPrompt, 'prompt')}
              className="copy-button"
            >
              {copiedField === 'prompt' ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              Copy
            </Button>
          )}
        </div>
        <Textarea
          value={systemPrompt ?? ''}
          readOnly
          placeholder="Adjust your value scores to see the system prompt..."
          className="min-h-[200px] font-mono text-xs resize-none bg-muted/30"
        />
      </div>
    </div>
  );
}
