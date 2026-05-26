import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ConfidenceLevel = "high" | "medium" | "unspecified" | "occupational" | "professional";
type SourceLabel = "job_description" | "onet" | "merged";

interface ExistingAnalysis {
  scores: Record<string, number>;
  confidence: Record<string, "high" | "medium" | "unspecified">;
  rationales: Record<string, string>;
}

interface EnrichedAnalysis {
  scores: Record<string, number>;
  confidence: Record<string, ConfidenceLevel>;
  rationales: Record<string, string>;
  sources: Record<string, SourceLabel>;
  occupationalContext: OccupationalContext;
  onetEnriched: boolean;
}

interface OccupationalContext {
  socCode: string;
  occupationTitle: string;
  isProfession: boolean;
  professionEthicsNote?: string;
  topWorkStyles: string[];
  interestProfile: string[];
  workValues: string[];
}

interface OnetElement {
  name: string;
  score?: { value: number };
}

// ---------------------------------------------------------------------------
// O*NET → Schwartz mapping tables
// ---------------------------------------------------------------------------

// Work Values: O*NET work value name → [primary Schwartz codes, secondary Schwartz codes]
const ONET_WORK_VALUES_MAP: Record<string, { primary: string[]; secondary: string[] }> = {
  "Achievement":          { primary: ["ACM"],      secondary: ["SDT"] },
  "Independence":         { primary: ["SDT", "SDA"], secondary: ["STI"] },
  "Recognition":          { primary: ["FAC"],       secondary: ["ACM"] },
  "Relationships":        { primary: ["BEC", "BED"], secondary: ["COI"] },
  "Support":              { primary: ["BEC"],        secondary: ["BED"] },
  "Working Conditions":   { primary: ["SEO"],        secondary: ["SES"] },
};

// Work Styles: O*NET work style name → [primary Schwartz codes, secondary Schwartz codes]
const ONET_WORK_STYLES_MAP: Record<string, { primary: string[]; secondary: string[] }> = {
  "Innovation":                { primary: ["STI", "SDT"], secondary: ["SDA"] },
  "Achievement/Effort":        { primary: ["ACM"],         secondary: ["FAC"] },
  "Analytical Thinking":       { primary: ["SDT"],         secondary: ["STI"] },
  "Attention to Detail":       { primary: ["COR"],         secondary: ["BED"] },
  "Dependability":             { primary: ["BED"],         secondary: ["COR"] },
  "Integrity":                 { primary: ["COR"],         secondary: ["UNC"] },
  "Leadership":                { primary: ["POD"],         secondary: ["ACM"] },
  "Cooperation":               { primary: ["COI"],         secondary: ["BEC"] },
  "Stress Tolerance":          { primary: ["SEO"],         secondary: ["SES"] },
  "Concern for Others":        { primary: ["BEC"],         secondary: ["UNC"] },
  "Self Control":              { primary: ["COR"],         secondary: ["COI"] },
  "Persistence":               { primary: ["ACM"],         secondary: ["BED"] },
  "Adaptability/Flexibility":  { primary: ["SDA"],         secondary: ["STI"] },
  "Initiative":                { primary: ["SDA"],         secondary: ["ACM"] },
  "Independence":              { primary: ["SDT", "SDA"],  secondary: ["STI"] },
  "Social Orientation":        { primary: ["BEC"],         secondary: ["COI"] },
};

// RIASEC Interest Types → Schwartz
const ONET_INTERESTS_MAP: Record<string, { primary: string[]; secondary: string[] }> = {
  "Realistic":      { primary: ["SEO", "SES"], secondary: [] },
  "Investigative":  { primary: ["SDT", "STI"], secondary: [] },
  "Artistic":       { primary: ["SDT", "SDA", "STI"], secondary: [] },
  "Social":         { primary: ["BEC", "UNC"], secondary: [] },
  "Enterprising":   { primary: ["ACM", "POD"], secondary: [] },
  "Conventional":   { primary: ["COR", "BED"], secondary: [] },
};

// Knowledge areas → Schwartz signal (code → direction multiplier)
const ONET_KNOWLEDGE_MAP: Record<string, Record<string, number>> = {
  "Public Safety and Security":    { SES: 1, SEO: 1 },
  "Law and Government":            { COR: 1, SES: 1 },
  "Customer and Personal Service": { BEC: 1, COI: 1 },
  "Philosophy and Theology":       { TRD: 1, HUM: 1 },
  "Engineering and Technology":    { SDT: 1, STI: 1 },
  "Sales and Marketing":           { FAC: 1, ACM: 1 },
};

// ---------------------------------------------------------------------------
// Licensed profession detection
// ---------------------------------------------------------------------------

