import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert in organizational psychology and the Schwartz Theory of Basic Values.
Analyze the provided job description and infer which of the 19 Schwartz values (PVQ-RR) it emphasizes.
Score each value on a scale of 0-7, where:

0-2: Contradicts or opposes this value
3.5: Neutral/not relevant to the role
5-7: Strongly emphasizes this value

For values where you cannot confidently infer from the job description, use 3.5 and mark confidence as "unspecified".

The 19 values are:
- SDT (Self-direction – thought): Independent thinking, curiosity, creativity
- SDA (Self-direction – action): Freedom to choose own actions
- STI (Stimulation): Excitement, novelty, challenge
- HED (Hedonism): Pleasure, sensuous gratification
- ACM (Achievement): Success according to social standards
- POD (Power – dominance): Power through control over people
- POR (Power – resources): Power through control of resources
- FAC (Face): Maintaining public image and avoiding humiliation
- SEO (Security – personal): Safety in immediate environment
- SES (Security – societal): Safety and stability in wider society
- TRD (Tradition): Maintaining cultural/religious customs
- COR (Conformity – rules): Compliance with rules and obligations
- COI (Conformity – interpersonal): Avoiding upsetting others
- HUM (Humility): Recognizing one's insignificance in larger context
- BEC (Benevolence – caring): Devotion to welfare of in-group
- BED (Benevolence – dependability): Being a reliable group member
- UNC (Universalism – concern): Commitment to equality and justice
- UNN (Universalism – nature): Preservation of natural environment
- UNT (Universalism – tolerance): Acceptance of those different from oneself

For each value with "high" or "medium" confidence, provide a brief rationale that quotes specific phrases from the job description. Keep rationales concise (1-2 short quoted phrases). Do NOT include rationales for "unspecified" values.

Return ONLY a valid JSON object with this structure:
{
  "scores": {
    "SDT": 5.2,
    "SDA": 4.8,
    "STI": 3.5,
    ...all 19 values
  },
  "confidence": {
    "SDT": "high",
    "SDA": "medium",
    "STI": "unspecified",
    ...all 19 values
  },
  "rationales": {
    "SDT": "\"innovative problem-solving\" and \"creative solutions\"",
    "SDA": "\"autonomous work environment\""
  }
}

Confidence levels:
- "high": Clear evidence in job description
- "medium": Inferrable but not explicit
- "unspecified": No relevant information`;

const VALUE_CODES = [
  'SDT', 'SDA', 'STI', 'HED', 'ACM', 'POD', 'POR', 'FAC',
  'SEO', 'SES', 'TRD', 'COR', 'COI', 'HUM', 'BEC', 'BED',
  'UNC', 'UNN', 'UNT'
];

interface AnalysisResult {
  scores: Record<string, number>;
  confidence: Record<string, "high" | "medium" | "unspecified">;
  rationales: Record<string, string>;
}

function validateAndNormalizeResult(parsed: unknown): AnalysisResult {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error("Invalid response structure");
  }

  const result = parsed as Record<string, unknown>;

  if (!result.scores || typeof result.scores !== 'object') {
    throw new Error("Missing or invalid 'scores' field");
  }

  if (!result.confidence || typeof result.confidence !== 'object') {
    throw new Error("Missing or invalid 'confidence' field");
  }

  const scores: Record<string, number> = {};
  const confidence: Record<string, "high" | "medium" | "unspecified"> = {};
  const rationales: Record<string, string> = {};

  // Get rationales from response (optional field)
  const rawRationales = result.rationales as Record<string, unknown> | undefined;

  for (const code of VALUE_CODES) {
    // Validate and normalize score
    const score = (result.scores as Record<string, unknown>)[code];
    if (typeof score === 'number' && score >= 0 && score <= 7) {
      scores[code] = Math.round(score * 10) / 10; // Round to 1 decimal
    } else {
      scores[code] = 3.5; // Default to neutral
    }

    // Validate and normalize confidence
    const conf = (result.confidence as Record<string, unknown>)[code];
    if (conf === 'high' || conf === 'medium' || conf === 'unspecified') {
      confidence[code] = conf;
    } else {
      confidence[code] = 'unspecified';
    }

    // Extract rationale only for high/medium confidence values
    if (rawRationales && (confidence[code] === 'high' || confidence[code] === 'medium')) {
      const rationale = rawRationales[code];
      if (typeof rationale === 'string' && rationale.trim().length > 0) {
        rationales[code] = rationale.trim();
      }
    }
  }

  return { scores, confidence, rationales };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { jobDescription } = await req.json() as { jobDescription: string };

    // Validate input
    if (!jobDescription || typeof jobDescription !== 'string') {
      return new Response(
        JSON.stringify({ error: "jobDescription is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (jobDescription.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "jobDescription must be at least 50 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log("Analyzing job description:", jobDescription.substring(0, 100) + "...");

    // Call OpenAI API (non-streaming)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyze this job description and return the Schwartz value scores:\n\n${jobDescription}` },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    // Handle API errors
    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401) {
        console.error("OpenAI API authentication failed");
        throw new Error("API authentication failed");
      }
      if (response.status === 500 || response.status === 503) {
        return new Response(
          JSON.stringify({ error: "OpenAI service temporarily unavailable. Please try again." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    // Parse OpenAI response
    const completion = await response.json();
    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse JSON from the response (handle potential markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith("```")) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", content);
      throw new Error("Failed to parse analysis result");
    }

    // Validate and normalize the result
    const result = validateAndNormalizeResult(parsed);

    console.log("Analysis complete. Top values:",
      Object.entries(result.scores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([k, v]) => `${k}:${v}`)
        .join(", ")
    );

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("analyze-job-description error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
