/**
 * Job Clarification Logic
 *
 * This module implements the algorithm for identifying which tension carriers
 * would best help clarify undecided values in a job description analysis.
 *
 * Algorithm: Maximum Spread Carrier Selection
 * - For each carrier, calculate the "spread" of polarities across undecided values
 * - Spread = max(polarities) - min(polarities) for that carrier
 * - Select carriers with highest spread, as they best differentiate the undecided values
 *
 * Note: Future enhancement could use variance instead of range for spread calculation.
 * See GitHub issue for discussion of variance vs range tradeoffs.
 */

import { ValueScores, getValueByCode } from './schwartz-values';
import { CarrierId, CARRIERS, getPolarity } from './carriers';

export type ConfidenceLevel = 'high' | 'medium' | 'unspecified';

export interface UndecidedValue {
  code: string;
  label: string;
  currentScore: number;
  confidence: ConfidenceLevel;
}

export interface CarrierSpreadInfo {
  carrierId: CarrierId;
  carrierName: string;
  carrierDescription: string;
  spread: number;
  minPolarity: number;
  maxPolarity: number;
  highPolarityValues: Array<{ code: string; label: string; polarity: number }>;
  lowPolarityValues: Array<{ code: string; label: string; polarity: number }>;
  allPolarities: Array<{ code: string; label: string; polarity: number }>;
}

export interface ClarificationResult {
  undecidedValues: UndecidedValue[];
  selectedCarriers: CarrierSpreadInfo[];
  canClarify: boolean;
  reason?: string;
}

/**
 * Identify values with medium or unspecified confidence
 */
export function identifyUndecidedValues(
  scores: ValueScores,
  confidence: Record<string, ConfidenceLevel>
): UndecidedValue[] {
  const undecided: UndecidedValue[] = [];

  for (const [code, conf] of Object.entries(confidence)) {
    if (conf === 'medium' || conf === 'unspecified') {
      const valueInfo = getValueByCode(code);
      if (valueInfo) {
        undecided.push({
          code,
          label: valueInfo.label,
          currentScore: scores[code] ?? 3.5,
          confidence: conf,
        });
      }
    }
  }

  return undecided;
}

/**
 * Calculate spread for a single carrier across undecided values
 * Spread = max(polarities) - min(polarities)
 * Higher spread means the carrier better differentiates the values
 */
function calculateCarrierSpread(
  carrierId: CarrierId,
  undecidedValues: UndecidedValue[]
): CarrierSpreadInfo {
  const carrier = CARRIERS[carrierId];

  const polarities = undecidedValues.map(v => ({
    code: v.code,
    label: v.label,
    polarity: getPolarity(v.code, carrierId),
  }));

  const polarityValues = polarities.map(p => p.polarity);
  const minPolarity = Math.min(...polarityValues);
  const maxPolarity = Math.max(...polarityValues);
  const spread = maxPolarity - minPolarity;

  // Identify values at extremes (|polarity| > 0.4)
  const highPolarityValues = polarities
    .filter(p => p.polarity > 0.4)
    .sort((a, b) => b.polarity - a.polarity);

  const lowPolarityValues = polarities
    .filter(p => p.polarity < -0.4)
    .sort((a, b) => a.polarity - b.polarity);

  return {
    carrierId,
    carrierName: carrier.name,
    carrierDescription: carrier.description,
    spread,
    minPolarity,
    maxPolarity,
    highPolarityValues,
    lowPolarityValues,
    allPolarities: polarities.sort((a, b) => b.polarity - a.polarity),
  };
}

/**
 * Select optimal carriers that maximize differentiation of undecided values
 *
 * @param undecidedValues - Values with medium/unspecified confidence
 * @param maxCarriers - Maximum number of carriers to select (default 4)
 * @param minSpread - Minimum spread threshold to consider a carrier useful (default 0.8)
 * @returns Ranked list of carriers with their spread info
 */
