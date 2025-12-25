import { useCallback } from 'react';
import { ValueScores, DEFAULT_SCORES, SAMPLE_PROFILE_SCORES } from '@/lib/schwartz-values';
import { DraftProfile, loadDraft, saveDraft, clearDraft } from '@/lib/profile-storage';

export interface ProfileState {
  name: string;
  scores: ValueScores;
  description: string | null;
  systemPrompt: string | null;
  isModified: boolean;
}

export function useProfileDraft() {
  const loadFromDraft = useCallback((): Partial<ProfileState> | null => {
    const draft = loadDraft();
    if (!draft) return null;
    
    return {
      name: draft.name,
      scores: draft.scores,
      description: draft.description ?? null,
      systemPrompt: draft.systemPrompt ?? null,
    };
  }, []);

  const saveToDraft = useCallback((state: Pick<ProfileState, 'name' | 'scores' | 'description' | 'systemPrompt'>) => {
    saveDraft({
      name: state.name,
      scores: state.scores,
      description: state.description,
      systemPrompt: state.systemPrompt,
    });
  }, []);

  const clearCurrentDraft = useCallback(() => {
    clearDraft();
  }, []);

  const loadSampleProfile = useCallback((): ProfileState => {
    return {
      name: 'Sample Profile',
      scores: { ...SAMPLE_PROFILE_SCORES },
      description: null,
      systemPrompt: null,
      isModified: true,
    };
  }, []);

  const resetToDefaults = useCallback((): ProfileState => {
    return {
      name: 'Untitled Profile',
      scores: { ...DEFAULT_SCORES },
      description: null,
      systemPrompt: null,
      isModified: false,
    };
  }, []);

  return {
    loadFromDraft,
    saveToDraft,
    clearDraft: clearCurrentDraft,
    loadSampleProfile,
    resetToDefaults,
  };
}
