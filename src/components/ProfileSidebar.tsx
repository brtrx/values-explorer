import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Link, 
  RotateCcw, 
  Download, 
  Loader2,
  Check,
  Copy,
  Beaker
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ValueScores } from '@/lib/schwartz-values';

interface ProfileSidebarProps {
  name: string;
  scores: ValueScores;
  description: string | null;
  systemPrompt: string | null;
  profileId: string | null;
  isSharedProfile: boolean;
  allowOverwrite: boolean;
  isSaving: boolean;
  onNameChange: (name: string) => void;
  onSave: () => Promise<string | null>;
  onReset: () => void;
  onLoadSample: () => void;
  onOverwriteChange: (allow: boolean) => void;
}

export function ProfileSidebar({
  name,
  scores,
  description,
  systemPrompt,
  profileId,
  isSharedProfile,
  allowOverwrite,
  isSaving,
  onNameChange,
  onSave,
  onReset,
  onLoadSample,
  onOverwriteChange,
}: ProfileSidebarProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    const newId = await onSave();
    if (newId) {
      const url = `${window.location.origin}/p/${newId}`;
      setShareUrl(url);
      toast({
        title: 'Profile saved',
        description: 'Your profile has been saved. Share the link below.',
      });
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Link copied',
        description: 'Share link copied to clipboard.',
      });
    }
  };

  const handleExportJson = () => {
    const data = {
      name,
      scores,
      description,
      systemPrompt,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-profile.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Exported',
      description: 'Profile exported as JSON.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Shared profile banner */}
      {isSharedProfile && (
        <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm">
          <p className="font-medium text-accent-foreground mb-1">
            Viewing shared profile
          </p>
          <p className="text-muted-foreground text-xs">
            Edit locally • Save changes to create a new share link
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Switch
              id="overwrite"
              checked={allowOverwrite}
              onCheckedChange={onOverwriteChange}
            />
            <Label htmlFor="overwrite" className="text-xs">
              Overwrite existing
            </Label>
          </div>
        </div>
      )}

      {/* Profile name */}
      <div className="space-y-2">
        <Label htmlFor="profile-name">Profile Name</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter profile name..."
          className="font-medium"
        />
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
          className="w-full"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Profile
        </Button>

        {shareUrl && (
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="text-xs font-mono"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onLoadSample}
            className="flex-1"
          >
            <Beaker className="w-4 h-4 mr-2" />
            Load Sample
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={handleExportJson}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Export as JSON
        </Button>
      </div>
    </div>
  );
}
