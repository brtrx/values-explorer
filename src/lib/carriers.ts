/**
 * Carriers: Decision-Space Primitives for Value-Scenario Generation
 * 
 * CONCEPTUAL FRAMEWORK:
 * 
 * Schwartz values exist in MOTIVATION SPACE — they describe what people care about.
 * But values alone don't predict behavior; they require a DECISION CONTEXT.
 * 
 * Carriers exist in DECISION SPACE — they represent forms of scarcity, constraint,
 * or tension that force tradeoffs and make latent value differences behaviorally salient.
 * 
 * Without a relevant carrier, two people with different values may behave identically
 * (no scarcity = no forced choice). Carriers are the "pressure" that reveals values.
 * 
 * POLARITY VECTORS:
 * 
 * A polarity vector maps each Schwartz value to each carrier, indicating how
 * increasing that carrier's intensity tends to satisfy (+) or frustrate (-) the value.
 * 
 * Example: Humility has negative polarity on Attention/Recognition because
 * increasing public attention frustrates the humble person's preference to
 * recognize their insignificance in the larger scheme.
 * 
 * These vectors are used to SELECT which carrier best exposes a given value-value
 * tension. If two values have opposite polarities on a carrier, that carrier
 * will make their conflict behaviorally visible.
 */

// ============================================================================
// CARRIER TYPES
// ============================================================================

export type CarrierId = 
  | 'risk_uncertainty'
  | 'control_authority'
  | 'resources_allocation'
  | 'time_urgency'
  | 'attention_recognition'
  | 'norm_enforcement'
  | 'choice_freedom'
  | 'inclusion_exclusion'
  | 'truth_disclosure'
  | 'effort_sacrifice'
  | 'change_stability'
  | 'boundary_permeability';

export interface CarrierParameter {
  id: string;
  name: string;
  description: string;
  /** Low end of the dimension (e.g., "private", "low stakes") */
  lowLabel: string;
  /** High end of the dimension (e.g., "public", "high stakes") */
  highLabel: string;
  /** Default value 0-1, where 0.5 is neutral */
  defaultValue: number;
}

export interface Carrier {
  id: CarrierId;
  name: string;
  description: string;
  /** 
   * Parameters that can be tuned to intensify or soften the carrier.
   * Each parameter represents a dimension of the carrier that affects
   * how strongly it creates decision pressure.
   */
  parameters: CarrierParameter[];
}

// ============================================================================
// CARRIER DEFINITIONS
// ============================================================================

