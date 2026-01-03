import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PersonaData {
  name: string;
  description: string;
  valueProfile: Record<string, number>;
}

interface CarrierData {
  id: string;
  name: string;
  description: string;
}

interface TensionData {
  valueA: string;
  valueB: string;
  carrier: string;
  explanation: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personas, carriers, tensions } = await req.json() as { 
      personas: PersonaData[]; 
      carriers: CarrierData[];
      tensions: TensionData[];
    };
    
    if (!personas || personas.length !== 2) {
      return new Response(
        JSON.stringify({ error: "Exactly 2 personas are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!carriers || carriers.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least 1 carrier must be selected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build persona summaries
    const personaSummaries = personas.map(p => {
      const highValues = Object.entries(p.valueProfile)
        .filter(([_, v]) => v >= 2)
        .map(([k, v]) => `${k}(+${v})`)
        .join(', ');
      const lowValues = Object.entries(p.valueProfile)
        .filter(([_, v]) => v <= -1)
        .map(([k, v]) => `${k}(${v})`)
        .join(', ');
      
      return `**${p.name}**: ${p.description}
- Core values: ${highValues || 'balanced'}
- Avoided/opposed: ${lowValues || 'none strongly opposed'}`;
    }).join('\n\n');

    const carrierList = carriers.map(c => `- **${c.name}**: ${c.description}`).join('\n');
    
    const tensionList = tensions.map(t => 
      `- ${t.valueA} vs ${t.valueB} (via ${t.carrier}): ${t.explanation}`
    ).join('\n');

    const systemPrompt = `You are a dramatist and expert in Schwartz's Theory of Basic Human Values.
You create rich, realistic conflict scenarios that illuminate how different value systems clash.

Value code reference:
- SDT (Self-direction Thought), SDA (Self-direction Action) - Independence, creativity
- STI (Stimulation), HED (Hedonism) - Excitement, pleasure
- ACM (Achievement), POD (Power Dominance), POR (Power Resources) - Success, control
- FAC (Face), SEO (Security Personal), SES (Security Societal) - Status, safety
- TRD (Tradition), COR (Conformity Rules), COI (Conformity Interpersonal) - Custom, obedience
- HUM (Humility), BED (Benevolence Dependability), BEC (Benevolence Caring) - Modesty, loyalty
- UNC (Universalism Concern), UNN (Universalism Nature), UNT (Universalism Tolerance) - Justice, equality

Write in a vivid, psychologically insightful style. Make each perspective authentic to the character's worldview.`;

    const userPrompt = `Given these two personas:

${personaSummaries}

And these environmental conditions/carriers that will shape their interaction:
${carrierList}

Key value tensions that will emerge:
${tensionList}

Generate a rich scenario analysis with these three sections:

## SCENARIO SETUP
(2-3 paragraphs) Describe a specific, concrete situation where these personas must interact while experiencing these carriers/conditions. Make it vivid and realistic - where are they, what's at stake, what decision or action has brought them into conflict?

## THIRD-PARTY OBSERVATION
(3-4 paragraphs) Write as an objective observer watching this conflict unfold. Describe what you see happening between these two personas. Note the subtext, the body language, the escalation or de-escalation patterns. Identify what each person seems to want and why they're clashing. Be insightful about the value dynamics at play.

## ${personas[0].name.toUpperCase()}'S PERSPECTIVE
(3-4 paragraphs) Write in first person as ${personas[0].name} explaining to a trusted friend what happened and how they see the conflict. Use their authentic voice. Show how their value priorities shape their interpretation. Include what frustrated them, what they felt the other person didn't understand, and what they believe would be the right resolution.

## ${personas[1].name.toUpperCase()}'S PERSPECTIVE
(3-4 paragraphs) Write in first person as ${personas[1].name} explaining the same events to a trusted friend. Show how their different value priorities lead them to interpret the same events differently. Include their frustrations, their blind spots about the other's perspective, and their sense of what should happen.

Make each perspective genuinely reflect that persona's value system. Show how the same events look completely different through different value lenses.`;

    console.log("Generating persona scenario for:", personas.map(p => p.name).join(" vs "));
    console.log("Carriers:", carriers.map(c => c.name).join(", "));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
    console.error("generate-persona-scenario error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
