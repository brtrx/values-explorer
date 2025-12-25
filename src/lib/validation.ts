import { z } from 'zod';
import { VALUE_CODES } from './schwartz-values';

// Profile validation schema
export const profileScoresSchema = z.record(
  z.string(),
  z.number().min(0).max(7)
).refine(
  (scores) => VALUE_CODES.every(code => code in scores),
  { message: 'All 19 value codes must be present' }
);

export const profileSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Profile name is required').max(100, 'Profile name too long'),
  scores: profileScoresSchema,
  description: z.string().nullable().optional(),
  system_prompt: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Profile = z.infer<typeof profileSchema>;

// For creating new profiles
export const createProfileSchema = profileSchema.omit({ id: true, created_at: true, updated_at: true });
export type CreateProfile = z.infer<typeof createProfileSchema>;

// For updating existing profiles
export const updateProfileSchema = profileSchema.partial().required({ id: true });
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
