/**
 * Carrier Sensitivity Analysis
 * 
 * This module provides functions to analyze how a value profile (a set of weighted values)
 * interacts with carriers. It calculates:
 * 
 * 1. Value-Weighted Carrier Matrix: Adjusts the polarity matrix based on value weights
 * 2. Carrier Sensitivity Vector: Total weighted polarity for each carrier
 * 3. Internal Tension Carriers: Carriers with high variance in sensitivity
 * 4. Profile Tension Carriers: Carriers that antagonize tensions between profiles
 */

import { 
  CarrierId, 
  CARRIER_IDS, 
  CARRIERS,
  VALUE_POLARITY_MAP,
  getPolarity,
} from './carriers';
import { 
  ValueScores, 
  SCHWARTZ_VALUES,
  getValueByCode,
} from './schwartz-values';

/**
 * Represents a single cell in the value-weighted carrier matrix
 */
export interface WeightedPolarityCell {
  valueCode: string;
  carrierId: CarrierId;
  rawPolarity: number;
  valueWeight: number;
  weightedPolarity: number;
}

/**
 * The full value-weighted carrier matrix
 */
export type ValueWeightedCarrierMatrix = WeightedPolarityCell[];

/**
 * A sensitivity score for a carrier, with contributing values
 */
export interface CarrierSensitivity {
  carrierId: CarrierId;
  carrierName: string;
  /** Total weighted polarity - positive means carrier satisfies profile, negative frustrates */
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
 * Internal tension analysis for a carrier
 */
export interface CarrierInternalTension {
  carrierId: CarrierId;
  carrierName: string;
  /** Range of weighted polarities (max - min) */
  range: number;
  /** Standard deviation of weighted polarities */
  standardDeviation: number;
  /** Values at extremes */
  highestValue: { code: string; label: string; weightedPolarity: number };
  lowestValue: { code: string; label: string; weightedPolarity: number };
}

/**
 * Profile tension carrier - a carrier that antagonizes tensions between profiles
 */
export interface ProfileTensionCarrier {
  carrierId: CarrierId;
  carrierName: string;
  /** How much this carrier would amplify the tension between profiles */
  tensionScore: number;
  /** Per-profile sensitivities */
  profileSensitivities: {
    profileName: string;
    sensitivity: number;
  }[];
  /** The profiles most in conflict on this carrier */
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
 * Calculate the value-weighted carrier matrix for a given profile.
 * 
 * This adjusts each polarity by the normalized weight of each value in the profile.
 */
export function calculateWeightedCarrierMatrix(
  scores: ValueScores
): ValueWeightedCarrierMatrix {
  const matrix: ValueWeightedCarrierMatrix = [];
  
  for (const value of SCHWARTZ_VALUES) {
    const valueWeight = normalizeScoreToWeight(scores[value.code] ?? 3.5);
    
    for (const carrierId of CARRIER_IDS) {
      const rawPolarity = getPolarity(value.code, carrierId) ?? 0;
      const weightedPolarity = rawPolarity * valueWeight;
      
      matrix.push({
        valueCode: value.code,
        carrierId,
        rawPolarity,
        valueWeight,
        weightedPolarity,
      });
    }
  }
  
  return matrix;
}

/**
 * Calculate the carrier sensitivity vector for a profile.
 * 
 * For each carrier, this sums the weighted polarities across all values
 * to get the total sensitivity of the profile to that carrier.
 */
export function calculateCarrierSensitivityVector(
  scores: ValueScores,
  topContributorCount: number = 5
): CarrierSensitivity[] {
  const matrix = calculateWeightedCarrierMatrix(scores);
  
  const sensitivities: CarrierSensitivity[] = CARRIER_IDS.map(carrierId => {
    const carrierCells = matrix.filter(cell => cell.carrierId === carrierId);
    
    const totalSensitivity = carrierCells.reduce(
      (sum, cell) => sum + cell.weightedPolarity,
      0
    );
    
    // Get top contributors sorted by absolute contribution
    const contributions = carrierCells
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
      carrierId,
      carrierName: CARRIERS[carrierId].name,
      totalSensitivity,
      absoluteSensitivity: Math.abs(totalSensitivity),
      topContributors: contributions,
    };
  });
  