export function selectOptimalCarriers(
  undecidedValues: UndecidedValue[],
  maxCarriers: number = 4,
  minSpread: number = 0.8
): CarrierSpreadInfo[] {
  if (undecidedValues.length < 2) {
    return [];
  }

  // Calculate spread for all carriers
  const carrierIds = Object.keys(CARRIERS) as CarrierId[];
  const allCarrierSpreads = carrierIds.map(id =>
    calculateCarrierSpread(id, undecidedValues)
  );

  // Sort by spread descending and filter by minimum threshold
  const qualifyingCarriers = allCarrierSpreads
    .filter(c => c.spread >= minSpread)
    .sort((a, b) => b.spread - a.spread);

  // Return top N carriers
  return qualifyingCarriers.slice(0, maxCarriers);
}

/**
 * Main function to analyze job description results and prepare clarification data
 */
export function analyzeForClarification(
  scores: ValueScores,
  confidence: Record<string, ConfidenceLevel>,
  maxCarriers: number = 4,
  minSpread: number = 0.8
): ClarificationResult {
  const undecidedValues = identifyUndecidedValues(scores, confidence);

  if (undecidedValues.length === 0) {
    return {
      undecidedValues: [],
      selectedCarriers: [],
      canClarify: false,
      reason: 'All values have high confidence - no clarification needed.',
    };
  }

  if (undecidedValues.length === 1) {
    return {
      undecidedValues,
      selectedCarriers: [],
      canClarify: false,
      reason: 'Only one undecided value - need at least two to generate meaningful comparisons.',
    };
  }

  const selectedCarriers = selectOptimalCarriers(undecidedValues, maxCarriers, minSpread);

  if (selectedCarriers.length === 0) {
    return {
      undecidedValues,
      selectedCarriers: [],
      canClarify: false,
      reason: `No carriers meet the minimum spread threshold of ${minSpread}. Try lowering the threshold.`,
    };
  }

  return {
    undecidedValues,
    selectedCarriers,
    canClarify: true,
  };
}

/**
 * Calculate updated scores based on user's scenario response
 *
 * Formula: newScore = currentScore + (polarity × responseStrength × 3.5)
 * Where responseStrength ranges from -1.0 (strongly favor B) to +1.0 (strongly favor A)
 *
 * @param currentScores - Current value scores
 * @param carrierId - The carrier used in the scenario
 * @param responseStrength - User's response: -1.0 to +1.0
 * @param undecidedValueCodes - Only update these values
 * @returns Updated scores object
 */
export function calculateUpdatedScores(
  currentScores: ValueScores,
  carrierId: CarrierId,
  responseStrength: number,
  undecidedValueCodes: string[]
): ValueScores {
  const updatedScores = { ...currentScores };

  for (const code of undecidedValueCodes) {
    const polarity = getPolarity(code, carrierId);
    const currentScore = currentScores[code] ?? 3.5;

    // Formula: newScore = currentScore + (polarity × responseStrength × 3.5)
    const delta = polarity * responseStrength * 3.5;
    const newScore = Math.max(0, Math.min(7, currentScore + delta));

    updatedScores[code] = Math.round(newScore * 10) / 10; // Round to 1 decimal
  }

  return updatedScores;
}

/**
 * Convert response scale position to strength value
 * Scale: 1-5 where 1 = Strongly A, 3 = Equal, 5 = Strongly B
 */
export function responseToStrength(scalePosition: 1 | 2 | 3 | 4 | 5): number {
  const mapping: Record<number, number> = {
    1: 1.0,   // Strongly favor A (high polarity side)
    2: 0.5,   // Somewhat favor A
    3: 0.0,   // Equal / no preference
    4: -0.5,  // Somewhat favor B (low polarity side)
    5: -1.0,  // Strongly favor B
  };
  return mapping[scalePosition];
}

/**
 * Get descriptive label for response strength
 */
export function getResponseLabel(scalePosition: 1 | 2 | 3 | 4 | 5): string {
  const labels: Record<number, string> = {
    1: 'Strongly favor A',
    2: 'Somewhat favor A',
    3: 'Equally favor both',
    4: 'Somewhat favor B',
    5: 'Strongly favor B',
  };
  return labels[scalePosition];
}