export const CARRIERS: Record<CarrierId, Carrier> = {
  risk_uncertainty: {
    id: 'risk_uncertainty',
    name: 'Risk / Uncertainty',
    description: 'The degree of unknown outcomes, potential loss, or unpredictable consequences. High risk forces tradeoffs between security-seeking and opportunity-seeking values.',
    parameters: [
      {
        id: 'stakes',
        name: 'Stakes Level',
        description: 'How much is at risk (reputation, resources, relationships, safety)',
        lowLabel: 'Low stakes',
        highLabel: 'Existential stakes',
        defaultValue: 0.5,
      },
      {
        id: 'reversibility',
        name: 'Reversibility',
        description: 'Whether the decision can be undone or corrected',
        lowLabel: 'Easily reversible',
        highLabel: 'Permanent/irreversible',
        defaultValue: 0.5,
      },
      {
        id: 'information',
        name: 'Information Availability',
        description: 'How much is known about potential outcomes',
        lowLabel: 'Full information',
        highLabel: 'Deep uncertainty',
        defaultValue: 0.5,
      },
    ],
  },

  control_authority: {
    id: 'control_authority',
    name: 'Control / Authority',
    description: 'Who has decision-making power and how it is distributed. Creates tension between autonomy-seeking and hierarchy-respecting values.',
    parameters: [
      {
        id: 'hierarchy',
        name: 'Hierarchy Clarity',
        description: 'How clearly defined the authority structure is',
        lowLabel: 'Flat/ambiguous',
        highLabel: 'Strict hierarchy',
        defaultValue: 0.5,
      },
      {
        id: 'scope',
        name: 'Control Scope',
        description: 'How much of life/work is subject to authority',
        lowLabel: 'Limited domain',
        highLabel: 'Total control',
        defaultValue: 0.5,
      },
      {
        id: 'legitimacy',
        name: 'Perceived Legitimacy',
        description: 'Whether authority is seen as earned/justified',
        lowLabel: 'Questioned legitimacy',
        highLabel: 'Unquestioned authority',
        defaultValue: 0.5,
      },
    ],
  },

  resources_allocation: {
    id: 'resources_allocation',
    name: 'Resources / Allocation',
    description: 'Scarcity of material goods, money, or tangible assets. Forces choices between self-interest and collective welfare.',
    parameters: [
      {
        id: 'scarcity',
        name: 'Scarcity Level',
        description: 'How limited the resources are',
        lowLabel: 'Abundant',
        highLabel: 'Severely scarce',
        defaultValue: 0.5,
      },
      {
        id: 'divisibility',
        name: 'Divisibility',
        description: 'Whether resources can be shared or are winner-take-all',
        lowLabel: 'Easily shared',
        highLabel: 'Indivisible',
        defaultValue: 0.5,
      },
      {
        id: 'visibility',
        name: 'Allocation Visibility',
        description: 'Whether distribution decisions are public',
        lowLabel: 'Private allocation',
        highLabel: 'Public/transparent',
        defaultValue: 0.5,
      },
    ],
  },

  time_urgency: {
    id: 'time_urgency',
    name: 'Time / Urgency',
    description: 'Pressure from deadlines, windows of opportunity, or time-sensitive demands. Forces tradeoffs between deliberation and action.',
    parameters: [
      {
        id: 'deadline',
        name: 'Deadline Pressure',
        description: 'How imminent the decision point is',
        lowLabel: 'Open-ended',
        highLabel: 'Immediate deadline',
        defaultValue: 0.5,
      },
      {
        id: 'opportunity_window',
        name: 'Opportunity Window',
        description: 'Whether the chance will come again',
        lowLabel: 'Recurring opportunity',
        highLabel: 'Once-in-a-lifetime',
        defaultValue: 0.5,
      },
      {
        id: 'competing_demands',
        name: 'Competing Demands',
        description: 'How many things require attention simultaneously',
        lowLabel: 'Single focus',
        highLabel: 'Multiple urgent demands',
        defaultValue: 0.5,
      },
    ],
  },

  attention_recognition: {
    id: 'attention_recognition',
    name: 'Attention / Recognition',
    description: 'Visibility, credit, reputation, and social acknowledgment. Creates tension between self-promotion and humility values.',
    parameters: [
      {
        id: 'audience_size',
        name: 'Audience Size',
        description: 'How many people are observing',
        lowLabel: 'Private',
        highLabel: 'Mass public',
        defaultValue: 0.5,
      },
      {
        id: 'permanence',
        name: 'Record Permanence',
        description: 'Whether the recognition/exposure will persist',
        lowLabel: 'Ephemeral',
        highLabel: 'Permanent record',
        defaultValue: 0.5,
      },
      {
        id: 'attribution',
        name: 'Attribution Clarity',
        description: 'How clearly credit/blame is assigned',
        lowLabel: 'Collective/anonymous',
        highLabel: 'Individual spotlight',
        defaultValue: 0.5,
      },
    ],
  },

  norm_enforcement: {
    id: 'norm_enforcement',
    name: 'Norm Enforcement / Rule Flexibility',
    description: 'How strictly rules, laws, and social norms are applied. Forces tradeoffs between conformity and self-direction.',
    parameters: [
      {
        id: 'enforcement_strictness',
        name: 'Enforcement Strictness',
        description: 'How rigidly rules are applied',
        lowLabel: 'Flexible interpretation',
        highLabel: 'Zero tolerance',
        defaultValue: 0.5,
      },
      {
        id: 'sanction_severity',
        name: 'Sanction Severity',
        description: 'Consequences for rule violation',
        lowLabel: 'Minor consequences',
        highLabel: 'Severe punishment',
        defaultValue: 0.5,
      },
      {
        id: 'norm_clarity',
        name: 'Norm Clarity',
        description: 'How well-defined the expected behavior is',
        lowLabel: 'Ambiguous norms',
        highLabel: 'Explicit rules',
        defaultValue: 0.5,
      },
    ],
  },

  choice_freedom: {
    id: 'choice_freedom',
    name: 'Choice Freedom / Constraint',
    description: 'The range of available options and freedom to choose among them. Exposes tension between autonomy and security.',
    parameters: [
      {
        id: 'option_range',
        name: 'Option Range',
        description: 'How many alternatives are available',
        lowLabel: 'Binary choice',
        highLabel: 'Many options',
        defaultValue: 0.5,
      },
      {
        id: 'exit_possibility',
        name: 'Exit Possibility',
        description: 'Whether one can opt out entirely',
        lowLabel: 'No exit',
        highLabel: 'Easy exit',
        defaultValue: 0.5,
      },
      {
        id: 'coercion_level',
        name: 'Coercion Level',
        description: 'How much external pressure constrains choice',
        lowLabel: 'Free choice',
        highLabel: 'Forced choice',
        defaultValue: 0.5,
      },
    ],
  },

  inclusion_exclusion: {
    id: 'inclusion_exclusion',
    name: 'Inclusion / Exclusion',
    description: 'Who belongs, who is accepted, and who is left out. Forces tradeoffs between in-group loyalty and universal concern.',
    parameters: [
      {
        id: 'group_selectivity',
        name: 'Group Selectivity',
        description: 'How restrictive membership criteria are',
        lowLabel: 'Open to all',
        highLabel: 'Highly exclusive',
        defaultValue: 0.5,
      },
      {
        id: 'rejection_visibility',
        name: 'Rejection Visibility',
        description: 'How publicly exclusion is enacted',
        lowLabel: 'Quiet exclusion',
        highLabel: 'Public rejection',
        defaultValue: 0.5,
      },
      {
        id: 'stakes_of_belonging',
        name: 'Stakes of Belonging',
        description: 'What is gained/lost by inclusion/exclusion',
        lowLabel: 'Low stakes',
        highLabel: 'Survival-level stakes',
        defaultValue: 0.5,
      },
    ],
  },

  truth_disclosure: {
    id: 'truth_disclosure',
    name: 'Truth Disclosure / Concealment',
    description: 'Decisions about revealing or hiding information. Creates tension between honesty and protection values.',
    parameters: [
      {
        id: 'harm_potential',
        name: 'Harm Potential',
        description: 'How much damage truth could cause',
        lowLabel: 'Harmless truth',
        highLabel: 'Devastating revelation',
        defaultValue: 0.5,
      },
      {
        id: 'discovery_likelihood',
        name: 'Discovery Likelihood',
        description: 'How likely concealment will be exposed',
        lowLabel: 'Unlikely to surface',
        highLabel: 'Certain to emerge',
        defaultValue: 0.5,
      },
      {
        id: 'obligation_strength',
        name: 'Obligation Strength',
        description: 'How strong the duty to disclose is',
        lowLabel: 'No obligation',
        highLabel: 'Absolute duty',
        defaultValue: 0.5,
      },
    ],
  },

  effort_sacrifice: {
    id: 'effort_sacrifice',
    name: 'Effort / Sacrifice',
    description: 'Personal cost in energy, comfort, or wellbeing required by a choice. Exposes tension between self-care and commitment values.',
    parameters: [
      {
        id: 'cost_level',
        name: 'Personal Cost',
        description: 'How much effort/sacrifice is required',
        lowLabel: 'Minimal effort',
        highLabel: 'Extreme sacrifice',
        defaultValue: 0.5,
      },
      {
        id: 'beneficiary',
        name: 'Beneficiary Distance',
        description: 'Who benefits from the sacrifice',
        lowLabel: 'Self/close others',
        highLabel: 'Distant strangers',
        defaultValue: 0.5,
      },
      {
        id: 'reciprocity',
        name: 'Reciprocity Expectation',
        description: 'Whether sacrifice will be returned',
        lowLabel: 'Guaranteed return',
        highLabel: 'No reciprocity',
        defaultValue: 0.5,
      },
    ],
  },

  change_stability: {
    id: 'change_stability',
    name: 'Change / Stability',
    description: 'Tension between preserving the status quo and embracing transformation. Exposes openness vs. conservation values.',
    parameters: [
      {
        id: 'disruption_scope',
        name: 'Disruption Scope',
        description: 'How much will change',
        lowLabel: 'Minor adjustment',
        highLabel: 'Total transformation',
        defaultValue: 0.5,
      },
      {
        id: 'tradition_depth',
        name: 'Tradition Depth',
        description: 'How long-standing the thing being changed is',
        lowLabel: 'Recent practice',
        highLabel: 'Ancient tradition',
        defaultValue: 0.5,
      },
      {
        id: 'reversibility',
        name: 'Change Reversibility',
        description: 'Whether the change can be undone',
        lowLabel: 'Easily reversed',
        highLabel: 'Permanent change',
        defaultValue: 0.5,
      },
    ],
  },

  boundary_permeability: {
    id: 'boundary_permeability',
    name: 'Boundary Permeability',
    description: 'Who counts as "us" — the flexibility of in-group/out-group boundaries. Forces tradeoffs between universalism and particularism.',
    parameters: [
      {
        id: 'boundary_rigidity',
        name: 'Boundary Rigidity',
        description: 'How fixed group boundaries are',
        lowLabel: 'Fluid boundaries',
        highLabel: 'Impermeable walls',
        defaultValue: 0.5,
      },
      {
        id: 'outsider_proximity',
        name: 'Outsider Proximity',
        description: 'How close the out-group is',
        lowLabel: 'Distant/abstract',
        highLabel: 'Present/concrete',
        defaultValue: 0.5,
      },
      {
        id: 'identity_salience',
        name: 'Identity Salience',
        description: 'How central group identity is to the situation',
        lowLabel: 'Identity irrelevant',
        highLabel: 'Identity defining',
        defaultValue: 0.5,
      },
    ],
  },
};

