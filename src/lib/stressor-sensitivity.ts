/**
 * Stressor Sensitivity Analysis
 * 
 * This module provides functions to analyze how a value profile (a set of weighted values)
 * interacts with stressors. It calculates:
 * 
 * 1. Value-Weighted Stressor Matrix: Adjusts the polarity matrix based on value weights
 * 2. Stressor Sensitivity Vector: Total weighted polarity for each stressor
 * 3. Internal Stressors: Stressors with high variance in sensitivity
 * 4. Profile Stressors: Stressors that antagonize tensions between profiles
 */

import { 
  StressorId, 
  STRESSOR_IDS, 
  STRESSORS,
  VALUE_POLARITY_MAP,
  getPolarity,
} from './stressors';
import { 
  ValueScores, 
  SCHWARTZ_VALUES,
  getValueByCode,
} from './schwartz-values';

/**
 * Represents a single cell in the value-weighted stressor matrix
 */
export interface WeightedPolarityCell {
  valueCode: string;
  stressorId: StressorId;
  rawPolarity: number;
  valueWeight: number;
  weightedPolarity: number;
}

/**
 * The full value-weighted stressor matrix
 */
export type ValueWeightedStressorMatrix = WeightedPolarityCell[];

/**
 * A sensitivity score for a stressor, with contributing values
 */
export interface StressorSensitivity {
  stressorId: StressorId;
  stressorName: string;
  /** Total weighted polarity - positive means stressor satisfies profile, negative frustrates */
  totalSensitivity: number;
  /** Absolute magnitude of sensitivity */
  absoluteSensitivity: number;
  /** Top contributing values (sorted by absolute weighted contribution) */
  topContributors: {
    valueCode: string;
    valueLabel: string;
    weight: number;
    polarity: number;
    contribution: number;
  }[];
}

/**
 * Internal tension analysis for a stressor
 */
export interface StressorInternalTension {
  stressorId: StressorId;
  stressorName: string;
  /** Range of weighted polarities (max - min) */
  range: number;
  /** Standard deviation of weighted polarities */
  standardDeviation: number;
  /** Values at extremes */
  highestValue: { code: string; label: string; weightedPolarity: number };
  lowestValue: { code: string; label: string; weightedPolarity: number };
}

/**
 * Profile stressor - a stressor that antagonizes tensions between profiles
 */
export interface ProfileStressor {
  stressorId: StressorId;
  stressorName: string;
  /** How much this stressor would amplify the tension between profiles */
  tensionScore: number;
  /** Per-profile sensitivities */
  profileSensitivities: {
    profileName: string;
    sensitivity: number;
  }[];
  /** The profiles most in conflict on this stressor */
  conflictingProfiles: [string, string];
  conflictMagnitude: number;
}

/**
 * Normalize a value score from 0-7 range to a weight centered around 0
 * 0-7 → -1.0 to +1.0 (with 3.5 as neutral)
 */
function normalizeScoreToWeight(score: number): number {
  // 0 → -1, 3.5 → 0, 7 → +1
  return (score - 3.5) / 3.5;
}

/**
 * Calculate the value-weighted stressor matrix for a given profile.
 * 
 * This adjusts each polarity by the normalized weight of each value in the profile.
 */
export function calculateWeightedStressorMatrix(
  scores: ValueScores
): ValueWeightedStressorMatrix {
  const matrix: ValueWeightedStressorMatrix = [];
  
  for (const value of SCHWARTZ_VALUES) {
    const valueWeight = normalizeScoreToWeight(scores[value.code] ?? 3.5);
    
    for (const stressorId of STRESSOR_IDS) {
      const rawPolarity = getPolarity(value.code, stressorId) ?? 0;
      const weightedPolarity = rawPolarity * valueWeight;
      
      matrix.push({
        valueCode: value.code,
        stressorId,
        rawPolarity,
        valueWeight,
        weightedPolarity,
      });
    }
  }
  
  return matrix;
}

/**
 * Calculate the stressor sensitivity vector for a profile.
 * 
 * For each stressor, this sums the weighted polarities across all values
 * to get the total sensitivity of the profile to that stressor.
 */
export function calculateStressorSensitivityVector(
  scores: ValueScores,
  topContributorCount: number = 5
): StressorSensitivity[] {
  const matrix = calculateWeightedStressorMatrix(scores);
  
  const sensitivities: StressorSensitivity[] = STRESSOR_IDS.map(stressorId => {
    const stressorCells = matrix.filter(cell => cell.stressorId === stressorId);
    
    const totalSensitivity = stressorCells.reduce(
      (sum, cell) => sum + cell.weightedPolarity,
      0
    );
    
    // Get top contributors sorted by absolute contribution
    const contributions = stressorCells
      .map(cell => ({
        valueCode: cell.valueCode,
        valueLabel: getValueByCode(cell.valueCode)?.label ?? cell.valueCode,
        weight: cell.valueWeight,
        polarity: cell.rawPolarity,
        contribution: cell.weightedPolarity,
      }))
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, topContributorCount);
    
    return {
      stressorId,
      stressorName: STRESSORS[stressorId].name,
      totalSensitivity,
      absoluteSensitivity: Math.abs(totalSensitivity),
      topContributors: contributions,
    };
  });
  
  // Sort by absolute sensitivity (highest first)
  return sensitivities.sort((a, b) => b.absoluteSensitivity - a.absoluteSensitivity);
}

