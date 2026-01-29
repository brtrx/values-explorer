// Archetype categories and definitions for "Who Am I Most Like" feature
import { ValueScores, getValueByCode, SCHWARTZ_VALUES } from './schwartz-values';

export type ArchetypeCategory =
  | 'fictional'
  | 'historical'
  | 'superheroes'
  | 'mythological'
  | 'literary'
  | 'cultural';

export interface Archetype {
  name: string;
  description: string;
  imagePrompt: string;
  /**
   * Map of value codes to expected relative weight (-3 to 3):
   * -3 = Actively opposed/rejected (core antagonism to this value)
   * -2 = Avoided/dismissed (deliberately avoids this value)
   * -1 = Downplayed/neglected (low priority, often ignored)
   *  0 = Neutral (unspecified, defaults to baseline)
   *  1 = Present (noticeable but not prominent)
   *  2 = Important (significant motivator)
   *  3 = Defining (core to identity)
   */
  valueProfile: Partial<Record<string, number>>;
  category: ArchetypeCategory;
}

export const ARCHETYPE_CATEGORIES: { value: ArchetypeCategory; label: string; description: string }[] = [
  { value: 'fictional', label: 'Fictional Characters', description: 'Popular characters from movies and TV' },
  { value: 'historical', label: 'Historical Figures', description: 'Notable people from history (non-living)' },
  { value: 'superheroes', label: 'Superheroes & Comics', description: 'Heroes and villains from comic books' },
  { value: 'mythological', label: 'Gods & Mythology', description: 'Deities and supernatural beings' },
  { value: 'literary', label: 'Literary Characters', description: 'Characters from famous novels' },
  { value: 'cultural', label: 'Cultural Roles', description: 'Archetypal social and cultural role expectations' },
];