export const CARRIER_IDS: CarrierId[] = Object.keys(CARRIERS) as CarrierId[];

// ============================================================================
// POLARITY VECTOR TYPES
// ============================================================================

/**
 * A polarity score indicates how a carrier's increase affects a value.
 * 
 * Range: -1.0 to +1.0
 * 
 * +1.0 = Increasing this carrier strongly SATISFIES the value
 * +0.5 = Increasing this carrier moderately satisfies the value
 *  0.0 = The carrier is orthogonal / weakly related to the value
 * -0.5 = Increasing this carrier moderately FRUSTRATES the value
 * -1.0 = Increasing this carrier strongly frustrates the value
 * 
 * USAGE:
 * To find which carrier best exposes a value-value tension, look for carriers
 * where the two values have OPPOSITE polarities. The larger the difference,
 * the more visible the conflict will be in that decision context.
 */
export type PolarityScore = number; // -1.0 to +1.0

/**
 * Maps each carrier to a polarity score for a given value.
 */
export type PolarityVector = Record<CarrierId, PolarityScore>;

/**
 * Maps each Schwartz value code to its polarity vector over all carriers.
 */
export type ValuePolarityMap = Record<string, PolarityVector>;

// ============================================================================
// VALUE-CARRIER POLARITY MAPPINGS
// ============================================================================

