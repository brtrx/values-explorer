// Deterministic profile description and system prompt generator
import { 
  SCHWARTZ_VALUES, 
  ValueScores, 
  getTopValues, 
  getBottomValues, 
  getValueByCode,
  calculateHigherOrderScores,
  HigherOrderValue 
} from './schwartz-values';

// Character archetypes with their value patterns
interface Archetype {
  name: string;
  description: string;
  primaryValues: string[]; // Top values this archetype emphasizes
  secondaryPattern?: Partial<Record<HigherOrderValue, 'high' | 'low'>>;
}

const ARCHETYPES: Archetype[] = [
  {
    name: 'Dumbledore',
    description: 'A wise mentor who prioritizes the greater good while nurturing individual growth. Values wisdom, tolerance, and benevolence above personal power.',
    primaryValues: ['UNC', 'UNT', 'BEC', 'SDT'],
    secondaryPattern: { 'self-transcendence': 'high', 'self-enhancement': 'low' },
  },
  {
    name: 'Captain America',
    description: 'A principled leader who embodies duty, tradition, and selfless service. Balances conformity to ideals with fierce protection of others.',
    primaryValues: ['BED', 'COR', 'TRD', 'SES'],
    secondaryPattern: { 'conservation': 'high', 'self-transcendence': 'high' },
  },
  {
    name: 'Tony Stark',
    description: 'A brilliant innovator who pursues excellence and independence. Combines achievement drive with creative self-direction.',
    primaryValues: ['ACM', 'SDT', 'SDA', 'STI'],
    secondaryPattern: { 'openness': 'high', 'self-enhancement': 'high' },
  },
  {
    name: 'Hermione Granger',
    description: 'A devoted scholar who values knowledge, rules, and loyalty to friends. Combines intellectual curiosity with dependability.',
    primaryValues: ['SDT', 'COR', 'BED', 'ACM'],
    secondaryPattern: { 'openness': 'high', 'conservation': 'high' },
  },
  {
    name: 'Gandalf',
    description: 'A humble guide who empowers others while maintaining ancient wisdom. Values nature, tolerance, and gentle influence over control.',
    primaryValues: ['UNN', 'UNT', 'HUM', 'SDT'],
    secondaryPattern: { 'self-transcendence': 'high', 'self-enhancement': 'low' },
  },
  {
    name: 'Leslie Knope',
    description: 'An enthusiastic public servant who combines ambition with genuine care for community. Balances achievement with benevolence.',
    primaryValues: ['BEC', 'ACM', 'SES', 'BED'],
    secondaryPattern: { 'self-transcendence': 'high', 'self-enhancement': 'high' },
  },
  {
    name: "T'Challa",
    description: 'A thoughtful leader who balances tradition with progress. Values security and heritage while remaining open to change.',
    primaryValues: ['TRD', 'SES', 'UNC', 'SDA'],
    secondaryPattern: { 'conservation': 'high', 'openness': 'high' },
  },
  {
    name: 'Spock',
    description: 'A logical mind who values truth and duty over emotion. Prioritizes intellectual self-direction while maintaining conformity to principles.',
    primaryValues: ['SDT', 'COR', 'HUM', 'ACM'],
    secondaryPattern: { 'openness': 'high', 'self-enhancement': 'low' },
  },
];

function calculateArchetypeMatch(scores: ValueScores, archetype: Archetype): number {
  let score = 0;
  
  // Score based on primary values (weighted more heavily)
  const topValues = getTopValues(scores, 6).map(v => v.code);
  archetype.primaryValues.forEach((code, index) => {
    const position = topValues.indexOf(code);
    if (position !== -1) {
      score += (6 - position) * 2; // Higher weight for matching top positions
    }
  });
  
  // Score based on higher-order value patterns
  if (archetype.secondaryPattern) {
    const hoScores = calculateHigherOrderScores(scores);
    const hoArray = Object.entries(hoScores).sort((a, b) => b[1] - a[1]);
    const highHO = hoArray[0][0] as HigherOrderValue;
    const lowHO = hoArray[hoArray.length - 1][0] as HigherOrderValue;
    
    if (archetype.secondaryPattern[highHO] === 'high') score += 3;
    if (archetype.secondaryPattern[lowHO] === 'low') score += 3;
  }
  
  return score;
}