export const ARCHETYPES: Archetype[] = [
  // ============ FICTIONAL CHARACTERS ============
  {
    name: 'Dumbledore',
    description: 'A wise mentor who prioritizes the greater good while nurturing individual growth. Values wisdom, tolerance, and benevolence above personal power.',
    imagePrompt: 'A wise elderly wizard with long silver beard, half-moon spectacles, wearing flowing purple robes, serene and knowing expression, magical atmosphere, portrait style',
    valueProfile: { UNC: 3, UNT: 3, BEC: 2, SDT: 2, HUM: 2, POD: -2, POR: -2 },
    category: 'fictional',
  },
  {
    name: 'Hermione Granger',
    description: 'A devoted scholar who values knowledge, rules, and loyalty to friends. Combines intellectual curiosity with dependability.',
    imagePrompt: 'A young woman with bushy brown hair, intelligent determined expression, holding books, wearing academic robes, warm lighting, portrait style',
    valueProfile: { SDT: 3, COR: 2, BED: 3, ACM: 2, SDA: -1, HED: -2 },
    category: 'fictional',
  },
  {
    name: 'Leslie Knope',
    description: 'An enthusiastic public servant who combines ambition with genuine care for community. Balances achievement with benevolence.',
    imagePrompt: 'A cheerful blonde woman in professional attire, bright optimistic smile, holding a binder, government office background, warm positive energy, portrait style',
    valueProfile: { BEC: 3, ACM: 2, SES: 2, BED: 2, UNC: 2, SDA: -1, POD: -2 },
    category: 'fictional',
  },
  {
    name: 'Spock',
    description: 'A logical mind who values truth and duty over emotion. Prioritizes intellectual self-direction while maintaining conformity to principles.',
    imagePrompt: 'A stoic Vulcan with pointed ears, raised eyebrow, wearing blue science officer uniform, calm logical expression, starship interior, portrait style',
    valueProfile: { SDT: 3, COR: 3, HUM: 2, ACM: 2, SEO: 1, HED: -3, STI: -2 },
    category: 'fictional',
  },
  {
    name: 'Tony Stark',
    description: 'A brilliant innovator who pursues excellence and independence. Combines achievement drive with creative self-direction.',
    imagePrompt: 'A charismatic man with goatee in high-tech workshop, confident smirk, surrounded by holographic displays and technology, modern sleek environment, portrait style',
    valueProfile: { ACM: 3, SDT: 2, SDA: 3, STI: 2, FAC: 2, HUM: -2, COR: -2 },
    category: 'fictional',
  },
  {
    name: 'Forrest Gump',
    description: 'A pure-hearted soul who values loyalty, tradition, and simple kindness. Success comes through steadfast devotion rather than ambition.',
    imagePrompt: 'A simple man in plaid shirt sitting on a bench, innocent sincere expression, holding a box of chocolates, warm nostalgic lighting, portrait style',
    valueProfile: { BED: 3, TRD: 3, HUM: 3, BEC: 2, COR: 2, POD: -2, ACM: -1, STI: -1 },
    category: 'fictional',
  },
  {
    name: 'The Joker',
    description: 'An agent of chaos who rejects all social conventions. Values stimulation and personal freedom above all, with disdain for rules and tradition.',
    imagePrompt: 'A chaotic figure with green hair and sinister grin, wild unpredictable eyes, purple suit, dark urban backdrop, menacing yet theatrical, portrait style',
    valueProfile: { STI: 3, SDA: 3, POD: 2, HED: 2, COR: -3, TRD: -3, BEC: -2, HUM: -2, SES: -1 },
    category: 'fictional',
  },
  {
    name: 'Yoda',
    description: 'An ancient master who embodies patience, wisdom, and spiritual depth. Values knowledge and harmony over material concerns.',
    imagePrompt: 'A small green alien elder with pointed ears, wise serene expression, simple brown robes, mystical swamp setting, ancient and peaceful, portrait style',
    valueProfile: { SDT: 3, HUM: 3, UNT: 2, UNN: 2, TRD: 2, POD: -2, FAC: -2, POR: -1 },
    category: 'fictional',
  },
  {
    name: 'Daenerys Targaryen',
    description: 'A revolutionary leader driven by justice and liberation. Combines power ambitions with genuine concern for the oppressed.',
    imagePrompt: 'A regal young woman with silver-white hair, fierce determined eyes, wearing dragon-scale dress, dragons in background, powerful and liberating, portrait style',
    valueProfile: { POD: 3, UNC: 2, SDA: 2, ACM: 2, FAC: 2, COR: -2, HUM: -1 },
    category: 'fictional',
  },
  {
    name: 'Ron Swanson',
    description: 'A libertarian who values self-reliance, tradition, and personal freedom above all. Skeptical of authority and social obligations.',
    imagePrompt: 'A mustachioed man with stoic expression, plaid shirt, woodworking shop background, rugged individualist, deadpan humor, portrait style',
    valueProfile: { SDA: 3, TRD: 2, SEO: 2, SDT: 2, COR: -3, BEC: -2, UNC: -1 },
    category: 'fictional',
  },
  {
    name: 'Elle Woods',
    description: 'An optimistic achiever who proves that kindness and ambition can coexist. Values both personal success and helping others.',
    imagePrompt: 'A stylish blonde woman in pink outfit, bright confident smile, law books and fashion accessories, cheerful determined energy, portrait style',
    valueProfile: { ACM: 3, BEC: 2, FAC: 2, HED: 2, BED: 2, HUM: -1, SEO: -1 },
    category: 'fictional',
  },
  {
    name: 'Walter White',
    description: 'A man transformed by the pursuit of power and legacy. Initially driven by security, ultimately consumed by pride and dominance.',
    imagePrompt: 'A bald man with goatee and glasses, intense calculating gaze, dark shadows, chemistry lab background, dangerous transformation, portrait style',
    valueProfile: { POD: 3, ACM: 3, FAC: 2, POR: 2, SEO: 2, HUM: -3, BEC: -2, COR: -2, UNC: -1 },
    category: 'fictional',
  },
  {
    name: 'Samwise Gamgee',
    description: 'The loyal friend who embodies steadfast devotion and humble service. Values friendship, nature, and simple pleasures above glory.',
    imagePrompt: 'A sturdy hobbit with curly hair, warm loyal expression, gardening tools, lush green countryside, humble and devoted, portrait style',
    valueProfile: { BED: 3, BEC: 3, HUM: 3, UNN: 2, TRD: 2, POD: -3, ACM: -2, FAC: -1 },
    category: 'fictional',
  },
  {
    name: 'Hannibal Lecter',
    description: 'A cultured predator who values aesthetics, intellectual stimulation, and dominance. Combines refined taste with cold power.',
    imagePrompt: 'An elegant man in fine suit, penetrating intelligent gaze, classical art and wine background, sophisticated and dangerous, portrait style',
    valueProfile: { POD: 3, SDT: 3, HED: 2, STI: 2, ACM: 2, BEC: -3, HUM: -3, COR: -2, UNC: -2 },
    category: 'fictional',
  },
  {
    name: 'Mary Poppins',
    description: 'A magical caretaker who combines structure with wonder. Values nurturing others while maintaining proper standards.',
    imagePrompt: 'An elegant nanny with umbrella and carpet bag, knowing smile, proper Victorian attire, magical sparkles, practically perfect, portrait style',
    valueProfile: { BEC: 3, COR: 2, HUM: 2, SDT: 2, BED: 2, POD: -2, STI: -1 },
    category: 'fictional',
  },
  {
    name: 'Jack Sparrow',
    description: 'A chaotic free spirit who values adventure, freedom, and cunning over rules. Thrives on stimulation and unpredictability.',
    imagePrompt: 'A eccentric pirate with dreadlocks and beads, mischievous grin, tricorn hat, ocean and ship background, unpredictable rogue, portrait style',
    valueProfile: { SDA: 3, STI: 3, HED: 2, SDT: 2, COR: -3, TRD: -2, SEO: -1 },
    category: 'fictional',
  },

  // ============ HISTORICAL FIGURES ============
  {
    name: 'Marcus Aurelius',
    description: 'A philosopher-emperor who valued wisdom, duty, and self-mastery. Combined power with humility and dedication to the common good.',
    imagePrompt: 'A Roman emperor in simple white toga, contemplative expression, holding a scroll, marble columns background, dignified and thoughtful, classical portrait style',
    valueProfile: { SDT: 3, HUM: 3, UNC: 2, COR: 2, SEO: 2, HED: -2, STI: -1 },
    category: 'historical',
  },
  {
    name: 'Leonardo da Vinci',
    description: 'A Renaissance polymath driven by insatiable curiosity and creative vision. Valued knowledge, innovation, and artistic excellence.',
    imagePrompt: 'A Renaissance artist with long hair and beard, holding drawing tools, surrounded by sketches and inventions, workshop setting, inquisitive genius, portrait style',
    valueProfile: { SDT: 3, STI: 3, ACM: 2, UNN: 2, SDA: 2, COR: -2, TRD: -1 },
    category: 'historical',
  },
  {
    name: 'Florence Nightingale',
    description: 'A pioneering nurse who revolutionized healthcare through compassion and methodical reform. Valued caring for others and social improvement.',
    imagePrompt: 'A Victorian woman in nursing attire holding a lamp, compassionate determined expression, hospital ward background, warm candlelight, portrait style',
    valueProfile: { BEC: 3, UNC: 3, COR: 2, ACM: 2, SES: 2, HED: -2, POD: -1 },
    category: 'historical',
  },
  {
    name: 'Mahatma Gandhi',
    description: 'A leader who championed non-violence and justice through humble service. Valued universal concern, tradition, and principled action.',
    imagePrompt: 'An elderly Indian man in simple white dhoti, round glasses, peaceful serene expression, sitting in meditation pose, soft natural lighting, portrait style',
    valueProfile: { UNC: 3, UNT: 3, HUM: 3, TRD: 2, POD: -3, POR: -2, HED: -1 },
    category: 'historical',
  },
  {
    name: 'Cleopatra',
    description: 'A strategic ruler who combined political power with cultural sophistication. Valued influence, achievement, and protecting her realm.',
    imagePrompt: 'An Egyptian queen with elaborate headdress and gold jewelry, commanding regal presence, palace throne room, luxurious and powerful, portrait style',
    valueProfile: { POD: 3, ACM: 3, SES: 2, SDT: 2, FAC: 2, HUM: -2, COR: -1 },
    category: 'historical',
  },
  {
    name: 'Albert Einstein',
    description: 'A revolutionary thinker who valued intellectual freedom and universal understanding. Prized curiosity and truth above convention.',
    imagePrompt: 'A wild-haired scientist with kind eyes, chalkboard with equations, disheveled sweater, Princeton office, playful genius, portrait style',
    valueProfile: { SDT: 3, UNC: 2, STI: 2, UNT: 2, HUM: 2, COR: -2, FAC: -2, TRD: -1 },
    category: 'historical',
  },
  {
    name: 'Napoleon Bonaparte',
    description: 'An ambitious conqueror driven by glory and dominance. Valued achievement, power, and leaving a lasting legacy.',
    imagePrompt: 'A French emperor in military uniform with medals, hand in coat, commanding presence, battlefield background, ambitious and driven, portrait style',
    valueProfile: { POD: 3, ACM: 3, FAC: 3, POR: 2, SES: 2, HUM: -2, UNT: -1, BEC: -1 },
    category: 'historical',
  },
  {
    name: 'Mother Teresa',
    description: 'A saint of the poor who embodied selfless compassion. Valued serving the suffering and finding meaning through humility.',
    imagePrompt: 'An elderly nun in blue-trimmed white habit, gentle compassionate smile, caring for the poor, Calcutta streets, humble servant, portrait style',
    valueProfile: { BEC: 3, HUM: 3, UNC: 3, TRD: 2, POD: -3, POR: -2, FAC: -2 },
    category: 'historical',
  },
  {
    name: 'Genghis Khan',
    description: 'A ruthless conqueror who built an empire through dominance and strategic brilliance. Valued power, loyalty, and meritocracy.',
    imagePrompt: 'A Mongol warrior emperor in fur and leather armor, fierce determined gaze, vast steppes background, powerful and merciless, portrait style',
    valueProfile: { POD: 3, POR: 3, ACM: 2, SDA: 2, SEO: 2, HUM: -3, BEC: -2, UNC: -2, UNT: -1 },
    category: 'historical',
  },
  {
    name: 'Marie Curie',
    description: 'A pioneering scientist who pursued knowledge despite immense obstacles. Valued discovery, achievement, and advancing human understanding.',
    imagePrompt: 'A determined woman in dark Victorian dress, intelligent focused expression, laboratory with glowing vials, radium glow, dedicated scientist, portrait style',
    valueProfile: { SDT: 3, ACM: 3, UNC: 2, STI: 2, SDA: 2, FAC: -2, HED: -1 },
    category: 'historical',
  },
  {
    name: 'Abraham Lincoln',
    description: 'A principled leader who valued justice, unity, and moral courage. Balanced humility with determination to do what was right.',
    imagePrompt: 'A tall bearded man in black suit, wise melancholic eyes, top hat nearby, White House background, honest and resolute, portrait style',
    valueProfile: { UNC: 3, UNT: 3, BED: 2, HUM: 2, SES: 2, POD: -2, FAC: -1 },
    category: 'historical',
  },
  {
    name: 'Nikola Tesla',
    description: 'A visionary inventor driven by pure innovation rather than wealth. Valued discovery, stimulation, and benefiting humanity over profit.',
    imagePrompt: 'A tall thin man with mustache, intense visionary gaze, electrical coils and lightning, laboratory setting, eccentric genius, portrait style',
    valueProfile: { SDT: 3, STI: 3, UNC: 2, SDA: 2, POR: -3, FAC: -2, SEO: -1 },
    category: 'historical',
  },
  {
    name: 'Queen Victoria',
    description: 'A monarch who embodied duty, tradition, and propriety. Valued stability, family, and maintaining social order.',
    imagePrompt: 'A regal queen in black mourning dress with crown, stern dignified expression, ornate palace interior, imperial and proper, portrait style',
    valueProfile: { TRD: 3, COR: 3, SES: 3, FAC: 2, SEO: 2, STI: -2, SDA: -2 },
    category: 'historical',
  },
  {
    name: 'Benjamin Franklin',
    description: 'A polymath who balanced intellectual curiosity with practical wisdom. Valued both personal achievement and civic virtue.',
    imagePrompt: 'A portly man with spectacles and balding head, clever knowing smile, kite and key, colonial Philadelphia, witty inventor, portrait style',
    valueProfile: { SDT: 3, ACM: 2, UNC: 2, SDA: 2, BEC: 2, TRD: -1, COR: -1 },
    category: 'historical',
  },
  {
    name: 'Frida Kahlo',
    description: 'A fearless artist who transformed pain into expression. Valued authenticity, self-direction, and defying convention.',
    imagePrompt: 'A Mexican woman with unibrow and flowers in hair, intense passionate gaze, vibrant colors and symbolic imagery, artistic rebellion, portrait style',
    valueProfile: { SDA: 3, SDT: 3, STI: 2, FAC: 2, COR: -2, TRD: -2, HUM: -1 },
    category: 'historical',
  },
  {
    name: 'Winston Churchill',
    description: 'A defiant leader who valued courage, tradition, and national security above all. Combined eloquence with bulldog determination.',
    imagePrompt: 'A stout man in suit with cigar, determined bulldog expression, V for victory sign, wartime Britain, resolute and defiant, portrait style',
    valueProfile: { SES: 3, TRD: 3, POD: 2, ACM: 2, FAC: 2, HUM: -1, UNT: -1 },
    category: 'historical',
  },

  // ============ SUPERHEROES & COMICS ============
  {
    name: 'Captain America',
    description: 'A principled leader who embodies duty, tradition, and selfless service. Balances conformity to ideals with fierce protection of others.',
    imagePrompt: 'A heroic super soldier with star-spangled shield, determined noble expression, patriotic red white and blue costume, heroic pose, dramatic lighting, portrait style',
    valueProfile: { BED: 3, COR: 3, TRD: 2, SES: 2, UNC: 2, POD: -2, HED: -1 },
    category: 'superheroes',
  },
  {
    name: 'Wonder Woman',
    description: 'A warrior princess who fights for justice and compassion. Combines strength with empathy and a deep commitment to peace.',
    imagePrompt: 'An Amazonian warrior princess with golden tiara and silver bracelets, powerful yet compassionate expression, flowing dark hair, heroic stance, portrait style',
    valueProfile: { UNC: 3, BEC: 2, POD: 2, TRD: 2, SDA: 2, POR: -2, FAC: -1 },
    category: 'superheroes',
  },
  {
    name: 'Batman',
    description: 'A vigilante driven by justice and self-discipline. Values security, achievement, and independent action over social conformity.',
    imagePrompt: 'A dark knight in black cape and cowl, intense brooding expression, gothic cityscape background, shadows and moonlight, mysterious and powerful, portrait style',
    valueProfile: { SDA: 3, ACM: 2, SEO: 3, POD: 2, SDT: 2, HED: -2, COR: -1, BEC: -1 },
    category: 'superheroes',
  },
  {
    name: 'Spider-Man',
    description: 'A hero who balances personal responsibility with youthful energy. Values helping others while maintaining his own identity and relationships.',
    imagePrompt: 'A young hero in red and blue spider suit, dynamic pose, urban rooftop setting, energetic and friendly, web-slinging action, portrait style',
    valueProfile: { BEC: 3, BED: 3, SDA: 2, STI: 2, HUM: 2, POD: -2, POR: -2 },
    category: 'superheroes',
  },
  {
    name: "T'Challa (Black Panther)",
    description: 'A thoughtful leader who balances tradition with progress. Values security and heritage while remaining open to change.',
    imagePrompt: 'An African king in sleek black vibranium suit, regal dignified expression, advanced technological throne room, powerful and wise, portrait style',
    valueProfile: { TRD: 3, SES: 2, UNC: 2, SDA: 2, HUM: 2, POR: -1, HED: -1 },
    category: 'superheroes',
  },
  {
    name: 'Superman',
    description: 'The ultimate protector who embodies hope, justice, and selfless service. Values helping others and upholding moral principles.',
    imagePrompt: 'A powerful hero with red cape, kind determined expression, S symbol on chest, flying above city, hopeful and invincible, portrait style',
    valueProfile: { UNC: 3, BEC: 3, SES: 2, COR: 2, HUM: 2, POD: -2, POR: -2 },
    category: 'superheroes',
  },
  {
    name: 'Magneto',
    description: 'A survivor turned revolutionary who values his people above all. Combines protective instincts with willingness to dominate for safety.',
    imagePrompt: 'A powerful mutant in red and purple armor, intense magnetic gaze, helmet and cape, dramatic magnetic field effects, tragic antagonist, portrait style',
    valueProfile: { SES: 3, POD: 3, SDA: 2, UNC: 2, UNT: -3, COR: -2, HUM: -1 },
    category: 'superheroes',
  },
  {
    name: 'Professor X',
    description: 'A visionary who dreams of coexistence and understanding. Values tolerance, wisdom, and peaceful solutions over conflict.',
    imagePrompt: 'A bald man in wheelchair, wise compassionate eyes, cerebro helmet nearby, mansion study, hopeful and telepathic, portrait style',
    valueProfile: { UNT: 3, UNC: 3, SDT: 2, BEC: 2, HUM: 2, POD: -2, STI: -1 },
    category: 'superheroes',
  },
  {
    name: 'Wolverine',
    description: 'A loner who struggles between animal instinct and human connection. Values freedom and self-reliance but fiercely protects those he loves.',
    imagePrompt: 'A rugged man with wild hair and adamantium claws, fierce protective snarl, leather jacket, Canadian wilderness, feral yet noble, portrait style',
    valueProfile: { SDA: 3, SEO: 2, BED: 2, STI: 2, COR: -3, TRD: -2, FAC: -1 },
    category: 'superheroes',
  },
  {
    name: 'Thanos',
    description: 'A utilitarian tyrant who believes his vision justifies any means. Values his twisted sense of universal balance above individual lives.',
    imagePrompt: 'A purple titan with golden gauntlet, cold calculating expression, cosmic throne, infinity stones glowing, inevitable and driven, portrait style',
    valueProfile: { POD: 3, UNC: 2, SDT: 2, ACM: 3, BEC: -3, BED: -3, HUM: -2, UNT: -2 },
    category: 'superheroes',
  },
  {
    name: 'Storm',
    description: 'A goddess among mutants who combines regal bearing with environmental consciousness. Values nature, leadership, and her community.',
    imagePrompt: 'A striking woman with white hair and glowing eyes, commanding weather powers, lightning and clouds, regal and powerful, portrait style',
    valueProfile: { UNN: 3, POD: 2, SDA: 2, UNC: 2, BEC: 2, POR: -1, FAC: -1 },
    category: 'superheroes',
  },
  {
    name: 'The Hulk / Bruce Banner',
    description: 'A brilliant scientist battling inner chaos. Values knowledge and control, fearing the destruction of his unrestrained power.',
    imagePrompt: 'A split image of mild scientist and green giant, conflicted expression, laboratory and destruction, rage versus reason, portrait style',
    valueProfile: { SDT: 3, SEO: 3, COR: 2, UNC: 2, STI: -2, POD: -1 },
    category: 'superheroes',
  },
  {
    name: 'Deadpool',
    description: 'An irreverent antihero who values humor, chaos, and doing things his own way. Rejects conventions while occasionally doing good.',
    imagePrompt: 'A masked mercenary in red suit, breaking fourth wall, guns and katanas, comedic chaos, irreverent and unpredictable, portrait style',
    valueProfile: { STI: 3, SDA: 3, HED: 3, COR: -3, TRD: -2, HUM: -1 },
    category: 'superheroes',
  },
  {
    name: 'Captain Marvel',
    description: 'A fearless warrior who combines military discipline with cosmic power. Values achievement, justice, and protecting the innocent.',
    imagePrompt: 'A powerful woman in red blue and gold suit, confident determined expression, cosmic energy glowing, flying through space, unstoppable force, portrait style',
    valueProfile: { ACM: 3, SDA: 2, UNC: 2, POD: 2, COR: 2, HUM: -1, HED: -1 },
    category: 'superheroes',
  },
  {
    name: 'Green Lantern (Hal Jordan)',
    description: 'A fearless pilot chosen for his willpower and courage. Values overcoming fear, protecting others, and pushing his own limits.',
    imagePrompt: 'A man in green and black suit with glowing ring, fearless determined expression, green energy constructs, cosmic patrol, willpower incarnate, portrait style',
    valueProfile: { SDA: 3, ACM: 2, BEC: 2, STI: 2, COR: 2, SEO: -2, HUM: -1 },
    category: 'superheroes',
  },
  {
    name: 'Catwoman',
    description: 'A morally ambiguous thief who values freedom, pleasure, and living by her own rules. Rejects society while maintaining her own code.',
    imagePrompt: 'A sleek woman in black catsuit, playful dangerous smile, rooftop at night, stolen jewels, independent and seductive, portrait style',
    valueProfile: { SDA: 3, HED: 3, STI: 2, POR: 2, COR: -3, TRD: -2, BEC: -1 },
    category: 'superheroes',
  },

  // ============ GODS & MYTHOLOGY ============
  {
    name: 'Athena',
    description: 'Goddess of wisdom and strategic warfare. Values knowledge, justice, and calculated action over impulsive behavior.',
    imagePrompt: 'A Greek goddess in gleaming armor with owl companion, wise piercing gaze, olive branch and spear, Parthenon background, divine and strategic, portrait style',
    valueProfile: { SDT: 3, UNC: 2, ACM: 2, COR: 2, SES: 2, HED: -2, STI: -1 },
    category: 'mythological',
  },
  {
    name: 'Odin',
    description: 'The All-Father who sacrificed for wisdom and leads with ancient knowledge. Values wisdom, tradition, and protecting the cosmic order.',
    imagePrompt: 'A one-eyed Norse god with long grey beard, ravens on shoulders, holding magical spear, throne of Asgard, wise and powerful, portrait style',
    valueProfile: { SDT: 3, TRD: 3, POD: 2, SES: 2, HED: -2, HUM: -1 },
    category: 'mythological',
  },
  {
    name: 'Aphrodite',
    description: 'Goddess of love and beauty who values pleasure, connection, and aesthetic experience. Embraces hedonism and interpersonal harmony.',
    imagePrompt: 'A beautiful Greek goddess emerging from sea foam, radiant loving expression, surrounded by roses and doves, golden light, ethereal and sensual, portrait style',
    valueProfile: { HED: 3, COI: 3, BEC: 2, FAC: 2, ACM: -2, SDT: -1 },
    category: 'mythological',
  },
  {
    name: 'Prometheus',
    description: 'The fire-bringer who defied gods to help humanity. Values universal concern, independent action, and progress over tradition.',
    imagePrompt: 'A Titan holding blazing fire, defiant noble expression, rocky mountain setting, dramatic storm clouds, rebellious and heroic, portrait style',
    valueProfile: { UNC: 3, SDA: 3, STI: 2, HUM: 2, COR: -3, TRD: -2, SEO: -1 },
    category: 'mythological',
  },
  {
    name: 'Kuan Yin',
    description: 'Bodhisattva of compassion who embodies infinite mercy. Values caring for all beings, humility, and tolerance above personal gain.',
    imagePrompt: 'A serene Asian goddess in flowing white robes, gentle compassionate smile, lotus flowers, soft golden aura, peaceful and merciful, portrait style',
    valueProfile: { BEC: 3, UNC: 3, HUM: 3, UNT: 2, POD: -3, POR: -2, FAC: -1 },
    category: 'mythological',
  },
  {
    name: 'Zeus',
    description: 'King of the gods who rules through power and authority. Values dominance, order, and his own pleasures and prerogatives.',
    imagePrompt: 'A muscular bearded god holding lightning bolt, commanding authoritative expression, Mount Olympus throne, stormy skies, powerful and volatile, portrait style',
    valueProfile: { POD: 3, POR: 3, HED: 2, FAC: 2, SES: 2, HUM: -3, COR: -2, UNT: -1 },
    category: 'mythological',
  },
  {
    name: 'Loki',
    description: 'The trickster god who values chaos, cleverness, and freedom from rules. Delights in stimulation and outwitting others.',
    imagePrompt: 'A mischievous Norse god with horned helmet, cunning smile, shapeshifting magic, chaotic energy, unpredictable and clever, portrait style',
    valueProfile: { STI: 3, SDA: 3, SDT: 2, HED: 2, COR: -3, TRD: -3, BED: -2, HUM: -1 },
    category: 'mythological',
  },
  {
    name: 'Hestia',
    description: 'Goddess of the hearth who values home, family, and quiet devotion. Embodies tradition, caring, and humble service.',
    imagePrompt: 'A gentle goddess tending sacred flame, warm maternal expression, simple robes, peaceful hearth setting, nurturing and stable, portrait style',
    valueProfile: { TRD: 3, BEC: 3, SEO: 3, HUM: 2, COI: 2, STI: -2, POD: -2 },
    category: 'mythological',
  },
  {
    name: 'Ares',
    description: 'God of war who values strength, dominance, and the thrill of battle. Embraces conflict and physical power.',
    imagePrompt: 'A fierce warrior god in blood-red armor, aggressive battle-ready expression, sword and shield, battlefield chaos, violent and powerful, portrait style',
    valueProfile: { POD: 3, STI: 3, ACM: 2, SDA: 2, UNT: -3, BEC: -3, HUM: -2, COR: -1 },
    category: 'mythological',
  },
  {
    name: 'Ganesha',
    description: 'The remover of obstacles who values wisdom, new beginnings, and protecting travelers. Combines intellect with benevolence.',
    imagePrompt: 'A elephant-headed deity with multiple arms, gentle wise expression, holding sacred objects, colorful Indian temple, auspicious and scholarly, portrait style',
    valueProfile: { SDT: 3, BEC: 2, UNC: 2, TRD: 2, HUM: 2, POD: -2, STI: -1 },
    category: 'mythological',
  },
  {
    name: 'Freya',
    description: 'Norse goddess of love, beauty, and war. Values both pleasure and power, combining sensuality with fierce independence.',
    imagePrompt: 'A beautiful warrior goddess with golden hair and falcon cloak, passionate fierce expression, chariot pulled by cats, Nordic beauty, portrait style',
    valueProfile: { HED: 3, SDA: 2, POD: 2, FAC: 2, BEC: 2, COR: -2, HUM: -1 },
    category: 'mythological',
  },
  {
    name: 'Anubis',
    description: 'God of the dead who values truth, justice, and proper order. Serves as impartial judge, valuing fairness over mercy.',
    imagePrompt: 'A jackal-headed deity with golden collar, solemn judging expression, scales of justice, Egyptian underworld, mysterious and just, portrait style',
    valueProfile: { COR: 3, UNC: 2, TRD: 2, SDT: 2, HUM: 2, STI: -2, HED: -1 },
    category: 'mythological',
  },
  {
    name: 'Dionysus',
    description: 'God of wine and ecstasy who values pleasure, freedom, and breaking social constraints. Embraces chaos and celebration.',
    imagePrompt: 'A wild god with grape vine crown, ecstatic joyful expression, wine cup overflowing, festival celebration, hedonistic and free, portrait style',
    valueProfile: { HED: 3, STI: 3, SDA: 2, COR: -3, TRD: -2, SEO: -2, ACM: -1 },
    category: 'mythological',
  },
  {
    name: 'Isis',
    description: 'Egyptian goddess of magic and motherhood. Values family, healing, and protecting the vulnerable through wisdom and power.',
    imagePrompt: 'An Egyptian goddess with throne headdress and wings, nurturing powerful expression, magical hieroglyphics, golden light, protective mother, portrait style',
    valueProfile: { BEC: 3, SEO: 3, SDT: 2, TRD: 2, POD: 2, STI: -1, SDA: -1 },
    category: 'mythological',
  },
  {
    name: 'Apollo',
    description: 'God of light, music, and prophecy. Values truth, beauty, achievement, and bringing order and harmony to the world.',
    imagePrompt: 'A radiant young god with golden hair and lyre, serene confident expression, laurel wreath, sunlight and music, enlightened and artistic, portrait style',
    valueProfile: { ACM: 3, SDT: 2, FAC: 2, COR: 2, HED: 2, HUM: -1, SDA: -1 },
    category: 'mythological',
  },
  {
    name: 'Kali',
    description: 'Hindu goddess of destruction and liberation. Values transformation, power, and destroying evil to protect the righteous.',
    imagePrompt: 'A fierce dark goddess with multiple arms holding weapons, intense liberating expression, skulls and fire, cosmic destruction, terrifying and protective, portrait style',
    valueProfile: { POD: 3, SDA: 3, UNC: 2, STI: 2, HUM: -2, COR: -2, TRD: -1 },
    category: 'mythological',
  },

  // ============ LITERARY CHARACTERS ============
  {
    name: 'Elizabeth Bennet',
    description: 'A witty heroine who values independence of thought and challenges social conventions. Combines intelligence with warmth and moral integrity.',
    imagePrompt: 'A Regency-era young woman in elegant empire-waist dress, clever sparkling eyes, amused knowing smile, English countryside estate, portrait style',
    valueProfile: { SDT: 3, SDA: 2, BED: 2, HUM: 2, UNT: 2, FAC: -2, POR: -1, COR: -1 },
    category: 'literary',
  },
  {
    name: 'Gandalf',
    description: 'A humble guide who empowers others while maintaining ancient wisdom. Values nature, tolerance, and gentle influence over control.',
    imagePrompt: 'A wise wizard in grey robes with tall pointed hat, long grey beard, staff in hand, gentle knowing eyes, misty forest background, portrait style',
    valueProfile: { UNN: 3, UNT: 2, HUM: 3, SDT: 2, POD: -2, POR: -2 },
    category: 'literary',
  },
  {
    name: 'Atticus Finch',
    description: 'A moral compass who stands for justice against popular opinion. Values fairness, integrity, and teaching by example.',
    imagePrompt: 'A dignified Southern lawyer in 1930s suit and suspenders, kind thoughtful expression, courthouse setting, integrity and wisdom, portrait style',
    valueProfile: { UNC: 3, UNT: 3, BED: 2, COR: 2, HUM: 2, POD: -2, FAC: -1 },
    category: 'literary',
  },
  {
    name: 'Sherlock Holmes',
    description: 'A brilliant detective driven by intellectual challenge. Values knowledge, independent thinking, and achievement through deduction.',
    imagePrompt: 'A Victorian detective with deerstalker cap and magnifying glass, intense analytical gaze, Baker Street study with chemistry equipment, enigmatic and brilliant, portrait style',
    valueProfile: { SDT: 3, STI: 3, ACM: 2, SDA: 2, BEC: -2, HED: -1, TRD: -1 },
    category: 'literary',
  },
  {
    name: 'Jane Eyre',
    description: 'An independent spirit who maintains her principles despite adversity. Values self-respect, moral integrity, and genuine connection.',
    imagePrompt: 'A Victorian governess in plain dark dress, determined resilient expression, candlelit room with books, quiet strength and dignity, portrait style',
    valueProfile: { SDA: 3, SDT: 2, BED: 2, HUM: 2, UNC: 2, FAC: -2, POR: -1 },
    category: 'literary',
  },
  {
    name: 'Jay Gatsby',
    description: 'A dreamer consumed by ambition and romantic obsession. Values achievement, wealth, and the image he presents to the world.',
    imagePrompt: 'A wealthy man in 1920s tuxedo, hopeful yearning expression, mansion party background, green light in distance, tragic romantic, portrait style',
    valueProfile: { ACM: 3, FAC: 3, POR: 2, HED: 2, HUM: -2, UNC: -1, COR: -1 },
    category: 'literary',
  },
  {
    name: 'Katniss Everdeen',
    description: 'A reluctant hero driven by love for family and hatred of oppression. Values protecting the vulnerable and personal freedom.',
    imagePrompt: 'A young woman with braid and bow, fierce protective expression, mockingjay pin, forest and rebellion, survival and defiance, portrait style',
    valueProfile: { BED: 3, SDA: 3, SEO: 2, UNC: 2, POD: -2, FAC: -2 },
    category: 'literary',
  },
  {
    name: 'Holden Caulfield',
    description: 'A disillusioned youth who rejects phoniness and conformity. Values authenticity and protecting innocence while struggling with connection.',
    imagePrompt: 'A teenage boy in red hunting cap, cynical vulnerable expression, 1950s New York winter, alienated and searching, portrait style',
    valueProfile: { SDA: 3, UNT: 2, BEC: 2, HUM: 2, COR: -3, FAC: -3, ACM: -2, TRD: -1 },
    category: 'literary',
  },
  {
    name: 'Ebenezer Scrooge (redeemed)',
    description: 'A miser transformed by revelation. Having learned the value of generosity, now embraces caring for others and holiday tradition.',
    imagePrompt: 'A joyful elderly man in Victorian nightclothes, warm generous smile, Christmas morning light, transformation and joy, portrait style',
    valueProfile: { BEC: 3, TRD: 2, UNC: 2, HUM: 2, HED: 2, POR: -2, POD: -1 },
    category: 'literary',
  },
  {
    name: 'Dracula',
    description: 'An ancient predator who values power, dominance, and the pleasures of immortality. Combines aristocratic refinement with ruthless hunger.',
    imagePrompt: 'A pale aristocrat in black cape, hypnotic piercing gaze, gothic castle, moonlit and menacing, seductive and dangerous, portrait style',
    valueProfile: { POD: 3, HED: 2, POR: 2, FAC: 2, STI: 2, BEC: -3, HUM: -3, UNC: -2, COR: -1 },
    category: 'literary',
  },
  {
    name: 'Scout Finch',
    description: 'A curious child learning to navigate morality and prejudice. Values fairness, questioning authority, and seeing the good in people.',
    imagePrompt: 'A tomboy girl in overalls, curious innocent expression, Southern porch setting, 1930s Alabama, learning and growing, portrait style',
    valueProfile: { UNT: 3, SDT: 2, BEC: 2, SDA: 2, FAC: -2, COR: -1 },
    category: 'literary',
  },
  {
    name: 'Heathcliff',
    description: 'A tormented soul consumed by passion and vengeance. Values nothing above his obsessive love, willing to destroy everything else.',
    imagePrompt: 'A dark brooding man on windswept moors, intense tortured expression, Victorian clothing, stormy skies, passionate and destructive, portrait style',
    valueProfile: { SDA: 3, POD: 2, STI: 2, POR: 2, HUM: -3, BEC: -2, UNC: -2, COR: -1 },
    category: 'literary',
  },
  {
    name: 'Anne Shirley',
    description: 'An imaginative optimist who finds beauty and possibility everywhere. Values creativity, friendship, and embracing life fully.',
    imagePrompt: 'A red-haired girl with braids and freckles, bright imaginative expression, green gables farmhouse, romantic and hopeful, portrait style',
    valueProfile: { SDT: 3, BED: 2, STI: 2, UNN: 2, HED: 2, POD: -2, COR: -1 },
    category: 'literary',
  },
  {
    name: 'Captain Ahab',
    description: 'A monomaniac driven by vengeance against nature itself. Values nothing but achieving his obsessive goal, regardless of cost.',
    imagePrompt: 'A scarred sea captain with peg leg, obsessed fanatical expression, whaling ship deck, stormy ocean, mad and driven, portrait style',
    valueProfile: { ACM: 3, SDA: 3, POD: 2, STI: 2, BEC: -3, SEO: -3, HUM: -2, UNC: -1 },
    category: 'literary',
  },
  {
    name: 'Ender Wiggin',
    description: 'A tactical genius burdened by empathy. Values understanding others deeply, even enemies, while achieving impossible victories.',
    imagePrompt: 'A young boy in futuristic military uniform, brilliant but weary expression, battle room zero gravity, reluctant warrior, portrait style',
    valueProfile: { SDT: 3, ACM: 3, UNC: 2, BEC: 2, HUM: 2, POD: -2, HED: -1 },
    category: 'literary',
  },
  {
    name: 'Lady Macbeth',
    description: 'An ambitious schemer who values power and status above all. Willing to sacrifice morality for achievement and dominance.',
    imagePrompt: 'A regal Scottish noblewoman, intense ambitious expression, candlelit castle, bloodstained hands, ruthless and driven, portrait style',
    valueProfile: { POD: 3, ACM: 3, FAC: 2, POR: 2, HUM: -3, BEC: -3, UNC: -2, COR: -1 },
    category: 'literary',
  },

  // ============ CULTURAL ROLES ============
  {
    name: 'Patrick',
    description: 'The traditional patriarchal man who embodies authority, protection, and provision. Values power, honor, tradition, and maintaining social order while expecting respect and leadership within family and community.',
    imagePrompt: 'A stern traditional patriarch in formal attire, commanding authoritative presence, family portrait setting, provider and protector role, dignified and conventional, portrait style',
    valueProfile: {
      POD: 2, POR: 2, FAC: 2, ACM: 2, // Power, resources, reputation, achievement emphasized
      SDA: 2, SDT: 1, STI: 1, HED: 1, // Independence valued, moderate stimulation/pleasure
      SEO: 2, SES: 2, TRD: 2, // Security and tradition strongly valued
      COR: 2, COI: 1, // Rule-following important, interpersonal conformity moderate
      HUM: -1, UNT: -1, // Humility and tolerance de-emphasized
      BED: 2, BEC: 1, // Dependability high, caring moderate (protector/provider)
      UNC: 0, UNN: 0, // Universal concern and nature neutral
    },
    category: 'cultural',
  },
  {
    name: 'Patricia',
    description: 'The traditional patriarchal woman who embodies nurturing, devotion, and domestic virtue. Values caring for others, maintaining tradition, and interpersonal harmony while prioritizing family reputation and humble service.',
    imagePrompt: 'A modest traditional woman in conservative dress, gentle nurturing expression, domestic home setting, caretaker and homemaker role, warm and dutiful, portrait style',
    valueProfile: {
      POD: -2, POR: -2, ACM: -1, // Power and achievement strongly discouraged
      SDT: -1, SDA: -2, STI: -2, HED: -2, // Self-direction, stimulation, pleasure suppressed
      FAC: 2, // Reputation through modesty and family honor important
      SEO: 2, SES: 2, TRD: 3, // Security and tradition paramount
      COR: 2, COI: 3, HUM: 2, // Conformity, interpersonal harmony, humility emphasized
      BEC: 3, BED: 3, // Caring and dependability central to identity
      UNC: 1, UNN: 0, UNT: 0, // Compassion moderate, nature/tolerance neutral
    },
    category: 'cultural',
  },
];