const PROFESSION_ETHICS_MAP: Record<string, string> = {
  "17-1011": "AIA Code of Ethics (aia.org/code-ethics-professional-conduct)",
  "23-1011": "ABA Model Rules of Professional Conduct",
  "29-1216": "AMA Code of Medical Ethics",
  "29-1141": "ANA Code of Ethics for Nurses",
  "19-3031": "APA Ethics Code",
  "13-2011": "AICPA Code of Professional Conduct",
  "17-2051": "ASCE Code of Ethics",
  "29-1051": "AACOM/ACGME Professional Standards (Osteopathic Medicine)",
  "25-2021": "NEA Code of Ethics for Teachers",
  "29-1051": "ACGME Milestones (Residency Standards)",
  "29-1131": "APTA Code of Ethics (Physical Therapy)",
  "29-1122": "AOTA Occupational Therapy Code of Ethics",
  "29-1127": "ASHA Code of Ethics (Speech-Language Pathology)",
};

// ---------------------------------------------------------------------------
// O*NET API helpers
// ---------------------------------------------------------------------------

async function fetchOnet(
  path: string,
  credentials: string
): Promise<OnetElement[]> {
  const url = `https://services.onetcenter.org/ws${path}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${credentials}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`O*NET API error: ${response.status} on ${path}`);
  }

  const data = await response.json();

  // O*NET returns different shapes depending on the endpoint.
  // Most detail endpoints wrap results in the last path segment.
  // Try common keys: element, occupation, category
  const candidates = [
    data.element,
    data.occupation,
    data.category,
    data.interest,
    data.work_value,
    data.work_style,
    data.knowledge,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as OnetElement[];
  }

  return [];
}

/**
 * Strip seniority/level prefixes that O*NET titles don't use.
 * "Senior Architect" → "Architect", "Lead Software Engineer" → "Software Engineer"
 */
function normalizeJobTitle(title: string): string {
  const prefixes = [
    "senior", "junior", "lead", "principal", "staff", "associate",
    "head of", "director of", "vp of", "chief", "founding",
    "mid-level", "mid level", "entry-level", "entry level",
  ];
  let normalized = title.trim().toLowerCase();
  for (const prefix of prefixes) {
    if (normalized.startsWith(prefix + " ")) {
      normalized = normalized.slice(prefix.length + 1).trim();
    }
  }
  // Restore original casing by capitalising first letter of each word
  return normalized.replace(/\b\w/g, (c) => c.toUpperCase());
}

async function searchOnet(
  keyword: string,
  credentials: string
): Promise<{ code: string; title: string } | null> {
  const url = `https://services.onetcenter.org/ws/occupations/search?keyword=${encodeURIComponent(keyword)}&start=1&end=5`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${credentials}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`O*NET search error: ${response.status}`);
  }

  const data = await response.json();
  const occupations: Array<{ code: string; title: string }> = data.occupation ?? [];
  return occupations.length > 0 ? occupations[0] : null;
}

