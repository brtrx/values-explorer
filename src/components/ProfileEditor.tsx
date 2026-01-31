import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchwartzCircle } from '@/components/SchwartzCircle';
import { GenerationPanel } from '@/components/GenerationPanel';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { ValueScores, DEFAULT_SCORES } from '@/lib/schwartz-values';
import { useProfileDraft } from '@/hooks/use-profile-draft';
import { saveProfile, updateProfile, saveDraft } from '@/lib/profile-storage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load draft on mount for new profiles, or load archetype from sessionStorage
  useEffect(() => {
    if (!initialProfile) {
      // Check for archetype loaded from landing page
      const archetypeData = sessionStorage.getItem('loadArchetype');
      if (archetypeData) {
        try {
          const { name: archetypeName, scores: archetypeScores } = JSON.parse(archetypeData);
          setName(archetypeName);
          setScores(archetypeScores);
          setIsModified(true);
          toast({
            title: 'Profile loaded',
            description: `Loaded ${archetypeName}'s value profile`,
          });
        } catch (e) {
          console.error('Failed to parse archetype data:', e);
        }
        sessionStorage.removeItem('loadArchetype');
        return;
      }

      const draft = loadFromDraft();
      if (draft) {
        setName(draft.name ?? 'Untitled Profile');
        setScores(draft.scores ?? { ...DEFAULT_SCORES });
        setDescription(draft.description ?? null);
        setSystemPrompt(draft.systemPrompt ?? null);
      }
    }
  }, [initialProfile, loadFromDraft, toast]);

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

  const handleLoadArchetypeProfile = useCallback((newScores: ValueScores, archetypeName: string) => {
    setScores(newScores);
    setName(archetypeName);
    setIsModified(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Main content - single column layout */}
      <main className="container max-w-2xl py-8 px-4">
        <div className="space-y-8">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Profile sidebar at top */}
          <section>
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
          </section>

          {/* Value Compass visualization */}
          <section className="rounded-xl border bg-card p-6 pb-10">
            <h2 className="font-serif text-xl font-semibold mb-4 text-center">
              Value Compass
            </h2>
            <div className="flex justify-center pb-8">
              <SchwartzCircle scores={scores} size={280} />
            </div>
          </section>

          {/* Profile Summary & Edit Profile Scores - GenerationPanel handles both + Similar To + Copy Instructions */}
          <GenerationPanel
            scores={scores}
            description={description}
            systemPrompt={systemPrompt}
            profileName={name}
            profileId={initialProfile?.id ?? null}
            onDescriptionChange={handleDescriptionChange}
            onSystemPromptChange={handleSystemPromptChange}
            onLoadArchetypeProfile={handleLoadArchetypeProfile}
            onScoresChange={handleScoresChange}
            onRequestSave={handleSave}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Based on {' '}
            <a 
              href="https://www.researchgate.net/publication/306432422_The_Refined_Theory_of_Basic_Values" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              The Refined Theory of Basic Values
            </a>
            {' '}by Shalom H. Schwartz
          </p>
        </div>
      </footer>
    </div>
  );
}