/**
 * Calculate match score using Euclidean distance on actual value positions
 * This properly measures how close the user's profile is to the archetype
 * Returns a value from 0 to 1, where 1 is a perfect match
 */
function calculateArchetypeMatch(userScores: ValueScores, archetype: Archetype): number {
  // Convert archetype weights to the 0-7 scale for direct comparison
  const archetypeScores: Record<string, number> = {};
  const weightToScore: Record<number, number> = {
    [-3]: 0.5,
    [-2]: 1.5,
    [-1]: 2.5,
    [0]: 3.5,
    [1]: 4.5,
    [2]: 5.5,
    [3]: 6.5,
  };
  
  for (const value of SCHWARTZ_VALUES) {
    const weight = archetype.valueProfile[value.code] ?? 0;
    archetypeScores[value.code] = weightToScore[weight] ?? 3.5;
  }
  
  // Calculate squared Euclidean distance between profiles
  let sumSquaredDiff = 0;
  let maxPossibleDiff = 0;
  
  for (const value of SCHWARTZ_VALUES) {
    const userVal = userScores[value.code] ?? 3.5;
    const archVal = archetypeScores[value.code];
    
    const diff = userVal - archVal;
    sumSquaredDiff += diff * diff;
    
    // Max possible difference is 6.5 (from 0.5 to 7 or vice versa)
    maxPossibleDiff += 6.5 * 6.5;
  }
  
  // Convert distance to similarity (0 = max distance, 1 = identical)
  const distance = Math.sqrt(sumSquaredDiff);
  const maxDistance = Math.sqrt(maxPossibleDiff);
  const similarity = 1 - (distance / maxDistance);
  
  // Apply a curve to spread out the middle values
  // Most profiles will be 50-80% similar, this spreads that range
  const curved = Math.pow(similarity, 1.5);
  
  return curved;
}

