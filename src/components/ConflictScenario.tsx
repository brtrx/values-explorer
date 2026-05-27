import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HeartHandshake, Loader2, ScrollText, Swords } from 'lucide-react';
import { InfoPopover } from '@/components/InfoPopover';
import { toast } from 'sonner';
import { ARCHETYPES } from '@/lib/archetypes';
import { ValueScores } from '@/lib/schwartz-values';
import { getTopProfileStressors } from '@/lib/stressor-sensitivity';
import { analyzeReconciliation } from '@/lib/reconciliation-analysis';
import { buildConflictPrompt, buildReconciliationPrompt, PromptPair } from '@/lib/prompt-builders';
import { stripMarkdown } from '@/lib/utils';

const SUPABASE_BASE_URL = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, '');
const CONFLICT_URL = `${SUPABASE_BASE_URL}/functions/v1/generate-conflict-scenario`;
const RECONCILIATION_URL = `${SUPABASE_BASE_URL}/functions/v1/generate-reconciliation`;

interface CustomProfile {
  name: string;
  scores: ValueScores;
  description?: string;
}

interface ConflictScenarioProps {
  selectedArchetypes: string[];
  customProfiles?: CustomProfile[];
  profilesData?: { name: string; scores: ValueScores }[];
}

// Converts ValueScores (0–7 scale) to valueProfile weights (-3 to 3)
function scoresToValueProfile(scores: ValueScores): Record<string, number> {
  const profile: Record<string, number> = {};
  for (const [code, score] of Object.entries(scores)) {
    const weight = Math.round(score - 3.5);
    if (weight !== 0) {
      profile[code] = Math.max(-3, Math.min(3, weight));
    }
  }
  return profile;
}

