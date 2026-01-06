import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, detailLevel = 'standard', modes = [] } = await req.json();

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'No content provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Protect the model from extremely large inputs that exceed provider limits.
    const MAX_INPUT_CHARS = 350_000;
    const truncateForModel = (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed.length <= MAX_INPUT_CHARS) {
        return { text: trimmed, truncated: false, originalLength: trimmed.length };
      }

      // Keep the start + end of the document (often contains headings + conclusions).
      const marker = '\n\n[... content truncated due to size ...]\n\n';
      const budget = Math.max(0, MAX_INPUT_CHARS - marker.length);
      const head = Math.floor(budget * 0.7);
      const tail = budget - head;

      return {
        text: trimmed.slice(0, head) + marker + trimmed.slice(-tail),
        truncated: true,
        originalLength: trimmed.length,
      };
    };

    const { text: safeContent, truncated, originalLength } = truncateForModel(content);
    if (truncated) {
      console.log(
        `summarize-notes: input truncated from ${originalLength} chars to ${safeContent.length} chars to fit provider limits.`
      );
    } else {
      console.log(`summarize-notes: input length ${originalLength} chars.`);
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Adjust instructions based on user's modes
    let styleInstructions = '';
    if (modes.includes('dyslexia')) {
      styleInstructions = 'Use short sentences. Simple words. Add extra line breaks between points. Use bullet points extensively.';
    } else if (modes.includes('adhd')) {
      styleInstructions = 'Be concise and action-oriented. Use bold for key points. Include a "Quick Start" section at the top.';
    } else if (modes.includes('sensory_safe')) {
      styleInstructions = 'Use calm, neutral language. Avoid exclamation marks or urgent phrasing.';
    }

    // Adjust detail level
    let detailInstructions = '';
    switch (detailLevel) {
      case 'brief':
        detailInstructions = 'Keep the summary to 1 paragraph. Notes should have only 3-5 key points total.';
        break;
      case 'comprehensive':
        detailInstructions = 'Provide an extensive summary (3-4 paragraphs). Notes should be very detailed with 10+ points per section.';
        break;
      default:
        detailInstructions = 'Provide a balanced summary (2-3 paragraphs). Notes should have 5-7 points per section.';
    }

    const systemPrompt = `You are an expert note-taker and summarizer. ${styleInstructions}

${detailInstructions}

You must respond with valid JSON in this exact format:
{
  "summary": "A concise summary of the content",
  "notes": {
    "keyPoints": ["point 1", "point 2"],
    "mainThemes": ["theme 1", "theme 2"],
    "importantDetails": ["detail 1", "detail 2"],
    "actionItems": ["action 1", "action 2"]
  }
}

If there are no action items, return an empty array for actionItems.

If the provided content is clearly an excerpt (truncated), mention this briefly in the summary.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content:
              `Please summarize and create notes from the following content.\n` +
              (truncated
                ? `NOTE: The content was truncated due to size. Summarize based on the excerpt and mention it's partial.\n\n`
                : `\n`) +
              safeContent,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'API credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Provider commonly returns a 400 when the prompt is too large.
      const tokenLimitHit =
        response.status === 400 &&
        /token count exceeds|maximum number of tokens/i.test(errorText);

      if (tokenLimitHit) {
        return new Response(
          JSON.stringify({
            error:
              'This file is too large to summarize at once. Please upload a smaller file or split the content into multiple parts.',
          }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiResponse];
      const jsonStr = jsonMatch[1].trim();
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback structure if parsing fails
      parsedResponse = {
        summary: aiResponse,
        notes: {
          keyPoints: ['Unable to parse structured notes'],
          mainThemes: [],
          importantDetails: [],
          actionItems: []
        }
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Summarize notes error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