export function findBestArchetype(scores: ValueScores, category: ArchetypeCategory): Archetype {
  const categoryArchetypes = ARCHETYPES.filter(a => a.category === category);
  
  let bestArchetype = categoryArchetypes[0];
  let bestScore = -Infinity;
  
  categoryArchetypes.forEach(archetype => {
    const matchScore = calculateArchetypeMatch(scores, archetype);
    if (matchScore > bestScore) {
      bestScore = matchScore;
      bestArchetype = archetype;
    }
  });
  
  return bestArchetype;
}

export function getMatchScore(scores: ValueScores, archetype: Archetype): number {
  return calculateArchetypeMatch(scores, archetype);
}

export function getMatchingValues(scores: ValueScores, archetype: Archetype): string[] {
  // Get the archetype's defining values (weight 3) that the user also has high
  const userTop = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([code]) => code);
  
  return Object.entries(archetype.valueProfile)
    .filter(([code, weight]) => weight >= 2 && userTop.includes(code))
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 4)
    .map(([code]) => code);
}

/**
 * Calculate similarity between two archetypes based on their value profiles
 */
function calculateArchetypeSimilarity(a: Archetype, b: Archetype): number {
  let dotProduct = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;
  
  const allCodes = new Set([
    ...Object.keys(a.valueProfile),
    ...Object.keys(b.valueProfile)
  ]);
  
  for (const code of allCodes) {
    const aVal = a.valueProfile[code] || 0;
    const bVal = b.valueProfile[code] || 0;
    
    dotProduct += aVal * bVal;
    aMagnitude += aVal * aVal;
    bMagnitude += bVal * bVal;
  }
  
  aMagnitude = Math.sqrt(aMagnitude);
  bMagnitude = Math.sqrt(bMagnitude);
  
  if (aMagnitude === 0 || bMagnitude === 0) return 0;
  return dotProduct / (aMagnitude * bMagnitude);
}

