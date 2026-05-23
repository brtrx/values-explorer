import { ReconciliationAnalysis } from './reconciliation-analysis';

export interface PromptPair {
  system: string;
  user: string;
}

interface ArchetypeData {
  name: string;
  description: string;
  valueProfile: Record<string, number>;
}

const SCHWARTZ_REFERENCE = `Value code reference:
- SDT (Self-direction Thought), SDA (Self-direction Action) - Independence, creativity
- STI (Stimulation), HED (Hedonism) - Excitement, pleasure
- ACM (Achievement), POD (Power Dominance), POR (Power Resources) - Success, control
- FAC (Face), SEO (Security Personal), SES (Security Societal) - Status, safety
- TRD (Tradition), COR (Conformity Rules), COI (Conformity Interpersonal) - Custom, obedience
- HUM (Humility), BED (Benevolence Dependability), BEC (Benevolence Caring) - Modesty, loyalty
- UNC (Universalism Concern), UNN (Universalism Nature), UNT (Universalism Tolerance) - Justice, equality`;

function buildArchetypeSummary(archetypes: ArchetypeData[]): string {
  return archetypes.map(a => {
    const highValues = Object.entries(a.valueProfile)
      .filter(([, v]) => v >= 2)
      .map(([k, v]) => `${k}(+${v})`)
      .join(', ');
    const lowValues = Object.entries(a.valueProfile)
      .filter(([, v]) => v <= -1)
      .map(([k, v]) => `${k}(${v})`)
      .join(', ');
    return `**${a.name}**: ${a.description}\n- Core values: ${highValues || 'balanced'}\n- Avoided/opposed: ${lowValues || 'none strongly opposed'}`;
  }).join('\n\n');
}

export function buildConflictPrompt(archetypes: ArchetypeData[], stressors?: string[]): PromptPair {
  const summary = buildArchetypeSummary(archetypes);
  const stressorsLine = stressors && stressors.length > 0
    ? `\nThese stressors have been identified as the strongest sources of tension between the characters: ${stressors.join(', ')}. Ground the conflict in one or more of these specific pressures — make them feel like the real stakes.\n`
    : '';

  return {
    system: `You are a dramatist and expert in Schwartz's Theory of Basic Human Values. \nYou create realistic conflict scenarios and dialogues between characters based on their value profiles.\n\n${SCHWARTZ_REFERENCE}\n\nWrite dialogue that feels authentic to each character's voice and worldview.\nShow how their differing values create genuine tension, not just surface disagreement.`,
    user: `Given these characters and their value profiles:\n\n${summary}\n${stressorsLine}\nCreate a compelling conflict scenario:\n\n1. SCENARIO (2-3 sentences): Describe a specific, realistic situation where these characters' values would naturally clash. Be concrete about the setting and stakes.\n\n2. DIALOGUE (8-12 exchanges): Write a conversation that demonstrates their value conflict. Each character should:\n   - Speak authentically to their worldview\n   - Reveal their core values through what they argue for\n   - Show genuine tension, not just polite disagreement\n   - React to the other's perspective in a way true to their character\n\nFormat the dialogue as:\n**[Character Name]:** "Their line of dialogue"\n\nMake the conflict feel real and the characters feel alive.`,
  };
}

export function buildReconciliationPrompt(
  archetypes: ArchetypeData[],
  conflictScenario: string,
  analysis: ReconciliationAnalysis,
): PromptPair {
  const summary = buildArchetypeSummary(archetypes);

  const conflictSection = analysis.conflictValues.length > 0
    ? analysis.conflictValues.map(v => {
        const scoreStr = Object.entries(v.scores)
          .map(([name, score]) => `${name}: ${score.toFixed(1)}/7`)
          .join(', ');
        return `- ${v.label} (${v.code}): ${scoreStr}`;
      }).join('\n')
    : '- (no clear divergence identified)';

  const bridgeSection = analysis.bridgeValues.length > 0
    ? analysis.bridgeValues.map(v => `- ${v.label} (${v.code}): ${v.rationale}`).join('\n')
    : '- (no clear circumflex bridge — focus on latent common ground)';

  return {
    system: `You are a conflict mediator and expert in Schwartz's Theory of Basic Human Values.\nYou find workable bridges between people with opposing value systems, grounded in the circumflex geometry of human motivation.\n\n${SCHWARTZ_REFERENCE}\n\nAdjacent values on the Schwartz circumflex are motivationally compatible. Bridge values — values adjacent to the conflict region where both characters have common ground — are the most psychologically natural path to reconciliation. Show reconciliation beginning, not completing.`,
    user: `Given these characters and their value profiles:\n\n${summary}\n\nThey have just had this conflict:\n---\n${conflictScenario}\n---\n\nPre-analysis of value tensions and circumflex bridges:\n\nConflict values (where they diverge most):\n${conflictSection}\n\nBridge values (adjacent to the conflict on the Schwartz circumflex, where they are compatible):\n${bridgeSection}\n\nGround the reconciliation in these bridge values — they represent the motivational common ground closest to where the conflict lives on the circumflex.\n\nGenerate:\n\n1. COMMON GROUND (2-3 sentences): What do these characters genuinely share beneath their conflict? Root this specifically in the bridge values above — name them, show what they mean concretely to each character.\n\n2. RECONCILIATION PATH (3-4 sentences): What specific steps could help them reach a workable understanding? Consider what each character would need to hear or acknowledge. Reinterpret the original conflict through the lens of the bridge values — show how the same stakes look different when viewed from shared ground.\n\n3. DIALOGUE (6-8 exchanges): Continue the scene where the conflict left off. Show the reconciliation beginning to unfold through the bridge values as the turning point. Each character should:\n   - Stay true to their worldview (values don't vanish overnight)\n   - Find something real to recognize in the other's position\n   - Move toward workable understanding through their authentic voice\n\nFormat the dialogue as:\n**[Character Name]:** "Their line of dialogue"\n\nShow a real shift — not a sudden agreement, but the first genuine moments of understanding.`,
  };
}
