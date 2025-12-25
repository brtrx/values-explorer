import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProfileEditor } from '@/components/ProfileEditor';
import { loadProfile, DbProfile } from '@/lib/profile-storage';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LoadingState = 'loading' | 'success' | 'not-found' | 'error';

const SharedProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<LoadingState>('loading');
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!id) {
        setState('not-found');
        return;
      }

      try {
        const loadedProfile = await loadProfile(id);
        if (loadedProfile) {
          setProfile(loadedProfile);
          setState('success');
          // Update page title
          document.title = `${loadedProfile.name} | Schwartz Values Profile`;
        } else {
          setState('not-found');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setState('error');
      }
    }

    fetchProfile();
  }, [id]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (state === 'not-found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-serif text-2xl font-semibold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The profile you're looking for doesn't exist or may have been deleted.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Create New Profile
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h1 className="font-serif text-2xl font-semibold mb-2">Error Loading Profile</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'An error occurred while loading the profile.'}
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProfileEditor
      initialProfile={{
        id: profile!.id,
        name: profile!.name,
        scores: profile!.scores,
        description: profile!.description,
        systemPrompt: profile!.system_prompt,
      }}
      isSharedProfile={true}
    />
  );
};

export default SharedProfile;