  // Sort by absolute sensitivity (highest first)
  return sensitivities.sort((a, b) => b.absoluteSensitivity - a.absoluteSensitivity);
}

/**
 * Get the top N most sensitive carriers for a profile.
 */
export function getTopSensitiveCarriers(
  scores: ValueScores,
  count: number = 5
): CarrierSensitivity[] {
  return calculateCarrierSensitivityVector(scores).slice(0, count);
}

/**
 * Calculate internal tension carriers - those with the biggest range of
 * weighted polarities within a profile.
 * 
 * High internal tension means the profile has values that respond very
 * differently to the same carrier, creating internal conflict.
 */
export function calculateInternalTensionCarriers(
  scores: ValueScores
): CarrierInternalTension[] {
  const matrix = calculateWeightedCarrierMatrix(scores);
  
  const tensions: CarrierInternalTension[] = CARRIER_IDS.map(carrierId => {
    const carrierCells = matrix.filter(cell => cell.carrierId === carrierId);
    const weightedPolarities = carrierCells.map(c => c.weightedPolarity);
    
    const max = Math.max(...weightedPolarities);
    const min = Math.min(...weightedPolarities);
    const range = max - min;
    
    // Calculate standard deviation
    const mean = weightedPolarities.reduce((s, v) => s + v, 0) / weightedPolarities.length;
    const variance = weightedPolarities.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / weightedPolarities.length;
    const standardDeviation = Math.sqrt(variance);
    
    const highestCell = carrierCells.find(c => c.weightedPolarity === max)!;
    const lowestCell = carrierCells.find(c => c.weightedPolarity === min)!;
    
    return {
      carrierId,
      carrierName: CARRIERS[carrierId].name,
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
 * Get the top N carriers with highest internal tension.
 */
export function getTopInternalTensionCarriers(
  scores: ValueScores,
  count: number = 5
): CarrierInternalTension[] {
  return calculateInternalTensionCarriers(scores).slice(0, count);
}

/**
 * Calculate which carriers most antagonize the tensions between multiple profiles.
 * 
 * This finds carriers where profiles have opposing sensitivities,
 * meaning the carrier would pull them in different directions.
 */
export function calculateProfileTensionCarriers(
  profiles: { name: string; scores: ValueScores }[]
): ProfileTensionCarrier[] {
  if (profiles.length < 2) return [];
  
  // Calculate sensitivity for each profile
  const profileSensitivities = profiles.map(profile => ({
    name: profile.name,
    sensitivities: calculateCarrierSensitivityVector(profile.scores),
  }));
  
  const tensionCarriers: ProfileTensionCarrier[] = CARRIER_IDS.map(carrierId => {
    const carrierSensitivities = profileSensitivities.map(ps => {
      const sens = ps.sensitivities.find(s => s.carrierId === carrierId);
      return {
        profileName: ps.name,
        sensitivity: sens?.totalSensitivity ?? 0,
      };
    });
    
    // Find the max difference between any two profiles
    let maxDiff = 0;
    let conflictingProfiles: [string, string] = [profiles[0].name, profiles[1].name];
    
    for (let i = 0; i < carrierSensitivities.length; i++) {
      for (let j = i + 1; j < carrierSensitivities.length; j++) {
        const diff = Math.abs(
          carrierSensitivities[i].sensitivity - carrierSensitivities[j].sensitivity
        );
        if (diff > maxDiff) {
          maxDiff = diff;
          conflictingProfiles = [
            carrierSensitivities[i].profileName,
            carrierSensitivities[j].profileName,
          ];
        }
      }
    }
    
    // Calculate overall tension score (sum of all pairwise differences)
    let tensionScore = 0;
    for (let i = 0; i < carrierSensitivities.length; i++) {
      for (let j = i + 1; j < carrierSensitivities.length; j++) {
        tensionScore += Math.abs(
          carrierSensitivities[i].sensitivity - carrierSensitivities[j].sensitivity
        );
      }
    }
    
    return {
      carrierId,
      carrierName: CARRIERS[carrierId].name,
      tensionScore,
      profileSensitivities: carrierSensitivities,
      conflictingProfiles,
      conflictMagnitude: maxDiff,
    };
  });
  
  // Sort by tension score (highest first)
  return tensionCarriers.sort((a, b) => b.tensionScore - a.tensionScore);
}

/**
 * Get the top N carriers that most antagonize profile tensions.
 */
export function getTopProfileTensionCarriers(
  profiles: { name: string; scores: ValueScores }[],
  count: number = 5
): ProfileTensionCarrier[] {
  return calculateProfileTensionCarriers(profiles).slice(0, count);
}