/**
 * POLARITY VECTORS FOR ALL 19 SCHWARTZ VALUES
 * 
 * These mappings encode how each value relates to each carrier dimension.
 * They are used to SELECT appropriate carriers for exposing value conflicts,
 * not to define the conflicts themselves (which exist in motivation space).
 * 
 * Derivation notes:
 * - Positive polarity: the value is advanced when this scarcity/constraint increases
 * - Negative polarity: the value is frustrated when this scarcity/constraint increases
 * - Near-zero: the carrier doesn't strongly relate to this value's core concern
 */
export const VALUE_POLARITY_MAP: ValuePolarityMap = {
  // =========================================================================
  // OPENNESS TO CHANGE VALUES
  // =========================================================================

  /** Self-direction – thought: Freedom to cultivate one's own ideas and abilities */
  SDT: {
    risk_uncertainty: 0.4,        // Embraces intellectual uncertainty
    control_authority: -0.9,      // Frustrated by external control over thinking
    resources_allocation: 0.1,    // Weakly related
    time_urgency: -0.3,           // Needs time for reflection
    attention_recognition: 0.0,   // Orthogonal
    norm_enforcement: -0.8,       // Frustrated by prescribed thinking
    choice_freedom: 0.9,          // Core need for intellectual options
    inclusion_exclusion: 0.1,     // Weakly related
    truth_disclosure: 0.5,        // Values access to information
    effort_sacrifice: 0.2,        // Willing to work for ideas
    change_stability: 0.6,        // Embraces new ideas
    boundary_permeability: 0.3,   // Open to outside perspectives
  },

  /** Self-direction – action: Freedom to determine one's own actions and plans */
  SDA: {
    risk_uncertainty: 0.5,        // Accepts risk for autonomy
    control_authority: -0.95,     // Strongly frustrated by control
    resources_allocation: 0.3,    // Needs resources for independence
    time_urgency: -0.2,           // Prefers self-paced
    attention_recognition: 0.0,   // Orthogonal
    norm_enforcement: -0.8,       // Frustrated by behavioral rules
    choice_freedom: 0.95,         // Core need
    inclusion_exclusion: 0.1,     // Weakly related
    truth_disclosure: 0.2,        // Wants information to decide
    effort_sacrifice: 0.4,        // Willing to sacrifice for freedom
    change_stability: 0.5,        // Open to new paths
    boundary_permeability: 0.2,   // Independent of group
  },

  /** Stimulation: Excitement, novelty, and challenge in life */
  STI: {
    risk_uncertainty: 0.9,        // Thrives on uncertainty
    control_authority: -0.5,      // Dislikes predictable control
    resources_allocation: 0.2,    // Needs some resources for adventures
    time_urgency: 0.4,            // Enjoys time pressure as exciting
    attention_recognition: 0.3,   // Enjoys spotlight sometimes
    norm_enforcement: -0.6,       // Bored by rigid rules
    choice_freedom: 0.7,          // Wants options to explore
    inclusion_exclusion: 0.2,     // Seeks new social experiences
    truth_disclosure: 0.3,        // Curious about hidden things
    effort_sacrifice: 0.5,        // Embraces challenge
    change_stability: 0.9,        // Loves change
    boundary_permeability: 0.5,   // Excited by outsiders
  },

  /** Hedonism: Pleasure and sensuous gratification for oneself */
  HED: {
    risk_uncertainty: -0.2,       // Prefers reliable pleasure
    control_authority: -0.4,      // Wants freedom to enjoy
    resources_allocation: 0.6,    // Needs resources for pleasure
    time_urgency: -0.5,           // Pleasure needs time
    attention_recognition: 0.2,   // Enjoys some attention
    norm_enforcement: -0.4,       // Rules limit pleasure
    choice_freedom: 0.6,          // Wants options for enjoyment
    inclusion_exclusion: 0.1,     // Weakly related
    truth_disclosure: 0.0,        // Orthogonal
    effort_sacrifice: -0.7,       // Avoids discomfort
    change_stability: 0.2,        // Some novelty is pleasant
    boundary_permeability: 0.1,   // Weakly related
  },

  // =========================================================================
  // SELF-ENHANCEMENT VALUES
  // =========================================================================

  /** Achievement: Success according to social standards */
  ACM: {
    risk_uncertainty: 0.3,        // Calculated risks for success
    control_authority: 0.2,       // Can work within hierarchy
    resources_allocation: 0.5,    // Resources enable success
    time_urgency: 0.4,            // Deadlines drive performance
    attention_recognition: 0.8,   // Needs recognition of success
    norm_enforcement: 0.3,        // Success often within rules
    choice_freedom: 0.3,          // Wants paths to achievement
    inclusion_exclusion: 0.4,     // Wants to be in successful groups
    truth_disclosure: 0.1,        // Strategic about information
    effort_sacrifice: 0.7,        // Willing to work hard
    change_stability: 0.3,        // Adapts for success
    boundary_permeability: 0.2,   // Focus on relevant networks
  },

  /** Power – dominance: Power through exercising control over people */
  POD: {
    risk_uncertainty: 0.2,        // Takes risks to gain control
    control_authority: 0.95,      // Core need - to BE the authority
    resources_allocation: 0.5,    // Resources as tools of control
    time_urgency: 0.3,            // Uses urgency as pressure
    attention_recognition: 0.6,   // Visibility reinforces dominance
    norm_enforcement: 0.4,        // Uses rules to control others
    choice_freedom: -0.5,         // Wants to limit others' freedom
    inclusion_exclusion: 0.7,     // Controls who belongs
    truth_disclosure: 0.2,        // Information as power
    effort_sacrifice: 0.3,        // Others should sacrifice
    change_stability: 0.1,        // Protects power position
    boundary_permeability: 0.0,   // Depends on strategy
  },

  /** Power – resources: Power through control of material and social resources */
  POR: {
    risk_uncertainty: 0.1,        // Protects resources from risk
    control_authority: 0.6,       // Authority through wealth
    resources_allocation: 0.95,   // Core need - control resources
    time_urgency: 0.2,            // Resources buy time
    attention_recognition: 0.5,   // Wealth brings status
    norm_enforcement: 0.3,        // Uses rules to protect wealth
    choice_freedom: 0.1,          // Indifferent to others' freedom
    inclusion_exclusion: 0.5,     // Wealth defines access
    truth_disclosure: -0.2,       // Protects resource information
    effort_sacrifice: 0.2,        // Expects returns on effort
    change_stability: -0.2,       // Protects current holdings
    boundary_permeability: 0.0,   // Transactional view
  },

  /** Face: Maintaining one's public image and avoiding humiliation */
  FAC: {
    risk_uncertainty: -0.5,       // Risk threatens reputation
    control_authority: 0.3,       // Status from position
    resources_allocation: 0.3,    // Resources signal status
    time_urgency: -0.3,           // Pressure increases error risk
    attention_recognition: 0.7,   // But wants positive attention
    norm_enforcement: 0.5,        // Following norms protects face
    choice_freedom: 0.1,          // Constrained by image needs
    inclusion_exclusion: 0.6,     // Being included is face-saving
    truth_disclosure: -0.6,       // Hides unflattering truths
    effort_sacrifice: 0.3,        // Works to maintain image
    change_stability: -0.3,       // Change risks status
    boundary_permeability: 0.2,   // Wants respected group
  },

  // =========================================================================
  // CONSERVATION VALUES
  // =========================================================================

  /** Security – personal: Safety in one's immediate environment */
  SEO: {
    risk_uncertainty: -0.95,      // Core aversion to risk
    control_authority: 0.4,       // Authority provides safety
    resources_allocation: 0.5,    // Resources as security
    time_urgency: -0.4,           // Pressure feels threatening
    attention_recognition: -0.3,  // Exposure feels risky
    norm_enforcement: 0.5,        // Rules create predictability
    choice_freedom: -0.1,         // Too many choices overwhelming
    inclusion_exclusion: 0.3,     // In-group = safety
    truth_disclosure: -0.2,       // Some secrets feel safer
    effort_sacrifice: 0.2,        // Will work for security
    change_stability: -0.8,       // Change is threatening
    boundary_permeability: -0.4,  // Outsiders are risky
  },

  /** Security – societal: Safety and stability in the wider society */
  SES: {
    risk_uncertainty: -0.8,       // Societal stability needed
    control_authority: 0.6,       // Strong institutions valued
    resources_allocation: 0.4,    // Social safety nets
    time_urgency: -0.3,           // Stability needs time
    attention_recognition: 0.0,   // Orthogonal
    norm_enforcement: 0.7,        // Social order through rules
    choice_freedom: -0.2,         // Some constraints necessary
    inclusion_exclusion: 0.2,     // Social cohesion
    truth_disclosure: 0.2,        // Transparency in governance
    effort_sacrifice: 0.4,        // Contribute to society
    change_stability: -0.7,       // Societal stability valued
    boundary_permeability: -0.3,  // Protect society from threats
  },

  /** Tradition: Maintaining and preserving cultural, family, or religious traditions */
  TRD: {
    risk_uncertainty: -0.5,       // Tradition reduces uncertainty
    control_authority: 0.5,       // Respects traditional authority
    resources_allocation: 0.1,    // Weakly related
    time_urgency: -0.4,           // Tradition needs time to honor
    attention_recognition: 0.1,   // Weakly related
    norm_enforcement: 0.7,        // Traditional norms valued
    choice_freedom: -0.4,         // Tradition limits options
    inclusion_exclusion: 0.4,     // Traditional group identity
    truth_disclosure: 0.0,        // Depends on tradition
    effort_sacrifice: 0.5,        // Sacrifice for tradition
    change_stability: -0.95,      // Core resistance to change
    boundary_permeability: -0.5,  // Maintains traditional boundaries
  },

  /** Conformity – rules: Compliance with rules, laws, and formal obligations */
  COR: {
    risk_uncertainty: -0.4,       // Rules reduce uncertainty
    control_authority: 0.7,       // Respects legitimate authority
    resources_allocation: 0.1,    // Weakly related
    time_urgency: 0.2,            // Meets deadlines
    attention_recognition: -0.2,  // Doesn't seek attention
    norm_enforcement: 0.95,       // Core value - follow rules
    choice_freedom: -0.6,         // Accepts constraints
    inclusion_exclusion: 0.3,     // Conforms to belong
    truth_disclosure: 0.4,        // Honest when required
    effort_sacrifice: 0.4,        // Duty requires effort
    change_stability: -0.5,       // Existing rules valued
    boundary_permeability: -0.2,  // Respects formal categories
  },

  /** Conformity – interpersonal: Avoidance of upsetting or harming other people */
  COI: {
    risk_uncertainty: -0.3,       // Avoids risky social situations
    control_authority: 0.3,       // Defers to avoid conflict
    resources_allocation: 0.0,    // Orthogonal
    time_urgency: -0.3,           // Needs time to consider others
    attention_recognition: -0.4,  // Avoids spotlight
    norm_enforcement: 0.5,        // Social norms guide behavior
    choice_freedom: -0.3,         // Constrained by others' needs
    inclusion_exclusion: 0.4,     // Wants harmony in group
    truth_disclosure: -0.4,       // White lies to protect
    effort_sacrifice: 0.5,        // Sacrifices for harmony
    change_stability: -0.3,       // Change may upset others
    boundary_permeability: 0.1,   // Weakly related
  },

  /** Humility: Recognizing one's insignificance in the larger scheme of things */
  HUM: {
    risk_uncertainty: 0.1,        // Accepts uncertainty of life
    control_authority: -0.5,      // Doesn't seek authority
    resources_allocation: -0.4,   // Doesn't seek excess
    time_urgency: -0.2,           // Patient
    attention_recognition: -0.9,  // Core aversion to spotlight
    norm_enforcement: 0.3,        // Accepts place in order
    choice_freedom: 0.0,          // Orthogonal
    inclusion_exclusion: 0.1,     // Doesn't need special status
    truth_disclosure: 0.3,        // Honest about limitations
    effort_sacrifice: 0.6,        // Willing to serve
    change_stability: 0.0,        // Accepts what comes
    boundary_permeability: 0.4,   // Sees all as equal
  },

  // =========================================================================
  // SELF-TRANSCENDENCE VALUES
  // =========================================================================

  /** Benevolence – caring: Devotion to the welfare of in-group members */
  BEC: {
    risk_uncertainty: 0.2,        // Takes risks for loved ones
    control_authority: 0.0,       // Orthogonal
    resources_allocation: 0.3,    // Shares with in-group
    time_urgency: 0.1,            // Makes time for care
    attention_recognition: -0.1,  // Caring doesn't need credit
    norm_enforcement: 0.2,        // Social norms of care
    choice_freedom: 0.1,          // Weakly related
    inclusion_exclusion: 0.6,     // Strong in-group focus
    truth_disclosure: 0.3,        // Honest caring relationships
    effort_sacrifice: 0.8,        // Core willingness to sacrifice
    change_stability: 0.0,        // Orthogonal
    boundary_permeability: -0.3,  // Prioritizes close others
  },

  /** Benevolence – dependability: Being a reliable and trustworthy member of the in-group */
  BED: {
    risk_uncertainty: -0.2,       // Reliability requires stability
    control_authority: 0.2,       // Respects commitments
    resources_allocation: 0.2,    // Provides for group
    time_urgency: 0.3,            // Meets commitments on time
    attention_recognition: 0.0,   // Orthogonal
    norm_enforcement: 0.5,        // Keeps promises/norms
    choice_freedom: -0.2,         // Constrained by commitments
    inclusion_exclusion: 0.5,     // Loyal to in-group
    truth_disclosure: 0.6,        // Honesty builds trust
    effort_sacrifice: 0.7,        // Works hard for group
    change_stability: -0.2,       // Consistency valued
    boundary_permeability: -0.2,  // Focused on known others
  },

  /** Universalism – concern: Commitment to equality, justice, and protection for all people */
  UNC: {
    risk_uncertainty: 0.3,        // Takes risks for justice
    control_authority: -0.3,      // Questions unjust authority
    resources_allocation: 0.6,    // Fair distribution matters
    time_urgency: 0.2,            // Urgency of injustice
    attention_recognition: 0.1,   // Weakly related
    norm_enforcement: 0.2,        // Just rules valued
    choice_freedom: 0.5,          // Freedom for all
    inclusion_exclusion: -0.8,    // Core aversion to exclusion
    truth_disclosure: 0.5,        // Truth serves justice
    effort_sacrifice: 0.7,        // Sacrifice for justice
    change_stability: 0.4,        // Change for justice
    boundary_permeability: 0.9,   // Core - all people count
  },

  /** Universalism – nature: Preservation of the natural environment */
  UNN: {
    risk_uncertainty: 0.2,        // Uncertain ecological action
    control_authority: -0.2,      // Questions exploitative systems
    resources_allocation: -0.3,   // Against resource exploitation
    time_urgency: 0.4,            // Environmental urgency
    attention_recognition: 0.1,   // Weakly related
    norm_enforcement: 0.3,        // Environmental regulations
    choice_freedom: 0.1,          // Weakly related
    inclusion_exclusion: 0.3,     // Nature as stakeholder
    truth_disclosure: 0.4,        // Environmental truth
    effort_sacrifice: 0.6,        // Sacrifice for nature
    change_stability: 0.3,        // Change consumption patterns
    boundary_permeability: 0.7,   // Non-human life counts
  },

  /** Universalism – tolerance: Acceptance and understanding of those who are different */
  UNT: {
    risk_uncertainty: 0.3,        // Embraces difference as unknown
    control_authority: -0.4,      // Questions exclusionary authority
    resources_allocation: 0.3,    // Fair access for all
    time_urgency: -0.1,           // Tolerance needs patience
    attention_recognition: 0.0,   // Orthogonal
    norm_enforcement: -0.3,       // Questions rigid norms
    choice_freedom: 0.6,          // Freedom for different choices
    inclusion_exclusion: -0.7,    // Against exclusion
    truth_disclosure: 0.3,        // Understanding through dialogue
    effort_sacrifice: 0.4,        // Effort to understand
    change_stability: 0.4,        // Embraces social change
    boundary_permeability: 0.9,   // Core openness to others
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the polarity vector for a specific Schwartz value.
 */
export function getPolarityVector(valueCode: string): PolarityVector | undefined {
  return VALUE_POLARITY_MAP[valueCode];
}

/**
 * Get a specific polarity score for a value-carrier pair.
 */
export function getPolarity(valueCode: string, carrierId: CarrierId): PolarityScore | undefined {
  return VALUE_POLARITY_MAP[valueCode]?.[carrierId];
}

/**
 * Calculate the polarity difference between two values on a carrier.
 * Larger absolute values indicate that this carrier would expose greater tension.
 * 
 * @returns Difference in polarity (-2.0 to +2.0), or undefined if values not found
 */
export function getPolarityDifference(
  valueCodeA: string, 
  valueCodeB: string, 
  carrierId: CarrierId
): number | undefined {
  const polarityA = getPolarity(valueCodeA, carrierId);
  const polarityB = getPolarity(valueCodeB, carrierId);
  
  if (polarityA === undefined || polarityB === undefined) return undefined;
  
  return polarityA - polarityB;
}

/**
 * Find the carriers that would best expose a tension between two values.
 * Returns carriers sorted by the absolute polarity difference (highest first).
 * 
 * This is the key function for scenario generation: given two values in conflict,
 * it identifies which decision contexts would make that conflict behaviorally visible.
 */
export function findBestCarriersForTension(
  valueCodeA: string,
  valueCodeB: string,
  limit: number = 3
): Array<{ carrier: Carrier; polarityDiff: number }> {
  const results: Array<{ carrier: Carrier; polarityDiff: number }> = [];
  
  for (const carrierId of CARRIER_IDS) {
    const diff = getPolarityDifference(valueCodeA, valueCodeB, carrierId);
    if (diff !== undefined) {
      results.push({
        carrier: CARRIERS[carrierId],
        polarityDiff: diff,
      });
    }
  }
  
  // Sort by absolute difference (highest tension first)
  results.sort((a, b) => Math.abs(b.polarityDiff) - Math.abs(a.polarityDiff));
  
  return results.slice(0, limit);
}

/**
 * Get all carrier definitions as an array.
 */
export function getCarriers(): Carrier[] {
  return Object.values(CARRIERS);
}

/**
 * Get a carrier by its ID.
 */
export function getCarrierById(id: CarrierId): Carrier | undefined {
  return CARRIERS[id];
}
