import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArchetypeComparison {
  name: string;
  description: string;
  valueProfile: Record<string, number>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { archetypes } = await req.json() as { archetypes: ArchetypeComparison[] };
    
    if (!archetypes || archetypes.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 archetypes are required for comparison" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const archetypesSummary = archetypes.map(a => {
      const highValues = Object.entries(a.valueProfile)
        .filter(([_, v]) => v >= 2)
        .map(([k, v]) => `${k}(${v > 0 ? '+' : ''}${v})`)
        .join(', ');
      const lowValues = Object.entries(a.valueProfile)
        .filter(([_, v]) => v <= -1)
        .map(([k, v]) => `${k}(${v})`)
        .join(', ');
      
      return `**${a.name}**: ${a.description}
- Emphasized values: ${highValues || 'none specified'}
- Avoided/opposed values: ${lowValues || 'none specified'}`;
    }).join('\n\n');

    const systemPrompt = `You are an expert in Schwartz's Theory of Basic Human Values and character analysis. 
You compare fictional, historical, and mythological characters based on their value profiles.

The Schwartz value codes are:
- SDT (Self-direction Thought), SDA (Self-direction Action) - Openness to Change
- STI (Stimulation), HED (Hedonism) - Openness/Self-Enhancement
- ACM (Achievement), POD (Power Dominance), POR (Power Resources) - Self-Enhancement
- FAC (Face), SEO (Security Personal), SES (Security Societal) - Self-Enhancement/Conservation
- TRD (Tradition), COR (Conformity Rules), COI (Conformity Interpersonal) - Conservation
- HUM (Humility), BED (Benevolence Dependability), BEC (Benevolence Caring) - Conservation/Self-Transcendence
- UNC (Universalism Concern), UNN (Universalism Nature), UNT (Universalism Tolerance) - Self-Transcendence

Value weights range from -3 (actively opposed) to +3 (defining trait).

Provide insightful, engaging comparisons that highlight:
1. Key philosophical and motivational differences
2. Potential conflicts if these characters met
3. Surprising similarities despite surface differences
4. How their value profiles explain their famous actions/decisions`;

    const userPrompt = `Compare these ${archetypes.length} characters based on their Schwartz value profiles:

${archetypesSummary}

Write a compelling 3-4 paragraph comparison that:
1. Identifies the core value tensions between them
2. Explains what drives each character differently
3. Notes any unexpected common ground
4. Considers how they would view each other's choices`;

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
        stream: true,
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
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("compare-archetypes error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
