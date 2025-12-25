// Schwartz PVQ-RR Values Configuration
// Reference: https://www.researchgate.net/publication/316705732_Revised_PVQ-RR

export interface SchwartzValue {
  code: string;
  label: string;
  description: string;
  higherOrderValue: HigherOrderValue;
}

export type HigherOrderValue = 
  | 'self-transcendence'
  | 'conservation'
  | 'self-enhancement'
  | 'openness';

export const HIGHER_ORDER_VALUES: Record<HigherOrderValue, {
  label: string;
  description: string;
  color: string;
}> = {
  'openness': {
    label: 'Openness to Change',
    description: 'Independent thought and action, readiness for new experiences',
    color: 'quadrant-openness',
  },
  'self-transcendence': {
    label: 'Self-Transcendence',
    description: 'Concern for the welfare and interests of others',
    color: 'quadrant-self-transcendence',
  },
  'conservation': {
    label: 'Conservation',
    description: 'Self-restriction, order, and resistance to change',
    color: 'quadrant-conservation',
  },
  'self-enhancement': {
    label: 'Self-Enhancement',
    description: 'Personal success and dominance over others',
    color: 'quadrant-self-enhancement',
  },
};

// The 19 PVQ-RR values in canonical order
export const SCHWARTZ_VALUES: SchwartzValue[] = [
  // Openness to Change
  { code: 'SDT', label: 'Self-direction – thought', description: 'Freedom to cultivate one\'s own ideas and abilities', higherOrderValue: 'openness' },
  { code: 'SDA', label: 'Self-direction – action', description: 'Freedom to determine one\'s own actions and plans', higherOrderValue: 'openness' },
  { code: 'STI', label: 'Stimulation', description: 'Excitement, novelty, and challenge in life', higherOrderValue: 'openness' },
  { code: 'HED', label: 'Hedonism', description: 'Pleasure and sensuous gratification for oneself', higherOrderValue: 'openness' },
  
  // Self-Enhancement
  { code: 'ACM', label: 'Achievement', description: 'Success according to social standards', higherOrderValue: 'self-enhancement' },
  { code: 'POD', label: 'Power – dominance', description: 'Power through exercising control over people', higherOrderValue: 'self-enhancement' },
  { code: 'POR', label: 'Power – resources', description: 'Power through control of material and social resources', higherOrderValue: 'self-enhancement' },
  { code: 'FAC', label: 'Face', description: 'Maintaining one\'s public image and avoiding humiliation', higherOrderValue: 'self-enhancement' },
  
  // Conservation
  { code: 'SEO', label: 'Security – personal', description: 'Safety in one\'s immediate environment', higherOrderValue: 'conservation' },
  { code: 'SES', label: 'Security – societal', description: 'Safety and stability in the wider society', higherOrderValue: 'conservation' },
  { code: 'TRD', label: 'Tradition', description: 'Maintaining and preserving cultural, family, or religious traditions', higherOrderValue: 'conservation' },
  { code: 'COR', label: 'Conformity – rules', description: 'Compliance with rules, laws, and formal obligations', higherOrderValue: 'conservation' },
  { code: 'COI', label: 'Conformity – interpersonal', description: 'Avoidance of upsetting or harming other people', higherOrderValue: 'conservation' },
  { code: 'HUM', label: 'Humility', description: 'Recognizing one\'s insignificance in the larger scheme of things', higherOrderValue: 'conservation' },
  
  // Self-Transcendence
  { code: 'BEC', label: 'Benevolence – caring', description: 'Devotion to the welfare of in-group members', higherOrderValue: 'self-transcendence' },
  { code: 'BED', label: 'Benevolence – dependability', description: 'Being a reliable and trustworthy member of the in-group', higherOrderValue: 'self-transcendence' },
  { code: 'UNC', label: 'Universalism – concern', description: 'Commitment to equality, justice, and protection for all people', higherOrderValue: 'self-transcendence' },
  { code: 'UNN', label: 'Universalism – nature', description: 'Preservation of the natural environment', higherOrderValue: 'self-transcendence' },
  { code: 'UNT', label: 'Universalism – tolerance', description: 'Acceptance and understanding of those who are different', higherOrderValue: 'self-transcendence' },
];

export const VALUE_CODES = SCHWARTZ_VALUES.map(v => v.code);

export type ValueScores = Record<string, number>;

export const DEFAULT_SCORES: ValueScores = VALUE_CODES.reduce((acc, code) => {
  acc[code] = 3.5; // Middle of 1-6 range
  return acc;
}, {} as ValueScores);

// Sample profile matching typical research patterns
export const SAMPLE_PROFILE_SCORES: ValueScores = {
  SDT: 5.2,
  SDA: 4.8,
  STI: 4.1,
  HED: 3.9,
  ACM: 4.5,
  POD: 2.3,
  POR: 2.1,
  FAC: 3.2,
  SEO: 4.0,
  SES: 3.8,
  TRD: 3.5,
  COR: 3.7,
  COI: 4.6,
  HUM: 4.2,
  BEC: 5.4,
  BED: 5.1,
  UNC: 5.3,
  UNN: 4.7,
  UNT: 5.0,
};

export function getValueByCode(code: string): SchwartzValue | undefined {
  return SCHWARTZ_VALUES.find(v => v.code === code);
}

export function getValuesByHigherOrder(higherOrder: HigherOrderValue): SchwartzValue[] {
  return SCHWARTZ_VALUES.filter(v => v.higherOrderValue === higherOrder);
}

export function calculateHigherOrderScores(scores: ValueScores): Record<HigherOrderValue, number> {
  const higherOrderValues: HigherOrderValue[] = ['openness', 'self-transcendence', 'conservation', 'self-enhancement'];
  
  return higherOrderValues.reduce((acc, ho) => {
    const values = getValuesByHigherOrder(ho);
    const sum = values.reduce((s, v) => s + (scores[v.code] ?? 3.5), 0);
    acc[ho] = sum / values.length;
    return acc;
  }, {} as Record<HigherOrderValue, number>);
}

export function getTopValues(scores: ValueScores, count: number = 3): SchwartzValue[] {
  return [...SCHWARTZ_VALUES]
    .sort((a, b) => (scores[b.code] ?? 0) - (scores[a.code] ?? 0))
    .slice(0, count);
}

export function getBottomValues(scores: ValueScores, count: number = 3): SchwartzValue[] {
  return [...SCHWARTZ_VALUES]
    .sort((a, b) => (scores[a.code] ?? 0) - (scores[b.code] ?? 0))
    .slice(0, count);
}
