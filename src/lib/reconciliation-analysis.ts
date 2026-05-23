import { SCHWARTZ_VALUES, ValueScores } from './schwartz-values';

export const CIRCUMFLEX_ORDER = SCHWARTZ_VALUES.map(v => v.code);

export interface ReconciliationValueEntry {
  code: string;
  label: string;
  scores: Record<string, number>;
}

export interface BridgeValueEntry extends ReconciliationValueEntry {
  rationale: string;
}

export interface ReconciliationAnalysis {
  conflictValues: ReconciliationValueEntry[];
  bridgeValues: BridgeValueEntry[];
}

function getCircumflexNeighbors(code: string, radius: number): string[] {
  const idx = CIRCUMFLEX_ORDER.indexOf(code);
  if (idx === -1) return [];
  const n = CIRCUMFLEX_ORDER.length;
  const neighbors = new Set<string>();
  for (let d = 1; d <= radius; d++) {
    neighbors.add(CIRCUMFLEX_ORDER[(idx - d + n) % n]);
    neighbors.add(CIRCUMFLEX_ORDER[(idx + d) % n]);
  }
  return [...neighbors];
}

export function analyzeReconciliation(
  profiles: { name: string; scores: ValueScores }[],
  conflictCount = 3,
  neighborRadius = 2
): ReconciliationAnalysis {
  if (profiles.length < 2) return { conflictValues: [], bridgeValues: [] };

  // Step 1: find conflict values (highest score divergence across profiles)
  const valueDivergences = SCHWARTZ_VALUES.map(sv => {
    const profileScores = profiles.map(p => p.scores[sv.code] ?? 3.5);
    const maxDiff = Math.max(...profileScores) - Math.min(...profileScores);
    const scoreMap: Record<string, number> = {};
    profiles.forEach((p, i) => { scoreMap[p.name] = profileScores[i]; });
    return { code: sv.code, label: sv.label, divergence: maxDiff, scoreMap };
  });

  const conflictValues = valueDivergences
    .sort((a, b) => b.divergence - a.divergence)
    .slice(0, conflictCount)
    .map(({ code, label, scoreMap }) => ({ code, label, scores: scoreMap }));

  const conflictCodes = new Set(conflictValues.map(v => v.code));

  // Step 2: collect circumflex neighbors of all conflict values
  const neighborCodes = new Set<string>();
  for (const code of conflictCodes) {
    for (const neighbor of getCircumflexNeighbors(code, neighborRadius)) {
      if (!conflictCodes.has(neighbor)) neighborCodes.add(neighbor);
    }
  }

  // Step 3: score neighbors for bridging potential
  const neighborEntries = [...neighborCodes].map(code => {
    const sv = SCHWARTZ_VALUES.find(v => v.code === code)!;
    const profileScores = profiles.map(p => p.scores[code] ?? 3.5);
    const avgScore = profileScores.reduce((a, b) => a + b, 0) / profileScores.length;
    const maxDiff = Math.max(...profileScores) - Math.min(...profileScores);
    const bothPositive = profileScores.every(s => s > 3.5);

    // Which conflict values is this adjacent to?
    const adjacentConflicts = [...conflictCodes].filter(cc =>
      getCircumflexNeighbors(cc, neighborRadius).includes(code)
    );
    const adjacentLabels = adjacentConflicts
      .map(cc => SCHWARTZ_VALUES.find(v => v.code === cc)?.label ?? cc)
      .join(' and ');

    const rationale = bothPositive
      ? `Adjacent to ${adjacentLabels} on the circumflex; both profiles score above neutral here (${profileScores.map((s, i) => `${profiles[i].name}: ${s.toFixed(1)}`).join(', ')}).`
      : `Adjacent to ${adjacentLabels} on the circumflex; scores: ${profileScores.map((s, i) => `${profiles[i].name}: ${s.toFixed(1)}`).join(', ')}.`;

    const scoreMap: Record<string, number> = {};
    profiles.forEach((p, i) => { scoreMap[p.name] = profileScores[i]; });

    const bridgeScore = (bothPositive ? 3 : 0) - maxDiff + (avgScore - 3.5);

    return { code, label: sv.label, scores: scoreMap, maxDiff, bridgeScore, rationale };
  });

  // Filter genuinely incompatible neighbors and sort by bridge quality
  const bridgeValues: BridgeValueEntry[] = neighborEntries
    .filter(e => e.maxDiff < 3)
    .sort((a, b) => b.bridgeScore - a.bridgeScore)
    .slice(0, 3)
    .map(({ code, label, scores, rationale }) => ({ code, label, scores, rationale }));

  // Fallback: if no circumflex neighbors qualify, take the least-divergent positive values across all 19
  if (bridgeValues.length === 0) {
    const fallback = valueDivergences
      .filter(v => !conflictCodes.has(v.code))
      .filter(v => Object.values(v.scoreMap).every(s => s > 3.5))
      .sort((a, b) => a.divergence - b.divergence)
      .slice(0, 3)
      .map(({ code, label, scoreMap }) => ({
        code,
        label,
        scores: scoreMap,
        rationale: `Shared positive value across both profiles (global fallback — no circumflex neighbor qualified).`,
      }));
    return { conflictValues, bridgeValues: fallback };
  }

  return { conflictValues, bridgeValues };
}
