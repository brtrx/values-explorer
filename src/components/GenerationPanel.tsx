import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { ValueScores } from '@/lib/schwartz-values';
import { generateDescription, generateSystemPrompt } from '@/lib/profile-generator';
import { SimilarTo } from '@/components/SimilarTo';
import { ValueEditor } from '@/components/ValueEditor';
import { CarrierSensitivityPanel } from '@/components/CarrierSensitivityPanel';
import { useToast } from '@/hooks/use-toast';

interface GenerationPanelProps {
  scores: ValueScores;
  description: string | null;
  systemPrompt: string | null;
  profileName: string;
  profileId: string | null;
  onDescriptionChange: (description: string) => void;
  onSystemPromptChange: (systemPrompt: string) => void;
  onLoadArchetypeProfile?: (scores: ValueScores, name: string) => void;
  onScoresChange?: (scores: ValueScores) => void;
  onRequestSave?: () => Promise<string | null>;
}

export function GenerationPanel({
  scores,
  description,
  systemPrompt,
  profileName,
  profileId,
  onDescriptionChange,
  onSystemPromptChange,
  onLoadArchetypeProfile,
  onScoresChange,
  onRequestSave,
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
    <div className="space-y-8">
      {/* Profile Summary - plain text display */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-2xl font-semibold">Profile Summary</h2>
          {description && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(description, 'description')}
              className="text-muted-foreground hover:text-foreground"
            >
              {copiedField === 'description' ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="ml-1.5">Copy</span>
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground leading-relaxed">
          {description || 'Adjust your value scores to see your profile description...'}
        </div>
      </section>

      {/* Edit Profile Scores - immediately after Profile Summary */}
      {onScoresChange && (
        <section>
          <h2 className="font-serif text-2xl font-semibold mb-2">
            Edit Profile Scores
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Adjust each value from 0.0 to 7.0 using the sliders or input boxes.
            Values are grouped by Schwartz's four higher-order categories.
          </p>
          <ValueEditor scores={scores} onChange={onScoresChange} />
        </section>
      )}

      {/* Carrier Sensitivity Analysis */}
      <section className="rounded-xl border bg-card p-6">
        <CarrierSensitivityPanel scores={scores} />
      </section>

      {/* Copy Instructions - system prompt */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-2xl font-semibold">Copy Instructions</h2>
          {systemPrompt && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(systemPrompt, 'prompt')}
              className="text-muted-foreground hover:text-foreground"
            >
              {copiedField === 'prompt' ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="ml-1.5">Copy</span>
            </Button>
          )}
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">System Prompt</p>
          <Textarea
            value={systemPrompt ?? ''}
            readOnly
            placeholder="Adjust your value scores to see the system prompt..."
            className="min-h-[200px] font-mono text-xs resize-none bg-transparent border-0 p-0 focus-visible:ring-0"
          />
        </div>
      </section>

      {/* Similar To... - archetype matching (at bottom) */}
      <SimilarTo
        scores={scores}
        profileName={profileName}
        profileId={profileId}
        profileDescription={description}
        onLoadArchetypeProfile={onLoadArchetypeProfile}
        onRequestSave={onRequestSave}
      />
    </div>
  );
}
