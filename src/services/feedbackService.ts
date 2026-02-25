import { GoogleGenAI, Type } from "@google/genai";
import { InterviewFeedback } from "../types";

export async function generateInterviewFeedback(role: string, transcript: string): Promise<InterviewFeedback> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following interview transcript for a ${role} position and provide a detailed feedback report.
    
    Transcript:
    ${transcript}
    
    Provide the feedback in JSON format with the following structure:
    {
      "score": number (0-100),
      "technicalAccuracy": "string summary",
      "communicationClarity": "string summary",
      "emotionalIntelligence": "string summary",
      "suggestions": ["suggestion 1", "suggestion 2", ...]
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          technicalAccuracy: { type: Type.STRING },
          communicationClarity: { type: Type.STRING },
          emotionalIntelligence: { type: Type.STRING },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["score", "technicalAccuracy", "communicationClarity", "emotionalIntelligence", "suggestions"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse feedback:", e);
    throw new Error("Failed to generate feedback report.");
  }
}
