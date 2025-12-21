"use server";

import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
  persona: PersonaType = "eli5",
  isActionMode: boolean = false,
  targetLang: string = "English"
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

  let systemPrompt = personaPrompts[persona];

  if (isActionMode) {
    systemPrompt += "\n\nCRITICAL ADDITION: After the simplification, you MUST also extract the core request and list 3 concrete steps the user needs to take to resolve it. Format this clearly as an 'ACTION PLAN' section at the end.";
  }

  if (targetLang && targetLang !== "English") {
    systemPrompt += `\n\nCRITICAL: Your entire output (the simplification and the action plan if requested) MUST be written in ${targetLang}.`;

    if (targetLang === "Sinhala") {
      systemPrompt += "\nSpecial instruction for Sinhala: Use natural, standard written Sinhala (සම්මත ලිඛිත සිංහල). Avoid using overly complex or robotic-sounding literal translations. Ensure the simplification remains simple and conversational in the local cultural context.";
    }
  }

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

export async function askQuestion(
  contextText: string,
  question: string
): Promise<SimplifyResult> {
  if (!contextText.trim() || !question.trim()) {
    return {
      success: false,
      error: "Context or question is missing.",
    };
  }

  if (!process.env.GROQ_API_KEY) {
    return {
      success: false,
      error: "GROQ_API_KEY is not configured.",
    };
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that explains complex documents. 
          Use the provided text as your ONLY source of truth. 
          Answer the user's question accurately, simply, and directly. 
          If the answer isn't in the text, say you don't know based on the document provided.
          
          Document Context:
          """
          ${contextText}
          """`,
        },
        {
          role: "user",
          content: question,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // Lower temperature for higher factual accuracy
      max_tokens: 1024,
    });

    const answer = chatCompletion.choices[0]?.message?.content;

    if (!answer) {
      return {
        success: false,
        error: "Failed to generate an answer.",
      };
    }

    return {
      success: true,
      data: answer,
    };
  } catch (error) {
    console.error("Groq Chat Error:", error);
    return {
      success: false,
      error: "An error occurred while answering your question.",
    };
  }
}

export async function analyzeImage(
  base64Data: string,
  mimeType: string,
  fileName: string,
  isActionMode: boolean = false,
  targetLang: string = "English"
): Promise<SimplifyResult> {
  if (!base64Data) {
    return {
      success: false,
      error: "No image data provided.",
    };
  }

  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: "GEMINI_API_KEY is not configured. Please add it to your .env.local file.",
    };
  }

  try {
    console.log(`Starting image analysis for file: ${fileName}, type: ${mimeType}`);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "Analyze this image. If it is text, extract it and explain it in simple 5th-grade English. If it is a diagram or error message, explain what it means clearly. Do not use complex jargon. Keep the explanation very simple and direct.";

    if (isActionMode) {
      prompt += " Additionally, extract the core request from this image and list 3 concrete steps I need to take to resolve it. Format this clearly as an 'ACTION PLAN' section at the end.";
    }

    if (targetLang && targetLang !== "English") {
      prompt += ` CRITICAL: Your entire response MUST be written in ${targetLang}.`;

      if (targetLang === "Sinhala") {
        prompt += " Special instruction for Sinhala: Use natural and standard written Sinhala (සම්මත ලිඛිත සිංහල). Ensure the explanation is culturally appropriate and easy for a native speaker to understand without being robotic.";
      }
    }

    console.log("Sending request to Gemini 1.5 Flash...");
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();
    console.log("Received response from Gemini.");

    if (!responseText) {
      return {
        success: false,
        error: "Failed to analyze image. Please try again.",
      };
    }

    return {
      success: true,
      data: responseText,
    };
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);

    let errorMessage = "An error occurred while analyzing the image.";

    if (error?.message?.includes("API_KEY_INVALID")) {
      errorMessage = "Invalid Gemini API key. Please check your .env file.";
    } else if (error?.message?.includes("User location is not supported")) {
      errorMessage = "Gemini API is not available in your region.";
    } else if (error?.message) {
      errorMessage = `Gemini Error: ${error.message}`;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function transcribeAudio(formData: FormData): Promise<SimplifyResult> {
  const file = formData.get("file") as File;
  if (!file) {
    return {
      success: false,
      error: "No audio file provided.",
    };
  }

  if (!process.env.GROQ_API_KEY) {
    return {
      success: false,
      error: "GROQ_API_KEY is not configured.",
    };
  }

  try {
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3",
      response_format: "json",
    });

    if (!transcription.text) {
      return {
        success: false,
        error: "No text detected in audio.",
      };
    }

    return {
      success: true,
      data: transcription.text,
    };
  } catch (error: any) {
    console.error("Transcription Error:", error);
    return {
      success: false,
      error: error.message || "Failed to transcribe audio. Please try again.",
    };
  }
}
