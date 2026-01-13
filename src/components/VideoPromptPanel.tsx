import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Video, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VideoPromptPanelProps {
  scenario: string;
  archetypeNames: string[];
}

const VIDEO_SERVICES = [
  {
    name: 'Runway',
    url: 'https://app.runwayml.com/video-tools/teams/personal/ai-tools/generate',
    description: 'High-quality, cinematic',
    color: 'bg-violet-500',
  },
  {
    name: 'Pika',
    url: 'https://pika.art/create',
    description: 'Fast, stylized',
    color: 'bg-pink-500',
  },
  {
    name: 'Luma Dream Machine',
    url: 'https://lumalabs.ai/dream-machine',
    description: 'Realistic motion',
    color: 'bg-blue-500',
  },
  {
    name: 'Sora',
    url: 'https://sora.com',
    description: 'OpenAI (if you have access)',
    color: 'bg-emerald-500',
  },
];

function generateVideoPrompt(scenario: string, archetypeNames: string[]): string {
  // Extract the key elements from the scenario for a visual prompt
  const characterList = archetypeNames.join(' and ');
  
  // Try to find the core conflict/setting from the scenario
  const lines = scenario.split('\n').filter(l => l.trim());
  const settingLine = lines.find(l => 
    !l.startsWith('**') && 
    !l.match(/^\d+\./) && 
    l.length > 20 && 
    l.length < 200
  ) || '';
  
  // Create a cinematic prompt
  const prompt = `Cinematic scene: Two people in tense conversation. ${settingLine.slice(0, 150)}

Characters: ${characterList}

Style: Dramatic lighting, shallow depth of field, subtle camera movement. Professional film quality. Tension visible in body language and facial expressions. No text or subtitles.

Mood: Psychological tension, conflicting values, each person certain they are right.`;

  return prompt;
}

export function VideoPromptPanel({ scenario, archetypeNames }: VideoPromptPanelProps) {
  const [copied, setCopied] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const videoPrompt = useMemo(() => 
    generateVideoPrompt(scenario, archetypeNames), 
    [scenario, archetypeNames]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(videoPrompt);
      setCopied(true);
      toast.success('Video prompt copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleServiceClick = (url: string, name: string) => {
    setSelectedService(name);
    window.open(url, '_blank');
    toast.success(`Opened ${name} - paste the prompt there!`);
  };

  return (
    <Card className="p-4 mt-4 border-dashed">
      <div className="flex items-center gap-2 mb-3">
        <Video className="w-4 h-4 text-primary" />
        <h3 className="font-medium text-sm">Generate Video</h3>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Copy this cinematic prompt and paste it into your preferred video AI service:
      </p>

      <div className="relative mb-3">
        <Textarea 
          value={videoPrompt}
          readOnly
          className="text-xs min-h-[100px] pr-10 resize-none bg-muted/50"
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {VIDEO_SERVICES.map((service) => (
          <Button
            key={service.name}
            variant="outline"
            size="sm"
            className={cn(
              "justify-start gap-2 text-xs h-auto py-2",
              selectedService === service.name && "ring-2 ring-primary"
            )}
            onClick={() => handleServiceClick(service.url, service.name)}
          >
            <div className={cn("w-2 h-2 rounded-full", service.color)} />
            <div className="flex flex-col items-start">
              <span className="font-medium">{service.name}</span>
              <span className="text-[10px] text-muted-foreground">{service.description}</span>
            </div>
            <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
          </Button>
        ))}
      </div>
    </Card>
  );
}