/**
 * Find archetypes similar to the given archetype (across all categories)
 */
export function findSimilarArchetypes(archetype: Archetype, limit: number = 4): Archetype[] {
  const similarities: { archetype: Archetype; score: number }[] = [];
  
  for (const other of ARCHETYPES) {
    if (other.name === archetype.name) continue;
    const score = calculateArchetypeSimilarity(archetype, other);
    similarities.push({ archetype: other, score });
  }
  
  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.archetype);
}

/**
 * Convert an archetype's value profile to a full ValueScores object
 * Maps weight (-3 to 3) to score (0 to 7):
 *  -3 (opposed)   = 0.5
 *  -2 (avoided)   = 1.5
 *  -1 (downplayed)= 2.5
 *   0 (neutral)   = 3.5 (baseline)
 *   1 (present)   = 4.5
 *   2 (important) = 5.5
 *   3 (defining)  = 6.5
 */
export function archetypeToScores(archetype: Archetype): ValueScores {
  const scores: ValueScores = {} as ValueScores;
  
  // Weight to score mapping: each step is 1.0, centered at 3.5
  const weightToScore: Record<number, number> = {
    [-3]: 0.5,
    [-2]: 1.5,
    [-1]: 2.5,
    [0]: 3.5,
    [1]: 4.5,
    [2]: 5.5,
    [3]: 6.5,
  };
  
  for (const value of SCHWARTZ_VALUES) {
    const weight = archetype.valueProfile[value.code] ?? 0;
    scores[value.code] = weightToScore[weight] ?? 3.5;
  }
  
  return scores;
}
