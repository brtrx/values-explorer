import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ValueEditor } from '@/components/ValueEditor';
import { SchwartzCircle } from '@/components/SchwartzCircle';
import { GenerationPanel } from '@/components/GenerationPanel';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { ValueScores, DEFAULT_SCORES } from '@/lib/schwartz-values';
import { useProfileDraft } from '@/hooks/use-profile-draft';
import { saveProfile, updateProfile, saveDraft } from '@/lib/profile-storage';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditorProps {
  initialProfile?: {
    id: string;
    name: string;
    scores: ValueScores;
    description: string | null;
    systemPrompt: string | null;
  };
  isSharedProfile?: boolean;
}

export function ProfileEditor({ initialProfile, isSharedProfile = false }: ProfileEditorProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loadFromDraft, loadSampleProfile, resetToDefaults } = useProfileDraft();
  
  const [name, setName] = useState(initialProfile?.name ?? 'Untitled Profile');
  const [scores, setScores] = useState<ValueScores>(initialProfile?.scores ?? { ...DEFAULT_SCORES });
  const [description, setDescription] = useState<string | null>(initialProfile?.description ?? null);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(initialProfile?.systemPrompt ?? null);
  const [allowOverwrite, setAllowOverwrite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModified, setIsModified] = useState(false);

  // Load draft on mount for new profiles
  useEffect(() => {
    if (!initialProfile) {
      const draft = loadFromDraft();
      if (draft) {
        setName(draft.name ?? 'Untitled Profile');
        setScores(draft.scores ?? { ...DEFAULT_SCORES });
        setDescription(draft.description ?? null);
        setSystemPrompt(draft.systemPrompt ?? null);
      }
    }
  }, [initialProfile, loadFromDraft]);

  // Auto-save draft on changes
  useEffect(() => {
    if (!isSharedProfile && isModified) {
      const timeoutId = setTimeout(() => {
        saveDraft({
          name,
          scores,
          description,
          systemPrompt,
        });
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [name, scores, description, systemPrompt, isSharedProfile, isModified]);

  const handleScoresChange = useCallback((newScores: ValueScores) => {
    setScores(newScores);
    setIsModified(true);
  }, []);

  const handleNameChange = useCallback((newName: string) => {
    setName(newName);
    setIsModified(true);
  }, []);

  const handleDescriptionChange = useCallback((newDescription: string) => {
    setDescription(newDescription);
    setIsModified(true);
  }, []);

  const handleSystemPromptChange = useCallback((newPrompt: string) => {
    setSystemPrompt(newPrompt);
    setIsModified(true);
  }, []);

  const handleSave = async (): Promise<string | null> => {
    setIsSaving(true);
    try {
      const profileData = {
        name,
        scores,
        description,
        system_prompt: systemPrompt,
      };

      let savedProfile;
      if (isSharedProfile && allowOverwrite && initialProfile?.id) {
        savedProfile = await updateProfile(initialProfile.id, profileData);
      } else {
        savedProfile = await saveProfile(profileData);
      }

      // Navigate to the new profile URL
      navigate(`/p/${savedProfile.id}`, { replace: true });
      return savedProfile.id;
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = useCallback(() => {
    const defaults = resetToDefaults();
    setName(defaults.name);
    setScores(defaults.scores);
    setDescription(defaults.description);
    setSystemPrompt(defaults.systemPrompt);
    setIsModified(false);
  }, [resetToDefaults]);

  const handleLoadSample = useCallback(() => {
    const sample = loadSampleProfile();
    setName(sample.name);
    setScores(sample.scores);
    setDescription(sample.description);
    setSystemPrompt(sample.systemPrompt);
    setIsModified(true);
    toast({
      title: 'Sample loaded',
      description: 'A sample profile has been loaded. Try generating a description!',
    });
  }, [loadSampleProfile, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold tracking-tight">
                Schwartz Values Profile
              </h1>
              <p className="text-xs text-muted-foreground">
                PVQ-RR → LLM Prompt Builder
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_360px] gap-8">
          {/* Left sidebar */}
          <aside className="order-2 xl:order-1">
            <div className="sticky top-24 space-y-6">
              <ProfileSidebar
                name={name}
                scores={scores}
                description={description}
                systemPrompt={systemPrompt}
                profileId={initialProfile?.id ?? null}
                isSharedProfile={isSharedProfile}
                allowOverwrite={allowOverwrite}
                isSaving={isSaving}
                onNameChange={handleNameChange}
                onSave={handleSave}
                onReset={handleReset}
                onLoadSample={handleLoadSample}
                onOverwriteChange={setAllowOverwrite}
              />
              
              {/* Schwartz Circle visualization */}
              <div className="rounded-xl border bg-card p-4">
                <h3 className="font-serif text-lg font-semibold mb-4 text-center">
                  Value Compass
                </h3>
                <div className="flex justify-center">
                  <SchwartzCircle scores={scores} size={240} />
                </div>
              </div>
            </div>
          </aside>

          {/* Center: Value editor */}
          <section className="order-1 xl:order-2">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-semibold mb-2">
                Value Scores
              </h2>
              <p className="text-sm text-muted-foreground">
                Adjust each value from 0.0 to 7.0 using the sliders or input boxes.
                Values are grouped by Schwartz's four higher-order categories.
              </p>
            </div>
            <ValueEditor scores={scores} onChange={handleScoresChange} />
          </section>

          {/* Right sidebar: Generation */}
          <aside className="order-3">
            <div className="sticky top-24">
              <h2 className="font-serif text-2xl font-semibold mb-2">
                Output
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Generate a human-readable description and LLM system prompt based on your values.
              </p>
              <GenerationPanel
                scores={scores}
                description={description}
                systemPrompt={systemPrompt}
                onDescriptionChange={handleDescriptionChange}
                onSystemPromptChange={handleSystemPromptChange}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Based on the{' '}
            <a 
              href="https://www.researchgate.net/publication/316705732" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              PVQ-RR (Revised)
            </a>
            {' '}by Shalom H. Schwartz
          </p>
        </div>
      </footer>
    </div>
  );
}
