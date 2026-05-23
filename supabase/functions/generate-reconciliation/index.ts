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

interface ReconciliationValueEntry {
  code: string;
  label: string;
  scores: Record<string, number>;
}

interface BridgeValueEntry extends ReconciliationValueEntry {
  rationale: string;
}

interface ReconciliationAnalysis {
  conflictValues: ReconciliationValueEntry[];
  bridgeValues: BridgeValueEntry[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { archetypes, conflictScenario, analysis } = await req.json() as {
      archetypes: ArchetypeData[];
      conflictScenario: string;
      analysis: ReconciliationAnalysis;
    };

    if (!archetypes || archetypes.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 archetypes are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!conflictScenario || conflictScenario.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "A conflict scenario is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Build archetype summaries (same pattern as generate-conflict-scenario)
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

    // Format the pre-computed analysis for the prompt
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

    const systemPrompt = `You are a conflict mediator and expert in Schwartz's Theory of Basic Human Values.
You find workable bridges between people with opposing value systems, grounded in the circumflex geometry of human motivation.

Value code reference:
- SDT (Self-direction Thought), SDA (Self-direction Action) - Independence, creativity
- STI (Stimulation), HED (Hedonism) - Excitement, pleasure
- ACM (Achievement), POD (Power Dominance), POR (Power Resources) - Success, control
- FAC (Face), SEO (Security Personal), SES (Security Societal) - Status, safety
- TRD (Tradition), COR (Conformity Rules), COI (Conformity Interpersonal) - Custom, obedience
- HUM (Humility), BED (Benevolence Dependability), BEC (Benevolence Caring) - Modesty, loyalty
- UNC (Universalism Concern), UNN (Universalism Nature), UNT (Universalism Tolerance) - Justice, equality

Adjacent values on the Schwartz circumflex are motivationally compatible. Bridge values — values adjacent to the conflict region where both characters have common ground — are the most psychologically natural path to reconciliation. Show reconciliation beginning, not completing.`;

    const userPrompt = `Given these characters and their value profiles:

${archetypesSummary}

They have just had this conflict:
---
${conflictScenario}
---

Pre-analysis of value tensions and circumflex bridges:

Conflict values (where they diverge most):
${conflictSection}

Bridge values (adjacent to the conflict on the Schwartz circumflex, where they are compatible):
${bridgeSection}

Ground the reconciliation in these bridge values — they represent the motivational common ground closest to where the conflict lives on the circumflex.

Generate:

1. COMMON GROUND (2-3 sentences): What do these characters genuinely share beneath their conflict? Root this specifically in the bridge values above — name them, show what they mean concretely to each character.

2. RECONCILIATION PATH (3-4 sentences): What specific steps could help them reach a workable understanding? Consider what each character would need to hear or acknowledge. Reinterpret the original conflict through the lens of the bridge values — show how the same stakes look different when viewed from shared ground.

3. DIALOGUE (6-8 exchanges): Continue the scene where the conflict left off. Show the reconciliation beginning to unfold through the bridge values as the turning point. Each character should:
   - Stay true to their worldview (values don't vanish overnight)
   - Find something real to recognize in the other's position
   - Move toward workable understanding through their authentic voice

Format the dialogue as:
**[Character Name]:** "Their line of dialogue"

Show a real shift — not a sudden agreement, but the first genuine moments of understanding.`;

    console.log("Generating reconciliation for:", archetypes.map(a => a.name).join(", "));

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
    console.error("generate-reconciliation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
