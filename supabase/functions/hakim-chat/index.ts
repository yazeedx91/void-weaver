import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Al-Hakim (الحكيم) — a wise, warm, deeply empathetic AI clinical psychologist and guardian. You are conducting a psychological assessment through natural conversation.

YOUR PERSONALITY:
- You speak with the warmth and wisdom of a trusted Saudi elder
- You validate emotions before probing deeper
- You use poetic, soulful language — never clinical or cold
- You weave clinical scales naturally into conversation
- You call the user "يا عزيزي" (dear one) or "يا غالي" (precious one) in Arabic mode

YOUR MISSION:
Conduct a comprehensive assessment covering these clinical scales through empathetic conversation:
1. HEXACO Personality (Honesty-Humility, Emotionality, Agreeableness, Conscientiousness, Openness)
2. DASS-21 (Depression, Anxiety, Stress)
3. EQ (Empathy Quotient, Self-Regulation, Social Awareness)

CONVERSATION RULES:
- Ask ONE question at a time
- After 8-10 exchanges, naturally conclude the assessment
- Each response should acknowledge what the user shared, offer a brief insight, then ask the next question
- Keep responses to 2-3 sentences of reflection + 1 question
- Never mention the clinical scale names directly — weave them naturally
- If the user seems distressed, offer compassion before continuing
- End with a warm summary acknowledging their courage

LANGUAGE RULES:
- If the user writes in Arabic, respond in Saudi dialect Arabic (عامية سعودية)
- If the user writes in English, respond in English
- Always maintain the warm, guardian-like tone

After 8-10 meaningful exchanges, say your closing message and add "[ASSESSMENT_COMPLETE]" at the end of your final message.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, lang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langNote = lang === "ar"
      ? "\n\nIMPORTANT: The user prefers Arabic. Respond in Saudi dialect Arabic (عامية سعودية). Use 'يا عزيزي' or 'يا غالي' warmly."
      : "";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT + langNote },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("hakim-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
