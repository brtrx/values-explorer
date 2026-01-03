/**
 * Polarity Explanations
 * 
 * This file provides human-readable explanations for why each value
 * has a particular polarity score on each carrier. These explanations
 * help users understand the psychological rationale behind the mappings.
 */

import { CarrierId } from './carriers';

/**
 * Each explanation describes why increasing the carrier's intensity
 * tends to satisfy (+) or frustrate (-) the value.
 */
export type PolarityExplanationMap = Record<string, Record<CarrierId, string>>;

export const POLARITY_EXPLANATIONS: PolarityExplanationMap = {
  // =========================================================================
  // OPENNESS TO CHANGE VALUES
  // =========================================================================

  SDT: {
    risk_uncertainty: "Intellectual uncertainty invites exploration of new ideas, which self-directed thinkers embrace.",
    control_authority: "External control over thinking directly opposes the core need for intellectual autonomy.",
    resources_allocation: "Material resources have minimal direct impact on freedom of thought.",
    time_urgency: "Time pressure constrains the reflective thinking that self-directed thought requires.",
    attention_recognition: "The drive to think independently is orthogonal to seeking recognition.",
    norm_enforcement: "Prescribed ways of thinking frustrate the need to cultivate one's own ideas.",
    choice_freedom: "Having options to explore intellectually is central to self-directed thought.",
    inclusion_exclusion: "Group membership has little bearing on intellectual freedom.",
    truth_disclosure: "Access to information supports independent inquiry and idea formation.",
    effort_sacrifice: "Self-directed thinkers willingly invest effort in developing their ideas.",
    change_stability: "New ideas and perspectives are welcomed as opportunities for growth.",
    boundary_permeability: "Openness to outside perspectives enriches intellectual exploration.",
  },

  SDA: {
    risk_uncertainty: "Those who value autonomous action accept risk as the price of charting their own path.",
    control_authority: "External control over actions is the primary obstacle to self-direction.",
    resources_allocation: "Resources provide the means for independent action and self-sufficiency.",
    time_urgency: "Self-paced action is preferred; external deadlines feel constraining.",
    attention_recognition: "The drive for autonomous action doesn't depend on others' attention.",
    norm_enforcement: "Behavioral rules and expectations limit freedom to act independently.",
    choice_freedom: "Having options and alternatives is essential to determining one's own path.",
    inclusion_exclusion: "Group belonging matters less than freedom to act independently.",
    truth_disclosure: "Information enables better decision-making about one's actions.",
    effort_sacrifice: "Willingness to sacrifice for freedom; autonomy is worth the cost.",
    change_stability: "Openness to new paths and ways of living.",
    boundary_permeability: "Independence from group expectations; charts own course.",
  },

  STI: {
    risk_uncertainty: "Uncertainty and unpredictability are sources of excitement and novelty.",
    control_authority: "Predictable, controlled environments feel boring and stifling.",
    resources_allocation: "Some resources enable adventurous pursuits and new experiences.",
    time_urgency: "Time pressure can add excitement and adrenaline to situations.",
    attention_recognition: "The spotlight can be part of exciting experiences.",
    norm_enforcement: "Rigid rules make life predictable and dull.",
    choice_freedom: "Multiple options provide opportunities to explore and seek novelty.",
    inclusion_exclusion: "New social experiences and unfamiliar groups can be exciting.",
    truth_disclosure: "Hidden or mysterious things spark curiosity and excitement.",
    effort_sacrifice: "Challenge and difficulty make experiences more stimulating.",
    change_stability: "Change itself is exciting; stability is boring.",
    boundary_permeability: "Outsiders and unfamiliar perspectives bring excitement.",
  },

  HED: {
    risk_uncertainty: "Uncertainty threatens reliable access to pleasurable experiences.",
    control_authority: "Control by others can limit opportunities for personal enjoyment.",
    resources_allocation: "Material resources often enable pleasurable experiences.",
    time_urgency: "Pleasure requires leisure time; pressure reduces enjoyment.",
    attention_recognition: "Some enjoyment comes from being noticed and admired.",
    norm_enforcement: "Rules often restrict indulgent or hedonistic behaviors.",
    choice_freedom: "Options allow selection of the most pleasurable alternatives.",
    inclusion_exclusion: "Social belonging has limited direct impact on personal pleasure.",
    truth_disclosure: "Truth-telling is largely unrelated to personal gratification.",
    effort_sacrifice: "Effort and discomfort are antithetical to pleasure-seeking.",
    change_stability: "Novelty can bring new pleasures, but stability ensures familiar ones.",
    boundary_permeability: "Group boundaries have minimal impact on personal pleasure.",
  },

  // =========================================================================
  // SELF-ENHANCEMENT VALUES
  // =========================================================================

  ACM: {
    risk_uncertainty: "Calculated risks are acceptable when pursuing achievement and success.",
    control_authority: "Hierarchy can be navigated strategically to achieve success.",
    resources_allocation: "Resources are tools that enable accomplishment and success.",
    time_urgency: "Deadlines and competition drive high performance.",
    attention_recognition: "Public recognition validates achievement and motivates further success.",
    norm_enforcement: "Success often comes through excelling within established standards.",
    choice_freedom: "Multiple paths to success provide strategic options.",
    inclusion_exclusion: "Being part of successful, high-status groups reinforces achievement.",
    truth_disclosure: "Information is managed strategically in pursuit of success.",
    effort_sacrifice: "Hard work and dedication are expected on the path to achievement.",
    change_stability: "Adaptation and flexibility serve achievement when needed.",
    boundary_permeability: "Focus on networks and relationships that advance success.",
  },

  POD: {
    risk_uncertainty: "Calculated risks are acceptable when seeking to gain control over others.",
    control_authority: "Being the authority is the core expression of dominance.",
    resources_allocation: "Resources serve as instruments of control over others.",
    time_urgency: "Urgency can be used as a pressure tactic to maintain dominance.",
    attention_recognition: "Visibility reinforces and demonstrates dominance.",
    norm_enforcement: "Rules can be wielded to control others' behavior.",
    choice_freedom: "Dominance involves limiting others' freedom while maintaining one's own.",
    inclusion_exclusion: "Controlling who belongs reinforces power hierarchies.",
    truth_disclosure: "Information is power; controlling it maintains dominance.",
    effort_sacrifice: "Others should sacrifice; the dominant expect to be served.",
    change_stability: "Change is acceptable only if it protects or enhances power.",
    boundary_permeability: "Boundaries are managed strategically to maintain dominance.",
  },

  POR: {
    risk_uncertainty: "Resources need protection from risk and uncertainty.",
    control_authority: "Wealth and resources confer authority and status.",
    resources_allocation: "Controlling material resources is the core expression of this value.",
    time_urgency: "Resources can be used to buy time and reduce pressure.",
    attention_recognition: "Wealth brings social status and recognition.",
    norm_enforcement: "Rules and property rights protect accumulated resources.",
    choice_freedom: "Indifferent to others' freedom; focused on resource control.",
    inclusion_exclusion: "Wealth often defines access to elite circles.",
    truth_disclosure: "Financial information is protected; transparency can be threatening.",
    effort_sacrifice: "Investment and returns; effort should yield material gains.",
    change_stability: "Change threatens current holdings and accumulated wealth.",
    boundary_permeability: "Transactional view of relationships based on exchange.",
  },

  FAC: {
    risk_uncertainty: "Risk threatens reputation and the ability to maintain face.",
    control_authority: "Status and position contribute to public image.",
    resources_allocation: "Visible resources signal success and status.",
    time_urgency: "Pressure increases the risk of errors that damage reputation.",
    attention_recognition: "Positive attention is desired, but scrutiny is feared.",
    norm_enforcement: "Following social norms protects against criticism.",
    choice_freedom: "Choices are constrained by image management needs.",
    inclusion_exclusion: "Being included signals social value and status.",
    truth_disclosure: "Unflattering truths must be concealed to protect image.",
    effort_sacrifice: "Effort is invested in maintaining and enhancing reputation.",
    change_stability: "Change brings risk of status loss or embarrassment.",
    boundary_permeability: "Preference for respected, high-status group membership.",
  },

  // =========================================================================
  // CONSERVATION VALUES
  // =========================================================================

  SEO: {
    risk_uncertainty: "Personal safety requires minimizing uncertainty and unpredictability.",
    control_authority: "Authority and structure provide predictability and protection.",
    resources_allocation: "Material security serves as a buffer against threats.",
    time_urgency: "Pressure and urgency feel threatening and destabilizing.",
    attention_recognition: "Exposure and visibility feel risky and vulnerable.",
    norm_enforcement: "Rules and order create a predictable, safe environment.",
    choice_freedom: "Too many choices can feel overwhelming and anxiety-inducing.",
    inclusion_exclusion: "In-group membership provides safety and protection.",
    truth_disclosure: "Some secrets feel necessary for personal protection.",
    effort_sacrifice: "Willing to work for security and stability.",
    change_stability: "Change is inherently threatening to personal security.",
    boundary_permeability: "Outsiders and unknowns represent potential threats.",
  },

  SES: {
    risk_uncertainty: "Societal stability requires managing collective risks and uncertainties.",
    control_authority: "Strong institutions and governance maintain social order.",
    resources_allocation: "Social safety nets protect vulnerable members of society.",
    time_urgency: "Building stable institutions requires time; pressure threatens stability.",
    attention_recognition: "Personal attention-seeking is orthogonal to societal security.",
    norm_enforcement: "Social order depends on rules being followed and enforced.",
    choice_freedom: "Some constraints are necessary for collective security.",
    inclusion_exclusion: "Social cohesion strengthens collective security.",
    truth_disclosure: "Transparency in governance builds trust and stability.",
    effort_sacrifice: "Contributing to society strengthens collective security.",
    change_stability: "Rapid social change threatens established institutions.",
    boundary_permeability: "Protecting society from external threats matters.",
  },

  TRD: {
    risk_uncertainty: "Traditional practices provide tested, reliable guides for living.",
    control_authority: "Traditional authorities (elders, religious leaders) are respected.",
    resources_allocation: "Material concerns are secondary to cultural and spiritual heritage.",
    time_urgency: "Honoring tradition requires time; pressure undermines ritual observance.",
    attention_recognition: "Personal attention matters less than upholding heritage.",
    norm_enforcement: "Traditional norms and customs should be maintained.",
    choice_freedom: "Tradition provides guidance that limits arbitrary choice.",
    inclusion_exclusion: "Traditional group identity is valued and maintained.",
    truth_disclosure: "Depends on what traditions prescribe about honesty.",
    effort_sacrifice: "Sacrifice for tradition and cultural preservation is valued.",
    change_stability: "Preserving the status quo and resisting change is central.",
    boundary_permeability: "Traditional boundaries between groups are maintained.",
  },

  COR: {
    risk_uncertainty: "Rules reduce uncertainty by providing clear guidelines.",
    control_authority: "Legitimate authority deserves respect and compliance.",
    resources_allocation: "Material concerns are secondary to following rules.",
    time_urgency: "Meeting deadlines is part of following obligations.",
    attention_recognition: "Conformists don't seek individual attention.",
    norm_enforcement: "Compliance with rules is the core expression of this value.",
    choice_freedom: "Constraints and obligations are accepted as proper.",
    inclusion_exclusion: "Conforming helps maintain group membership.",
    truth_disclosure: "Honesty is required when rules demand it.",
    effort_sacrifice: "Duty and obligation require effort.",
    change_stability: "Existing rules and structures are valued.",
    boundary_permeability: "Formal categories and distinctions are respected.",
  },

  COI: {
    risk_uncertainty: "Risky social situations might lead to upsetting others.",
    control_authority: "Deferring to others helps avoid interpersonal conflict.",
    resources_allocation: "Material concerns are secondary to interpersonal harmony.",
    time_urgency: "Considering others' feelings requires time and care.",
    attention_recognition: "The spotlight risks inadvertently offending others.",
    norm_enforcement: "Social norms guide behavior to avoid giving offense.",
    choice_freedom: "Choices are constrained by concern for others' feelings.",
    inclusion_exclusion: "Harmony within the group is highly valued.",
    truth_disclosure: "White lies may be justified to protect others' feelings.",
    effort_sacrifice: "Sacrificing personal preferences maintains harmony.",
    change_stability: "Change may upset established relationships.",
    boundary_permeability: "Interpersonal harmony focuses on known relationships.",
  },

  HUM: {
    risk_uncertainty: "Uncertainty is accepted as part of life's larger scheme.",
    control_authority: "Seeking authority contradicts recognition of one's insignificance.",
    resources_allocation: "Seeking excess resources contradicts humility.",
    time_urgency: "Patience and acceptance are valued over urgency.",
    attention_recognition: "Seeking attention directly opposes humility.",
    norm_enforcement: "Acceptance of one's place in the social order.",
    choice_freedom: "Neither driven to maximize nor minimize options.",
    inclusion_exclusion: "Special status is not sought or needed.",
    truth_disclosure: "Honest acknowledgment of one's limitations.",
    effort_sacrifice: "Willingness to serve others without seeking credit.",
    change_stability: "Acceptance of circumstances as they are.",
    boundary_permeability: "Sees all people as fundamentally equal.",
  },

  // =========================================================================
  // SELF-TRANSCENDENCE VALUES
  // =========================================================================

  BEC: {
    risk_uncertainty: "Risks are acceptable when protecting loved ones.",
    control_authority: "Authority is irrelevant to caring for close others.",
    resources_allocation: "Resources are shared generously with in-group members.",
    time_urgency: "Time is made for caring responsibilities.",
    attention_recognition: "Caring doesn't require credit or recognition.",
    norm_enforcement: "Social norms of care and mutual support are valued.",
    choice_freedom: "Freedom is less important than serving close others.",
    inclusion_exclusion: "Strong focus on the welfare of in-group members.",
    truth_disclosure: "Honest, caring relationships require truthfulness.",
    effort_sacrifice: "Willingness to sacrifice for loved ones is central.",
    change_stability: "Change is neither sought nor resisted in caregiving.",
    boundary_permeability: "Priority given to close others over distant strangers.",
  },

  BED: {
    risk_uncertainty: "Reliability requires stability and predictability.",
    control_authority: "Respects commitments and obligations to others.",
    resources_allocation: "Provides reliably for group members' needs.",
    time_urgency: "Meets commitments and deadlines dependably.",
    attention_recognition: "Dependability doesn't require public recognition.",
    norm_enforcement: "Keeping promises and honoring norms builds trust.",
    choice_freedom: "Constrained by commitments to others.",
    inclusion_exclusion: "Loyal and dependable within one's group.",
    truth_disclosure: "Honesty is essential for trustworthiness.",
    effort_sacrifice: "Works hard to be reliable and dependable.",
    change_stability: "Consistency and predictability are valued.",
    boundary_permeability: "Focused on being dependable to known others.",
  },

  UNC: {
    risk_uncertainty: "Risks are acceptable when fighting for justice.",
    control_authority: "Unjust authority should be questioned and challenged.",
    resources_allocation: "Fair distribution of resources for all people.",
    time_urgency: "Injustice creates moral urgency for action.",
    attention_recognition: "Personal attention is secondary to justice.",
    norm_enforcement: "Just rules are valued; unjust ones should change.",
    choice_freedom: "Freedom and rights should extend to all people.",
    inclusion_exclusion: "Exclusion of any group is unjust.",
    truth_disclosure: "Truth serves justice and accountability.",
    effort_sacrifice: "Sacrifice for justice and equality is valued.",
    change_stability: "Change is necessary to achieve justice.",
    boundary_permeability: "All people count equally regardless of group.",
  },

  UNN: {
    risk_uncertainty: "Uncertain ecological action is still necessary.",
    control_authority: "Questions exploitative systems that harm nature.",
    resources_allocation: "Opposes unsustainable resource exploitation.",
    time_urgency: "Environmental crises create moral urgency.",
    attention_recognition: "Personal attention is secondary to nature.",
    norm_enforcement: "Environmental regulations should be followed.",
    choice_freedom: "Freedom should include environmental responsibility.",
    inclusion_exclusion: "Nature is a stakeholder deserving consideration.",
    truth_disclosure: "Environmental truth should be revealed.",
    effort_sacrifice: "Sacrifice for environmental protection is valued.",
    change_stability: "Unsustainable patterns must change.",
    boundary_permeability: "Non-human life counts as morally significant.",
  },

  UNT: {
    risk_uncertainty: "Embraces difference and the unknown in others.",
    control_authority: "Questions exclusionary or discriminatory authority.",
    resources_allocation: "Fair access to resources for all groups.",
    time_urgency: "Understanding difference requires patience.",
    attention_recognition: "Personal attention is orthogonal to tolerance.",
    norm_enforcement: "Rigid norms that exclude difference are questioned.",
    choice_freedom: "Freedom for diverse choices and lifestyles.",
    inclusion_exclusion: "Opposes exclusion based on difference.",
    truth_disclosure: "Dialogue and understanding require honesty.",
    effort_sacrifice: "Effort to understand those who are different.",
    change_stability: "Embraces social change toward greater tolerance.",
    boundary_permeability: "Openness to different people is central.",
  },
};

/**
 * Get the explanation for a specific value-carrier polarity.
 */
export function getPolarityExplanation(valueCode: string, carrierId: CarrierId): string | undefined {
  return POLARITY_EXPLANATIONS[valueCode]?.[carrierId];
}