export function ConflictScenario({ selectedArchetypes, customProfiles = [], profilesData }: ConflictScenarioProps) {
  const [scenario, setScenario] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeStressors, setIncludeStressors] = useState(false);
  const [reconciliation, setReconciliation] = useState<string>('');
  const [isGeneratingReconciliation, setIsGeneratingReconciliation] = useState(false);
  const [viewingPrompt, setViewingPrompt] = useState<{ title: string; prompt: PromptPair } | null>(null);

  const totalSelected = selectedArchetypes.length + customProfiles.length;

  const buildAllProfilesData = () => {
    const archetypesData = selectedArchetypes.map(name => {
      const archetype = ARCHETYPES.find(a => a.name === name)!;
      return { name: archetype.name, description: archetype.description, valueProfile: archetype.valueProfile };
    });
    const customProfilesData = customProfiles.map(profile => ({
      name: profile.name,
      description: profile.description ?? 'A custom user-created value profile',
      valueProfile: scoresToValueProfile(profile.scores),
    }));
    return [...customProfilesData, ...archetypesData];
  };

  const openConflictPrompt = () => {
    const allProfilesData = buildAllProfilesData();
    let stressorNames: string[] | undefined;
    if (includeStressors && profilesData && profilesData.length >= 2) {
      stressorNames = getTopProfileStressors(profilesData, 3).map(s => s.stressorName);
    }
    setViewingPrompt({ title: 'Conflict Scenario Prompt', prompt: buildConflictPrompt(allProfilesData, stressorNames) });
  };

  const openReconciliationPrompt = () => {
    const allProfilesData = buildAllProfilesData();
    const analysis = analyzeReconciliation(profilesData ?? []);
    setViewingPrompt({ title: 'Reconciliation Prompt', prompt: buildReconciliationPrompt(allProfilesData, scenario, analysis) });
  };

  const generateScenario = async () => {
    if (totalSelected < 2) {
      toast.error('Select at least 2 profiles to generate a conflict');
      return;
    }

    setIsGenerating(true);
    setScenario('');
    setReconciliation('');

    try {
      const allProfilesData = buildAllProfilesData();

      let stressorNames: string[] | undefined;
      if (includeStressors && profilesData && profilesData.length >= 2) {
        const topStressors = getTopProfileStressors(profilesData, 3);
        stressorNames = topStressors.map(s => s.stressorName);
      }

      const response = await fetch(CONFLICT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ archetypes: allProfilesData, stressors: stressorNames }),
      });

      if (!response.ok) {
        let message = 'Failed to generate scenario';
        try {
          const error = await response.json();
          message = error.error || message;
        } catch { /* non-JSON body */ }
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 402) {
          toast.error('AI credits exhausted. Please add funds.');
        } else {
          toast.error(message);
        }
        return;
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';

      outer: while (true) {
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
          if (jsonStr === '[DONE]') break outer;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setScenario(fullText);
            }
          } catch {
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

  const generateReconciliation = async () => {
    if (!scenario || totalSelected < 2) return;

    setIsGeneratingReconciliation(true);
    setReconciliation('');

    try {
      const allProfilesData = buildAllProfilesData();
      const analysis = analyzeReconciliation(profilesData ?? []);

      const response = await fetch(RECONCILIATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ archetypes: allProfilesData, conflictScenario: scenario, analysis }),
      });

      if (!response.ok) {
        let message = 'Failed to generate reconciliation';
        try {
          const error = await response.json();
          message = error.error || message;
        } catch { /* non-JSON body */ }
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 402) {
          toast.error('AI credits exhausted. Please add funds.');
        } else {
          toast.error(message);
        }
        return;
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';

      outer: while (true) {
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
          if (jsonStr === '[DONE]') break outer;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setReconciliation(fullText);
            }
          } catch {
            break;
          }
        }
      }
    } catch (error) {
      console.error('Reconciliation error:', error);
      toast.error('Failed to generate reconciliation');
    } finally {
      setIsGeneratingReconciliation(false);
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
            <span className="font-semibold text-primary">{stripMarkdown(speaker)}:</span>
            <span className="ml-2 text-foreground italic">{stripMarkdown(dialogue).replace(/^"|"$/g, '')}</span>
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
        return <p key={i} className="text-muted-foreground mb-2">{stripMarkdown(line)}</p>;
      }

      return null;
    });
  };

  const renderReconciliation = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, i) => {
      const dialogueMatch = line.match(/^\*\*\[?([^\]:\*]+)\]?\*\*:\s*(.+)/);
      if (dialogueMatch) {
        const [, speaker, dialogue] = dialogueMatch;
        return (
          <div key={i} className="mb-3">
            <span className="font-semibold text-primary">{stripMarkdown(speaker)}:</span>
            <span className="ml-2 text-foreground italic">{stripMarkdown(dialogue).replace(/^"|"$/g, '')}</span>
          </div>
        );
      }

      if (line.match(/^\d+\.\s*(COMMON GROUND|RECONCILIATION PATH|DIALOGUE)/i)) {
        return (
          <h4 key={i} className="font-semibold text-foreground mt-4 mb-2 text-sm uppercase tracking-wide">
            {line.replace(/^\d+\.\s*/, '')}
          </h4>
        );
      }

      if (line.trim()) {
        return <p key={i} className="text-muted-foreground mb-2">{stripMarkdown(line)}</p>;
      }

      return null;
    });
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
            <Swords className="w-5 h-5 text-destructive" />
            Conflict Scenario
          </h2>
          {profilesData && profilesData.length >= 2 && (
            <div className="flex items-center gap-2 mt-2">
              <Switch
                id="include-stressors"
                checked={includeStressors}
                onCheckedChange={setIncludeStressors}
              />
              <Label htmlFor="include-stressors" className="text-sm text-muted-foreground cursor-pointer">
                Use stressor context
              </Label>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <InfoPopover content={
            <>
              <p>AI-generated scenario and dialogue that brings value tensions to life. Each character speaks authentically from their worldview, showing where and why they clash.</p>
              <p className="mt-2 text-xs text-muted-foreground">When "Use stressor context" is on, the scenario is grounded in the stressors that most amplify tensions between these profiles.</p>
            </>
          } />
          {totalSelected >= 2 && (
            <Button
              onClick={openConflictPrompt}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
            >
              <ScrollText className="w-3.5 h-3.5" />
              View prompt
            </Button>
          )}
          <Button
            onClick={generateScenario}
            disabled={isGenerating || totalSelected < 2}
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

      {scenario && profilesData && profilesData.length >= 2 && (() => {
        const { conflictValues, bridgeValues } = analyzeReconciliation(profilesData);
        return (
          <>
            <Separator className="my-5" />
            <div className="space-y-3">
              {conflictValues.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-muted-foreground font-medium">Value tensions:</span>
                  {conflictValues.map(v => (
                    <Badge key={v.code} variant="destructive" className="text-xs font-normal opacity-75">
                      {v.code} · {v.label}
                    </Badge>
                  ))}
                </div>
              )}
              {bridgeValues.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-muted-foreground font-medium">Bridge values:</span>
                  {bridgeValues.map(v => (
                    <Badge key={v.code} variant="secondary" className="text-xs font-normal">
                      {v.code} · {v.label}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <InfoPopover content={
                  <p>AI reconciliation grounded in values adjacent to the conflict on the Schwartz circumflex — the natural motivational bridges between these personas.</p>
                } />
                <Button
                  onClick={openReconciliationPrompt}
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                >
                  <ScrollText className="w-3.5 h-3.5" />
                  View prompt
                </Button>
                <Button
                  onClick={generateReconciliation}
                  disabled={isGeneratingReconciliation || !scenario}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {isGeneratingReconciliation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Finding common ground...
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="w-4 h-4" />
                      Find Common Ground
                    </>
                  )}
                </Button>
              </div>
              {reconciliation && (
                <div className="prose prose-sm max-w-none mt-2">
                  {renderReconciliation(reconciliation)}
                </div>
              )}
            </div>
          </>
        );
      })()}

      <Dialog open={!!viewingPrompt} onOpenChange={open => !open && setViewingPrompt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">{viewingPrompt?.title}</DialogTitle>
          </DialogHeader>
          {viewingPrompt && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">System prompt</p>
                  <pre className="text-xs bg-muted rounded-md p-3 whitespace-pre-wrap font-mono leading-relaxed">
                    {viewingPrompt.prompt.system}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">User prompt</p>
                  <pre className="text-xs bg-muted rounded-md p-3 whitespace-pre-wrap font-mono leading-relaxed">
                    {viewingPrompt.prompt.user}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
