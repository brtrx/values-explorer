import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StressorData {
  stressorId: string;
  stressorName: string;
  stressorDescription: string;
  highPolarityValues: Array<{ code: string; label: string; polarity: number }>;
  lowPolarityValues: Array<{ code: string; label: string; polarity: number }>;
}

interface RequestBody {
  jobDescription: string;
  jobTitle?: string;
  stressors: StressorData[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription, jobTitle, stressors } = await req.json() as RequestBody;

    if (!jobDescription || jobDescription.length < 50) {
      return new Response(
        JSON.stringify({ error: "Job description must be at least 50 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!stressors || stressors.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one stressor must be provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Build stressor descriptions for the prompt
    const stressorPrompts = stressors.map(c => {
      const highValues = c.highPolarityValues.map(v => `${v.label} (${v.code})`).join(", ");
      const lowValues = c.lowPolarityValues.map(v => `${v.label} (${v.code})`).join(", ");

      return `
STRESSOR: ${c.stressorName}
Description: ${c.stressorDescription}
Values favored by HIGH ${c.stressorName}: ${highValues || "none strongly"}
Values favored by LOW ${c.stressorName}: ${lowValues || "none strongly"}`;
    }).join("\n\n");

    const systemPrompt = `You are an expert in organizational psychology and Schwartz's Theory of Basic Human Values.

Your task is to generate clarifying questions that a candidate can ask a hiring manager during an interview. These questions help candidates understand what values are actually prioritized in the role, beyond what the job description explicitly states.

For each scenario:
1. Create a realistic, job-specific hypothetical situation based on the provided job description
2. Frame it as a question to ask the hiring manager about what they would prefer
3. Present two behavioral options (A and B) that authentically represent different value priorities
4. Make both options reasonable - neither should be obviously "wrong"
5. Option A should favor values with HIGH polarity on the given stressor dimension
6. Option B should favor values with LOW polarity on the given stressor dimension
7. Keep scenarios concise (2-3 sentences for setup ending with "Would you prefer them to...", 1 sentence per option)

IMPORTANT: Frame scenarios in THIRD PERSON as questions about "the person in this role" - NOT in second person ("you"). These are questions for candidates to ask hiring managers.

Value code reference:
- SDT/SDA: Self-direction (thought/action) - Independence, creativity
- STI/HED: Stimulation/Hedonism - Excitement, pleasure
- ACM: Achievement - Success, competence
- POD/POR: Power (dominance/resources) - Authority, wealth
- FAC: Face - Public image, reputation
- SEO/SES: Security (personal/societal) - Safety, stability
- TRD: Tradition - Customs, heritage
- COR/COI: Conformity (rules/interpersonal) - Obedience, politeness
- HUM: Humility - Modesty, self-effacement
- BEC/BED: Benevolence (caring/dependability) - Loyalty, helpfulness
- UNC/UNN/UNT: Universalism (concern/nature/tolerance) - Equality, environment, acceptance

Return valid JSON only, no markdown.`;

    const userPrompt = `Generate clarifying questions for a candidate to ask a hiring manager about this job:

${jobTitle ? `JOB TITLE: ${jobTitle}\n` : ""}
JOB DESCRIPTION:
${jobDescription}

Generate ONE scenario/question for EACH of these stressors:
${stressorPrompts}

Return JSON in this exact format:
{
  "scenarios": [
    {
      "stressorId": "the_stressor_id",
      "stressorName": "Stressor Name",
      "setup": "Imagine [specific situation from the job], leaving the person in this role [context]. Would you prefer them to...",
      "optionA": "[Specific action favoring high-polarity values, starting with a verb]",
      "optionB": "[Specific action favoring low-polarity values, starting with a verb]",
      "interpretationA": "This suggests the role values [high-polarity value names]",
      "interpretationB": "This suggests the role values [low-polarity value names]"
    }
  ]
}`;

    console.log("Generating clarification scenarios for", stressors.length, "stressors");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("OpenAI API error:", response.status, text);
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Parse the JSON response
    let parsedContent;
    try {
      // Handle potential markdown code blocks
      let jsonStr = content.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      parsedContent = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Failed to parse scenario response");
    }

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-clarification-scenarios error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
