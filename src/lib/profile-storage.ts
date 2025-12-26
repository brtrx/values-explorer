import { supabase } from '@/integrations/supabase/client';
import { CreateProfile } from './validation';
import { ValueScores } from './schwartz-values';
import { Json } from '@/integrations/supabase/types';

export interface DbProfile {
  id: string;
  name: string;
  scores: ValueScores;
  description: string | null;
  system_prompt: string | null;
  created_at: string;
  updated_at: string;
}

function scoresToJson(scores: ValueScores): Json {
  return scores as unknown as Json;
}

function jsonToScores(json: Json): ValueScores {
  return json as unknown as ValueScores;
}

export async function saveProfile(profile: CreateProfile): Promise<DbProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      name: profile.name,
      scores: scoresToJson(profile.scores),
      description: profile.description ?? null,
      system_prompt: profile.system_prompt ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving profile:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw new Error('Unable to save profile. Please try again.');
  }

  return {
    ...data,
    scores: jsonToScores(data.scores),
  };
}

export async function updateProfile(id: string, profile: Partial<CreateProfile>): Promise<DbProfile> {
  const updateData: Record<string, unknown> = {};
  
  if (profile.name !== undefined) updateData.name = profile.name;
  if (profile.scores !== undefined) updateData.scores = scoresToJson(profile.scores);
  if (profile.description !== undefined) updateData.description = profile.description;
  if (profile.system_prompt !== undefined) updateData.system_prompt = profile.system_prompt;

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw new Error('Unable to update profile. Please try again.');
  }

  return {
    ...data,
    scores: jsonToScores(data.scores),
  };
}

export async function loadProfile(id: string): Promise<DbProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error loading profile:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw new Error('Unable to load profile. Please try again.');
  }

  return {
    ...data,
    scores: jsonToScores(data.scores),
  };
}

// LocalStorage helpers for draft saving
const DRAFT_KEY = 'schwartz-profile-draft';

export interface DraftProfile {
  name: string;
  scores: ValueScores;
  description?: string | null;
  systemPrompt?: string | null;
  lastModified: number;
}

export function saveDraft(draft: Omit<DraftProfile, 'lastModified'>): void {
  const fullDraft: DraftProfile = {
    ...draft,
    lastModified: Date.now(),
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(fullDraft));
}

export function loadDraft(): DraftProfile | null {
  const stored = localStorage.getItem(DRAFT_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as DraftProfile;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}
