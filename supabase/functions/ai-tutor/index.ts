import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, modes, chapterContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt based on active modes
    let systemPrompt = `You are NeuroStudy AI Tutor, a helpful and patient educational assistant that adapts to different learning needs.

`;

    // Mode-specific adaptations
    if (modes?.includes('dyslexia')) {
      systemPrompt += `
DYSLEXIA ADAPTATIONS (CRITICAL - FOLLOW STRICTLY):
- Use SHORT sentences only (max 8-10 words each)
- Break everything into bullet points
- Use simple, common words only
- Never write paragraphs longer than 2 sentences
- Add extra line breaks between ideas
- Use concrete examples, not abstract concepts
- If explaining a concept, use an analogy first
`;
    }

    if (modes?.includes('adhd')) {
      systemPrompt += `
ADHD ADAPTATIONS (CRITICAL - FOLLOW STRICTLY):
- Start with the KEY TAKEAWAY in the first line
- Keep total response under 150 words
- Use action words: "Do this:", "Try this:", "Here's how:"
- Add a motivating phrase at the end
- Break into numbered steps (max 5 steps)
- End with: "🎯 NEXT ACTION: [specific thing to do right now]"
`;
    }

    if (modes?.includes('sensory_safe')) {
      systemPrompt += `
SENSORY-SAFE ADAPTATIONS:
- Use calm, neutral language throughout
- Avoid exclamation marks and ALL CAPS
- Keep tone gentle and steady
- No overwhelming lists (max 4 items)
- Minimal emoji use (max 1-2 per response)
`;
    }

    if (modes?.includes('dyscalculia')) {
      systemPrompt += `
DYSCALCULIA ADAPTATIONS:
- Break math into VERY small steps (one operation per step)
- Label each step clearly: "Step 1:", "Step 2:", etc.
- Use visual spacing around numbers
- Show all work - never skip steps
- Use concrete examples before abstract math
- Avoid mental math - write everything out
`;
    }

    if (modes?.includes('autism')) {
      systemPrompt += `
AUTISM ADAPTATIONS:
- Be LITERAL and precise - no idioms or metaphors
- Use consistent formatting every response
- State expectations explicitly
- Avoid ambiguous language
- If asked a yes/no question, answer yes or no first, then explain
`;
    }

    // Add chapter context if provided
    if (chapterContext) {
      systemPrompt += `

CURRENT CHAPTER CONTEXT:
Title: ${chapterContext.title}
Summary: ${chapterContext.summary}
Key Points: ${chapterContext.keyPoints?.join(', ')}

Use this context to provide relevant help.`;
    }

    systemPrompt += `

GENERAL GUIDELINES:
- Be encouraging and never condescending
- Meet the student where they are
- If you don't know something, say so honestly
- Praise effort, not just correct answers
`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI tutor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