function findBestArchetype(scores: ValueScores): Archetype {
  let bestArchetype = ARCHETYPES[0];
  let bestScore = -Infinity;
  
  ARCHETYPES.forEach(archetype => {
    const matchScore = calculateArchetypeMatch(scores, archetype);
    if (matchScore > bestScore) {
      bestScore = matchScore;
      bestArchetype = archetype;
    }
  });
  
  return bestArchetype;
}

function detectTensions(scores: ValueScores): string[] {
  const tensions: string[] = [];
  const hoScores = calculateHigherOrderScores(scores);
  
  // Check for opposing high scores
  if (hoScores['self-enhancement'] > 4.0 && hoScores['self-transcendence'] > 4.0) {
    tensions.push('high Power values alongside high Benevolence, suggesting a complex leader who seeks influence to help others');
  }
  
  if (hoScores['openness'] > 4.0 && hoScores['conservation'] > 4.0) {
    tensions.push('strong Openness combined with Conservation values, indicating someone who innovates within established frameworks');
  }
  
  // Check specific value tensions
  const pod = scores['POD'] ?? 3.5;
  const bec = scores['BEC'] ?? 3.5;
  if (pod > 4.5 && bec > 4.5) {
    tensions.push('unusually high Power-dominance paired with Benevolence-caring, suggesting protective or parental leadership');
  }
  
  const sda = scores['SDA'] ?? 3.5;
  const cor = scores['COR'] ?? 3.5;
  if (sda > 4.5 && cor > 4.5) {
    tensions.push('valuing both independent action and rule-following, potentially indicating selective conformity');
  }
  
  return tensions;
}

export function generateDescription(scores: ValueScores): string {
  const topValues = getTopValues(scores, 3);
  const bottomValues = getBottomValues(scores, 3);
  const archetype = findBestArchetype(scores);
  const tensions = detectTensions(scores);
  
  // Build the description
  let description = '## VALUE PROFILE SUMMARY\n\n';
  
  // Top values paragraph
  const topLabels = topValues.map(v => v.label);
  description += `This profile shows strongest emphasis on **${topLabels[0]}** (${scores[topValues[0].code]?.toFixed(2)}), `;
  description += `**${topLabels[1]}** (${scores[topValues[1].code]?.toFixed(2)}), and `;
  description += `**${topLabels[2]}** (${scores[topValues[2].code]?.toFixed(2)}). `;
  
  // Describe what top values mean
  description += `This suggests someone who ${getTopValueMeaning(topValues)}. `;
  
  // Bottom values
  const bottomLabels = bottomValues.map(v => v.label);
  description += `\n\nLess emphasized are **${bottomLabels[0]}** (${scores[bottomValues[0].code]?.toFixed(2)}), `;
  description += `**${bottomLabels[1]}** (${scores[bottomValues[1].code]?.toFixed(2)}), and `;
  description += `**${bottomLabels[2]}** (${scores[bottomValues[2].code]?.toFixed(2)}). `;
  description += `This indicates ${getBottomValueMeaning(bottomValues)}.`;
  
  // Tensions
  if (tensions.length > 0) {
    description += '\n\n**Notable patterns:** ';
    description += tensions[0] + '.';
  }
  
  // Archetype section
  description += '\n\n## WHO AM I MOST LIKE?\n\n';
  description += `**${archetype.name}**\n\n`;
  description += archetype.description + ' ';
  
  // Add specific rationale based on top values
  const matchingValues = archetype.primaryValues
    .filter(code => topValues.some(v => v.code === code))
    .map(code => getValueByCode(code)?.label)
    .filter(Boolean);
  
  if (matchingValues.length > 0) {
    description += `Like ${archetype.name}, this profile emphasizes ${matchingValues.join(' and ')}, `;
    description += `reflecting a similar approach to navigating challenges and relationships.`;
  } else {
    description += `The overall value pattern aligns with ${archetype.name}'s approach to balancing personal goals with broader concerns.`;
  }
  
  return description;
}

