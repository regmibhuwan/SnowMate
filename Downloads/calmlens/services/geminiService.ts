import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
// NOTE: process.env.API_KEY must be set in the build environment.
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelName = "gemini-2.5-flash";

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    anxietyLevel: {
      type: Type.INTEGER,
      description: "Rate the anxiety level from 0 to 10 based on the text.",
    },
    symptoms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of physical symptoms mentioned or implied (e.g., sweating, heart racing).",
    },
    thoughts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of negative thought patterns (e.g., spotlight effect, fear of judgment).",
    },
    triggers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "External or internal triggers for the anxiety.",
    },
    emotions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Emotional labels (e.g., embarrassment, fear, panic).",
    },
    normalPerspective: {
      type: Type.OBJECT,
      properties: {
        baselineBehavior: {
          type: Type.STRING,
          description: "What a typical person without social anxiety would do in this situation.",
        },
        alternativeInterpretation: {
          type: Type.STRING,
          description: "A more positive or neutral way to interpret the events.",
        },
        reactionDifference: {
          type: Type.STRING,
          description: "Brief explanation of how the user's reaction differs from the baseline.",
        },
        supportiveMessage: {
          type: Type.STRING,
          description: "A short, kind, non-judgmental message of encouragement.",
        },
      },
      required: ["baselineBehavior", "alternativeInterpretation", "reactionDifference", "supportiveMessage"],
    },
  },
  required: ["anxietyLevel", "symptoms", "thoughts", "triggers", "emotions", "normalPerspective"],
};

export const analyzeSituation = async (description: string, selfRating: number): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Analyze the following social anxiety situation log.
      User's self-rated anxiety: ${selfRating}/10.
      Situation Description: "${description}"
      
      Provide a structured analysis including extraction of symptoms, thoughts, and a "Normal Person Response" comparison to help the user reframe the event.
      Be empathetic, professional, and grounded in CBT principles.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are CalmLens, a helpful and empathetic AI assistant helping users manage social anxiety through CBT-inspired journaling.",
        temperature: 0.4, // Lower temperature for consistent structured extraction
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No text returned from Gemini");
    }

    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback for error handling in UI
    throw error;
  }
};