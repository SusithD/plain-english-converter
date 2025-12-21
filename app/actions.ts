"use server";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface SimplifyResult {
  success: boolean;
  data?: string;
  error?: string;
}

export async function simplifyText(input: string): Promise<SimplifyResult> {
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

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a plain language expert. Your job is to translate complex text into simple, clear language that a 5th-grade student (age 10-11) could easily understand.

Guidelines:
- Use short sentences and common words
- Avoid jargon, technical terms, and complex vocabulary
- Break down complicated ideas into simple concepts
- Use examples when helpful
- Maintain the original meaning and key information
- Keep the same general structure when possible
- If there are acronyms, explain them briefly

Only output the simplified text. Do not include any preamble, explanations about what you did, or meta-commentary.`,
        },
        {
          role: "user",
          content: input,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 2048,
    });

    const simplifiedText = chatCompletion.choices[0]?.message?.content;

    if (!simplifiedText) {
      return {
        success: false,
        error: "Failed to generate simplified text. Please try again.",
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