function getTopValueMeaning(topValues: ReturnType<typeof getTopValues>): string {
  const codes = topValues.map(v => v.code);
  
  if (codes.includes('UNC') || codes.includes('UNT') || codes.includes('UNN')) {
    return 'prioritizes universal welfare and embraces diverse perspectives';
  }
  if (codes.includes('BEC') || codes.includes('BED')) {
    return 'deeply values close relationships and being there for loved ones';
  }
  if (codes.includes('SDT') || codes.includes('SDA')) {
    return 'treasures autonomy and the freedom to think and act independently';
  }
  if (codes.includes('ACM') || codes.includes('POD')) {
    return 'is driven by achievement and the desire to excel';
  }
  if (codes.includes('TRD') || codes.includes('COR')) {
    return 'values tradition, order, and adherence to established norms';
  }
  if (codes.includes('SEO') || codes.includes('SES')) {
    return 'prioritizes safety, stability, and security in life';
  }
  
  return 'has a distinctive combination of motivational priorities';
}

function getBottomValueMeaning(bottomValues: ReturnType<typeof getBottomValues>): string {
  const codes = bottomValues.map(v => v.code);
  
  if (codes.includes('POD') || codes.includes('POR')) {
    return 'less concern with accumulating power or material resources';
  }
  if (codes.includes('HED') || codes.includes('STI')) {
    return 'a more measured approach to pleasure-seeking and novelty';
  }
  if (codes.includes('TRD') || codes.includes('COR')) {
    return 'flexibility regarding traditional expectations and rules';
  }
  if (codes.includes('FAC') || codes.includes('HUM')) {
    return 'less focus on social image or excessive modesty';
  }
  
  return 'particular areas receiving less motivational emphasis';
}

export function generateSystemPrompt(scores: ValueScores): string {
  let prompt = 'You are an AI assistant with the following values based on a PVQ-RR survey:\n\n';
  
  SCHWARTZ_VALUES.forEach(value => {
    const score = scores[value.code] ?? 3.5;
    prompt += `${value.code}: ${value.label} (Score: ${score.toFixed(2)})\n`;
  });
  
  prompt += '\n---\n\n';
  prompt += 'Behavioral Guidelines:\n';
  
  // Add behavioral guidance based on top values
  const topValues = getTopValues(scores, 3);
  const bottomValues = getBottomValues(scores, 3);
  
  prompt += `- Strongly emphasize: ${topValues.map(v => v.label).join(', ')}\n`;
  prompt += `- De-emphasize: ${bottomValues.map(v => v.label).join(', ')}\n`;
  
  // Add specific behavioral notes
  const hoScores = calculateHigherOrderScores(scores);
  const dominantHO = Object.entries(hoScores).sort((a, b) => b[1] - a[1])[0][0];
  
  switch (dominantHO) {
    case 'self-transcendence':
      prompt += '- Prioritize others\' wellbeing and consider diverse perspectives\n';
      prompt += '- Show empathy and concern for justice and equality\n';
      break;
    case 'openness':
      prompt += '- Encourage creative thinking and independent exploration\n';
      prompt += '- Embrace novelty and support autonomous decision-making\n';
      break;
    case 'conservation':
      prompt += '- Respect established norms and provide stable, reliable guidance\n';
      prompt += '- Value tradition and consider security implications\n';
      break;
    case 'self-enhancement':
      prompt += '- Focus on excellence, achievement, and measurable success\n';
      prompt += '- Provide confident, decisive guidance\n';
      break;
  }
  
  return prompt;
}

export function generateBoth(scores: ValueScores): { description: string; systemPrompt: string } {
  return {
    description: generateDescription(scores),
    systemPrompt: generateSystemPrompt(scores),
  };
}