async function findOccupation(
  jobTitle: string,
  credentials: string
): Promise<{ code: string; title: string } | null> {
  // Try the full title first
  const result = await searchOnet(jobTitle, credentials);
  if (result) return result;

  // Try with seniority prefix stripped
  const normalized = normalizeJobTitle(jobTitle);
  if (normalized.toLowerCase() !== jobTitle.toLowerCase()) {
    const fallback = await searchOnet(normalized, credentials);
    if (fallback) return fallback;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Schwartz signal accumulation
// ---------------------------------------------------------------------------

function accumulateSignal(
  accumulator: Record<string, number[]>,
  codes: string[],
  weight: number
): void {
  for (const code of codes) {
    if (!accumulator[code]) accumulator[code] = [];
    accumulator[code].push(weight);
  }
}

/**
 * Convert O*NET importance (0–100) to Schwartz scale (0–7)
 */
function toSchwartz(importance: number): number {
  return Math.round((importance / 100) * 7 * 10) / 10;
}

// ---------------------------------------------------------------------------
// Main enrichment logic
// ---------------------------------------------------------------------------

function buildEnrichedAnalysis(
  existing: ExistingAnalysis,
  onetSignals: Record<string, number[]>,
  socCode: string,
  occupationTitle: string,
  isProfession: boolean,
  professionEthicsNote: string | undefined,
  topWorkStyles: string[],
  interestProfile: string[],
  workValues: string[]
): EnrichedAnalysis {
  const scores: Record<string, number> = { ...existing.scores };
  const confidence: Record<string, ConfidenceLevel> = { ...existing.confidence };
  const rationales: Record<string, string> = { ...existing.rationales };
  const sources: Record<string, SourceLabel> = {};

  const ALL_CODES = [
    "SDT", "SDA", "STI", "HED", "ACM", "POD", "POR", "FAC",
    "SEO", "SES", "TRD", "COR", "COI", "HUM", "BEC", "BED",
    "UNC", "UNN", "UNT",
  ];

  for (const code of ALL_CODES) {
    const existingConf = existing.confidence[code] ?? "unspecified";
    const onetValues = onetSignals[code];

    if (!onetValues || onetValues.length === 0) {
      // No O*NET signal — keep as-is
      sources[code] = "job_description";
      continue;
    }

    const onetScore = onetValues.reduce((a, b) => a + b, 0) / onetValues.length;

    if (existingConf === "high" || existingConf === "medium") {
      // Job description wins — add O*NET as supporting note only
      sources[code] = "job_description";
      const direction = onetScore > 3.5 ? "reinforced" : "qualified";
      const existing_rationale = rationales[code] ?? "";
      rationales[code] = existing_rationale
        ? `${existing_rationale} [O*NET: ${direction} by occupational baseline]`
        : `[O*NET: ${direction} by occupational baseline]`;
    } else if (existingConf === "unspecified") {
      // Gap — fill from O*NET
      scores[code] = onetScore;
      confidence[code] = "occupational";
      sources[code] = "onet";
      rationales[code] = `Inferred from O*NET occupational profile for ${occupationTitle}`;
    } else {
      // Already occupational/professional — keep
      sources[code] = "onet";
    }
  }

  // Check merged: job description + O*NET both present and directionally agree/disagree
  for (const code of ALL_CODES) {
    const existingConf = existing.confidence[code] ?? "unspecified";
    const onetValues = onetSignals[code];
    if (!onetValues || onetValues.length === 0) continue;
    if (existingConf !== "high" && existingConf !== "medium") continue;

    const onetScore = onetValues.reduce((a, b) => a + b, 0) / onetValues.length;
    const jdScore = existing.scores[code] ?? 3.5;
    const gap = Math.abs(jdScore - onetScore);

    if (gap <= 1.5) {
      // Agree — blend 60% jd / 40% onet
      scores[code] = Math.round((jdScore * 0.6 + onetScore * 0.4) * 10) / 10;
      sources[code] = "merged";
    } else {
      // Conflict — keep jd score but flag it
      scores[code] = jdScore;
      sources[code] = "job_description";
      const existing_rationale = rationales[code] ?? "";
      rationales[code] = existing_rationale
        ? `${existing_rationale} [⚠ Tension: job description (${jdScore.toFixed(1)}) diverges from occupational baseline (${onetScore.toFixed(1)}) — worth probing in interviews]`
        : `[⚠ Tension: job description (${jdScore.toFixed(1)}) diverges from occupational baseline (${onetScore.toFixed(1)}) — worth probing in interviews]`;
    }
  }

  // Professional ethics nudge — boost COR and UNC if previously unspecified
  if (isProfession) {
    for (const code of ["COR", "UNC"]) {
      if (existing.confidence[code] === "unspecified") {
        const current = scores[code] ?? 3.5;
        scores[code] = Math.round(Math.min(7, current + 0.7) * 10) / 10;
        confidence[code] = "professional";
        sources[code] = "onet";
        rationales[code] = `Elevated by professional ethics context (${professionEthicsNote ?? "regulated profession"})`;
      }
    }
  }

  return {
    scores,
    confidence,
    rationales,
    sources,
    occupationalContext: {
      socCode,
      occupationTitle,
      isProfession,
      professionEthicsNote,
      topWorkStyles,
      interestProfile,
      workValues,
    },
    onetEnriched: true,
  };
}

// ---------------------------------------------------------------------------
// Edge Function entry point
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobTitle, existingAnalysis } = await req.json() as {
      jobTitle: string;
      existingAnalysis: ExistingAnalysis;
    };

    // Input validation — return original analysis (200) rather than 4xx so the
    // frontend always gets a usable response even if enrichment can't proceed.
    if (!jobTitle || typeof jobTitle !== "string" || jobTitle.trim().length < 2) {
      console.warn("enrich-job-analysis: missing or short jobTitle");
      return new Response(
        JSON.stringify({ ...(existingAnalysis ?? {}), onetEnriched: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!existingAnalysis?.scores || !existingAnalysis?.confidence) {
      console.warn("enrich-job-analysis: missing existingAnalysis");
      return new Response(
        JSON.stringify({ onetEnriched: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get O*NET credentials
    const ONET_USERNAME = Deno.env.get("ONET_USERNAME");
    const ONET_PASSWORD = Deno.env.get("ONET_PASSWORD");

    if (!ONET_USERNAME || !ONET_PASSWORD) {
      console.error("O*NET credentials not configured — returning original analysis");
      return new Response(
        JSON.stringify({ ...existingAnalysis, onetEnriched: false, onetStatus: "credentials_missing" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = btoa(`${ONET_USERNAME}:${ONET_PASSWORD}`);

    // Step 1: Look up occupation (tries full title, then strips seniority prefix)
    console.log(`Enriching job analysis for: "${jobTitle}"`);
    let occupation: { code: string; title: string } | null = null;

    try {
      occupation = await findOccupation(jobTitle.trim(), credentials);
    } catch (err) {
      console.error("O*NET occupation lookup failed:", err);
      return new Response(
        JSON.stringify({ ...existingAnalysis, onetEnriched: false, onetStatus: "api_error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!occupation) {
      console.log(`No O*NET match for "${jobTitle}" (tried with and without seniority prefix)`);
      return new Response(
        JSON.stringify({ ...existingAnalysis, onetEnriched: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { code: socCode, title: occupationTitle } = occupation;
    console.log(`Matched: ${socCode} — ${occupationTitle}`);

    // Step 2: Fetch occupational detail in parallel
    let workValuesData: OnetElement[] = [];
    let workStylesData: OnetElement[] = [];
    let interestsData: OnetElement[] = [];
    let knowledgeData: OnetElement[] = [];

    try {
      [workValuesData, workStylesData, interestsData, knowledgeData] = await Promise.all([
        fetchOnet(`/occupations/${socCode}/work_values`, credentials),
        fetchOnet(`/occupations/${socCode}/work_styles`, credentials),
        fetchOnet(`/occupations/${socCode}/interests`, credentials),
        fetchOnet(`/occupations/${socCode}/knowledge`, credentials),
      ]);
    } catch (err) {
      console.error("O*NET detail fetch failed:", err);
      return new Response(
        JSON.stringify({ ...existingAnalysis, onetEnriched: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Accumulate Schwartz signals
    const onetSignals: Record<string, number[]> = {};

    // Work values
    for (const element of workValuesData) {
      const importance = element.score?.value ?? 0;
      if (importance < 65) continue;
      const mapping = ONET_WORK_VALUES_MAP[element.name];
      if (!mapping) continue;
      const schwarzScore = toSchwartz(importance);
      accumulateSignal(onetSignals, mapping.primary, schwarzScore);
      accumulateSignal(onetSignals, mapping.secondary, schwarzScore * 0.6);
    }

    // Work styles
    for (const element of workStylesData) {
      const importance = element.score?.value ?? 0;
      if (importance < 65) continue;
      const mapping = ONET_WORK_STYLES_MAP[element.name];
      if (!mapping) continue;
      const schwarzScore = toSchwartz(importance);
      accumulateSignal(onetSignals, mapping.primary, schwarzScore);
      accumulateSignal(onetSignals, mapping.secondary, schwarzScore * 0.6);
    }

    // Interests (RIASEC)
    for (const element of interestsData) {
      const importance = element.score?.value ?? 0;
      if (importance < 65) continue;
      const mapping = ONET_INTERESTS_MAP[element.name];
      if (!mapping) continue;
      const schwarzScore = toSchwartz(importance);
      accumulateSignal(onetSignals, mapping.primary, schwarzScore);
    }

    // Knowledge
    for (const element of knowledgeData) {
      const importance = element.score?.value ?? 0;
      if (importance < 65) continue;
      const codes = ONET_KNOWLEDGE_MAP[element.name];
      if (!codes) continue;
      const schwarzScore = toSchwartz(importance);
      for (const [code, multiplier] of Object.entries(codes)) {
        accumulateSignal(onetSignals, [code], schwarzScore * multiplier);
      }
    }

    // Step 4: Build occupationalContext metadata
    const topWorkStyles = workStylesData
      .filter(e => (e.score?.value ?? 0) > 70)
      .sort((a, b) => (b.score?.value ?? 0) - (a.score?.value ?? 0))
      .slice(0, 5)
      .map(e => e.name);

    const interestProfile = interestsData
      .sort((a, b) => (b.score?.value ?? 0) - (a.score?.value ?? 0))
      .slice(0, 3)
      .map(e => e.name);

    const workValuesLabels = workValuesData
      .filter(e => (e.score?.value ?? 0) > 60)
      .map(e => e.name);

    // Step 5: Profession detection
    const socPrefix = socCode.substring(0, 7);
    const professionEthicsNote = PROFESSION_ETHICS_MAP[socPrefix];
    const isProfession = !!professionEthicsNote;

    // Step 6: Build enriched result
    const enriched = buildEnrichedAnalysis(
      existingAnalysis,
      onetSignals,
      socCode,
      occupationTitle,
      isProfession,
      professionEthicsNote,
      topWorkStyles,
      interestProfile,
      workValuesLabels
    );

    console.log(`Enrichment complete for ${socCode}. isProfession=${isProfession}`);

    return new Response(
      JSON.stringify(enriched),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Always return 200 so the frontend never sees a non-2xx from this function.
    // The caller treats onetEnriched:false as a graceful no-op.
    console.error("enrich-job-analysis error:", error);
    return new Response(
      JSON.stringify({ onetEnriched: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
