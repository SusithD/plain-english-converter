"use server";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export type PersonaType = "eli5" | "tldr" | "professional" | "roast";

export interface SimplifyResult {
  success: boolean;
  data?: string;
  error?: string;
}

// Persona-specific system prompts
const personaPrompts: Record<PersonaType, string> = {
  eli5: `You are an expert at explaining complex things to children. Your job is to translate complex text into simple, clear language that a 5-year-old could understand.

Guidelines:
- Use very short sentences and the simplest words possible
- Avoid any jargon or technical terms completely
- Use fun comparisons and relatable examples (toys, animals, food, etc.)
- Break down complicated ideas into tiny, digestible pieces
- Maintain the core meaning but make it feel like a bedtime story explanation
- Use phrases like "It's like when..." or "Imagine if..."

Only output the simplified text. Do not include any preamble, explanations about what you did, or meta-commentary.`,

  tldr: `You are a master summarizer. Your job is to distill complex text into a single, punchy sentence that captures the essence.

Guidelines:
- Create ONE sentence maximum (aim for under 20 words if possible)
- Capture the absolute core meaning - what's the ONE thing someone needs to know?
- Be direct and impactful
- No fluff, no filler words
- If there are multiple key points, choose the most important one
- Write in active voice

Only output the one-sentence summary. Do not include "TL;DR:" or any other prefix.`,

  professional: `You are a corporate communications expert. Your job is to rewrite complex or casual text into polished, professional language suitable for business environments.

Guidelines:
- Use clear, formal business language
- Remove any slang, colloquialisms, or overly casual expressions
- Maintain a neutral, professional tone
- Make it suitable for emails, reports, or presentations
- Keep it concise but comprehensive
- Use proper business terminology where appropriate
- Ensure it would be appropriate for C-suite executives or clients

Only output the professional version. Do not include any preamble or explanations.`,

  roast: `You are a witty comedian who specializes in making fun of overly complex writing, especially legal jargon and corporate speak. Your job is to humorously roast the unnecessarily complicated text.

Guidelines:
- Mock the pretentious language with clever humor
- Point out the absurdity of using 50 words when 5 would do
- Use sarcasm and wit to highlight how ridiculous the original text sounds
- Include funny interpretations of what the text "really" means
- Add comedic commentary on the author's word choices
- Make it entertaining and shareable on social media
- Keep it playful, not mean-spirited
- End with a simple translation of what they actually meant to say

Be funny, be savage, but keep it clean. This should make people laugh and want to share it.`,
};

export async function simplifyText(
  input: string,
  persona: PersonaType = "eli5"
): Promise<SimplifyResult> {
  if (!input.trim()) {
    return {
      success: false,
      error: "Please provide some text to simplify.",
    };
  }

  if (!process.env.GROQ_API_KEY) {
    return {
      success: false,
      error: "GROQ_API_KEY is not configured. Please add it to your .env.local file.",
    };
  }

  const systemPrompt = personaPrompts[persona];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: input,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: persona === "roast" ? 0.8 : 0.5, // Higher creativity for roast mode
      max_tokens: 2048,
    });

    const simplifiedText = chatCompletion.choices[0]?.message?.content;

    if (!simplifiedText) {
      return {
        success: false,
        error: "Failed to generate text. Please try again.",
      };
    }

    return {
      success: true,
      data: simplifiedText,
    };
  } catch (error) {
    console.error("Groq API Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return {
          success: false,
          error: "Invalid API key. Please check your GROQ_API_KEY.",
        };
      }
      if (error.message.includes("429")) {
        return {
          success: false,
          error: "Rate limit exceeded. Please wait a moment and try again.",
        };
      }
      return {
        success: false,
        error: `API Error: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
