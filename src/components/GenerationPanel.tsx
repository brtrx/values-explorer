import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, FileText, Copy, Check, Loader2 } from 'lucide-react';
import { ValueScores } from '@/lib/schwartz-values';
import { generateDescription, generateSystemPrompt, generateBoth } from '@/lib/profile-generator';
import { useToast } from '@/hooks/use-toast';

interface GenerationPanelProps {
  scores: ValueScores;
  description: string | null;
  systemPrompt: string | null;
  onDescriptionChange: (description: string) => void;
  onSystemPromptChange: (systemPrompt: string) => void;
}

export function GenerationPanel({
  scores,
  description,
  systemPrompt,
  onDescriptionChange,
  onSystemPromptChange,
}: GenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState<'description' | 'prompt' | 'both' | null>(null);
  const [copiedField, setCopiedField] = useState<'description' | 'prompt' | null>(null);
  const { toast } = useToast();

  const handleGenerateDescription = async () => {
    setIsGenerating('description');
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    const result = generateDescription(scores);
    onDescriptionChange(result);
    setIsGenerating(null);
    toast({
      title: 'Description generated',
      description: 'Your profile description has been created.',
    });
  };

  const handleGeneratePrompt = async () => {
    setIsGenerating('prompt');
    await new Promise(resolve => setTimeout(resolve, 300));
    const result = generateSystemPrompt(scores);
    onSystemPromptChange(result);
    setIsGenerating(null);
    toast({
      title: 'System prompt generated',
      description: 'Your LLM system prompt has been created.',
    });
  };

  const handleGenerateBoth = async () => {
    setIsGenerating('both');
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = generateBoth(scores);
    onDescriptionChange(result.description);
    onSystemPromptChange(result.systemPrompt);
    setIsGenerating(null);
    toast({
      title: 'Generation complete',
      description: 'Both description and system prompt have been created.',
    });
  };

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
      {/* Generation buttons */}
      <div className="generation-panel">
        <h3 className="font-serif text-lg font-semibold mb-4">Generate Output</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleGenerateDescription}
            disabled={isGenerating !== null}
            variant="secondary"
            size="sm"
          >
            {isGenerating === 'description' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Generate Description
          </Button>
          <Button
            onClick={handleGeneratePrompt}
            disabled={isGenerating !== null}
            variant="secondary"
            size="sm"
          >
            {isGenerating === 'prompt' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate System Prompt
          </Button>
          <Button
            onClick={handleGenerateBoth}
            disabled={isGenerating !== null}
            size="sm"
          >
            {isGenerating === 'both' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate Both
          </Button>
        </div>
      </div>

      {/* Description output */}
      <div className="generation-panel">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">Profile Description</h4>
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
        <Textarea
          value={description ?? ''}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Click 'Generate Description' to create a profile summary..."
          className="min-h-[200px] font-mono text-xs resize-none"
        />
      </div>

      {/* System prompt output */}
      <div className="generation-panel">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">System Prompt</h4>
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
          onChange={(e) => onSystemPromptChange(e.target.value)}
          placeholder="Click 'Generate System Prompt' to create an LLM prompt..."
          className="min-h-[200px] font-mono text-xs resize-none"
        />
      </div>
    </div>
  );
}
