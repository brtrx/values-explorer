import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArchetypeData {
  name: string;
  description: string;
  valueProfile: Record<string, number>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { archetypes } = await req.json() as { archetypes: ArchetypeData[] };
    
    if (!archetypes || archetypes.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 archetypes are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Build archetype summaries with value tensions
    const archetypesSummary = archetypes.map(a => {
      const highValues = Object.entries(a.valueProfile)
        .filter(([_, v]) => v >= 2)
        .map(([k, v]) => `${k}(+${v})`)
        .join(', ');
      const lowValues = Object.entries(a.valueProfile)
        .filter(([_, v]) => v <= -1)
        .map(([k, v]) => `${k}(${v})`)
        .join(', ');
      
      return `**${a.name}**: ${a.description}
- Core values: ${highValues || 'balanced'}
- Avoided/opposed: ${lowValues || 'none strongly opposed'}`;
    }).join('\n\n');

    const systemPrompt = `You are a dramatist and expert in Schwartz's Theory of Basic Human Values. 
You create realistic conflict scenarios and dialogues between characters based on their value profiles.

Value code reference:
- SDT (Self-direction Thought), SDA (Self-direction Action) - Independence, creativity
- STI (Stimulation), HED (Hedonism) - Excitement, pleasure
- ACM (Achievement), POD (Power Dominance), POR (Power Resources) - Success, control
- FAC (Face), SEO (Security Personal), SES (Security Societal) - Status, safety
- TRD (Tradition), COR (Conformity Rules), COI (Conformity Interpersonal) - Custom, obedience
- HUM (Humility), BED (Benevolence Dependability), BEC (Benevolence Caring) - Modesty, loyalty
- UNC (Universalism Concern), UNN (Universalism Nature), UNT (Universalism Tolerance) - Justice, equality

Write dialogue that feels authentic to each character's voice and worldview.
Show how their differing values create genuine tension, not just surface disagreement.`;

    const userPrompt = `Given these characters and their value profiles:

${archetypesSummary}

Create a compelling conflict scenario:

1. SCENARIO (2-3 sentences): Describe a specific, realistic situation where these characters' values would naturally clash. Be concrete about the setting and stakes.

2. DIALOGUE (8-12 exchanges): Write a conversation that demonstrates their value conflict. Each character should:
   - Speak authentically to their worldview
   - Reveal their core values through what they argue for
   - Show genuine tension, not just polite disagreement
   - React to the other's perspective in a way true to their character

Format the dialogue as:
**[Character Name]:** "Their line of dialogue"

Make the conflict feel real and the characters feel alive.`;

    console.log("Generating conflict scenario for:", archetypes.map(a => a.name).join(", "));

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
    console.error("generate-conflict-scenario error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