/**
 * Get the top N most sensitive stressors for a profile.
 */
export function getTopSensitiveStressors(
  scores: ValueScores,
  count: number = 5
): StressorSensitivity[] {
  return calculateStressorSensitivityVector(scores).slice(0, count);
}

/**
 * Calculate internal stressors - those with the biggest range of
 * weighted polarities within a profile.
 * 
 * High internal tension means the profile has values that respond very
 * differently to the same stressor, creating internal conflict.
 */
export function calculateInternalTensionStressors(
  scores: ValueScores
): StressorInternalTension[] {
  const matrix = calculateWeightedStressorMatrix(scores);
  
  const tensions: StressorInternalTension[] = STRESSOR_IDS.map(stressorId => {
    const stressorCells = matrix.filter(cell => cell.stressorId === stressorId);
    const weightedPolarities = stressorCells.map(c => c.weightedPolarity);
    
    const max = Math.max(...weightedPolarities);
    const min = Math.min(...weightedPolarities);
    const range = max - min;
    
    // Calculate standard deviation
    const mean = weightedPolarities.reduce((s, v) => s + v, 0) / weightedPolarities.length;
    const variance = weightedPolarities.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / weightedPolarities.length;
    const standardDeviation = Math.sqrt(variance);
    
    const highestCell = stressorCells.find(c => c.weightedPolarity === max)!;
    const lowestCell = stressorCells.find(c => c.weightedPolarity === min)!;
    
    return {
      stressorId,
      stressorName: STRESSORS[stressorId].name,
      range,
      standardDeviation,
      highestValue: {
        code: highestCell.valueCode,
        label: getValueByCode(highestCell.valueCode)?.label ?? highestCell.valueCode,
        weightedPolarity: max,
      },
      lowestValue: {
        code: lowestCell.valueCode,
        label: getValueByCode(lowestCell.valueCode)?.label ?? lowestCell.valueCode,
        weightedPolarity: min,
      },
    };
  });
  
  // Sort by range (highest internal tension first)
  return tensions.sort((a, b) => b.range - a.range);
}

/**
 * Get the top N stressors with highest internal tension.
 */
export function getTopInternalTensionStressors(
  scores: ValueScores,
  count: number = 5
): StressorInternalTension[] {
  return calculateInternalTensionStressors(scores).slice(0, count);
}

/**
 * Calculate which stressors most antagonize the tensions between multiple profiles.
 * 
 * This finds stressors where profiles have opposing sensitivities,
 * meaning the stressor would pull them in different directions.
 */
export function calculateProfileStressors(
  profiles: { name: string; scores: ValueScores }[]
): ProfileStressor[] {
  if (profiles.length < 2) return [];
  
  // Calculate sensitivity for each profile
  const profileSensitivities = profiles.map(profile => ({
    name: profile.name,
    sensitivities: calculateStressorSensitivityVector(profile.scores),
  }));
  
  const tensionStressors: ProfileStressor[] = STRESSOR_IDS.map(stressorId => {
    const stressorSensitivities = profileSensitivities.map(ps => {
      const sens = ps.sensitivities.find(s => s.stressorId === stressorId);
      return {
        profileName: ps.name,
        sensitivity: sens?.totalSensitivity ?? 0,
      };
    });
    
    // Find the max difference between any two profiles
    let maxDiff = 0;
    let conflictingProfiles: [string, string] = [profiles[0].name, profiles[1].name];
    
    for (let i = 0; i < stressorSensitivities.length; i++) {
      for (let j = i + 1; j < stressorSensitivities.length; j++) {
        const diff = Math.abs(
          stressorSensitivities[i].sensitivity - stressorSensitivities[j].sensitivity
        );
        if (diff > maxDiff) {
          maxDiff = diff;
          conflictingProfiles = [
            stressorSensitivities[i].profileName,
            stressorSensitivities[j].profileName,
          ];
        }
      }
    }
    
    // Calculate overall tension score (sum of all pairwise differences)
    let tensionScore = 0;
    for (let i = 0; i < stressorSensitivities.length; i++) {
      for (let j = i + 1; j < stressorSensitivities.length; j++) {
        tensionScore += Math.abs(
          stressorSensitivities[i].sensitivity - stressorSensitivities[j].sensitivity
        );
      }
    }
    
    return {
      stressorId,
      stressorName: STRESSORS[stressorId].name,
      tensionScore,
      profileSensitivities: stressorSensitivities,
      conflictingProfiles,
      conflictMagnitude: maxDiff,
    };
  });
  
  // Sort by tension score (highest first)
  return tensionStressors.sort((a, b) => b.tensionScore - a.tensionScore);
}

/**
 * Get the top N stressors that most antagonize profile tensions.
 */
export function getTopProfileStressors(
  profiles: { name: string; scores: ValueScores }[],
  count: number = 5
): ProfileStressor[] {
  return calculateProfileStressors(profiles).slice(0, count);
}
