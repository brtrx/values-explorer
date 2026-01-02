import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Swords } from 'lucide-react';
import { toast } from 'sonner';
import { Archetype, ARCHETYPES } from '@/lib/archetypes';

const CONFLICT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-conflict-scenario`;

interface ConflictScenarioProps {
  selectedArchetypes: string[];
}

export function ConflictScenario({ selectedArchetypes }: ConflictScenarioProps) {
  const [scenario, setScenario] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScenario = async () => {
    if (selectedArchetypes.length < 2) {
      toast.error('Select at least 2 archetypes to generate a conflict');
      return;
    }

    setIsGenerating(true);
    setScenario('');

    const archetypesData = selectedArchetypes.map(name => {
      const archetype = ARCHETYPES.find(a => a.name === name)!;
      return {
        name: archetype.name,
        description: archetype.description,
        valueProfile: archetype.valueProfile,
      };
    });

    try {
      const response = await fetch(CONFLICT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ archetypes: archetypesData }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 402) {
          toast.error('AI credits exhausted. Please add funds.');
        } else {
          toast.error(error.error || 'Failed to generate scenario');
        }
        setIsGenerating(false);
        return;
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setScenario(fullText);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Conflict scenario error:', error);
      toast.error('Failed to generate conflict scenario');
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse the scenario text to render dialogue nicely
  const renderScenario = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, i) => {
      // Check if it's a dialogue line (starts with ** for bold character name)
      const dialogueMatch = line.match(/^\*\*\[?([^\]:\*]+)\]?\*\*:\s*(.+)/);
      
      if (dialogueMatch) {
        const [, speaker, dialogue] = dialogueMatch;
        return (
          <div key={i} className="mb-3">
            <span className="font-semibold text-primary">{speaker}:</span>
            <span className="ml-2 text-foreground italic">{dialogue.replace(/^"|"$/g, '')}</span>
          </div>
        );
      }
      
      // Check for section headers (like "SCENARIO" or "DIALOGUE")
      if (line.match(/^\d+\.\s*(SCENARIO|DIALOGUE)/i)) {
        return (
          <h4 key={i} className="font-semibold text-foreground mt-4 mb-2 text-sm uppercase tracking-wide">
            {line.replace(/^\d+\.\s*/, '')}
          </h4>
        );
      }
      
      // Regular paragraph
      if (line.trim()) {
        return <p key={i} className="text-muted-foreground mb-2">{line}</p>;
      }
      
      return null;
    });
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
          <Swords className="w-5 h-5 text-destructive" />
          Conflict Scenario
        </h2>
        <Button 
          onClick={generateScenario}
          disabled={isGenerating || selectedArchetypes.length < 2}
          variant="outline"
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Swords className="w-4 h-4" />
              Generate Conflict
            </>
          )}
        </Button>
      </div>

      {scenario ? (
        <div className="prose prose-sm max-w-none">
          {renderScenario(scenario)}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Click "Generate Conflict" to see a scenario where these characters' 
          values would naturally clash, complete with dialogue.
        </p>
      )}
    </div>
  );
}
