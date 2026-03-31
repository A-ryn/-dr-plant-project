import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface PlantAnalysis {
  plantName: string;
  healthStatus: "Healthy" | "Warning" | "Critical";
  diseaseName?: string;
  careGuide: {
    soil: string;
    temperature: string;
    monsoon: string;
  };
  wateringFrequency: string;
  bestFertilizers: string[];
  idealClimate: string;
  remedies: string[];
  userQuestionAnswer?: string;
  error?: string;
}

export async function analyzePlantImage(base64Image: string, mimeType: string, userMessage?: string): Promise<PlantAnalysis> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing. Please set GEMINI_API_KEY in your environment.");
  }
  const model = "gemini-3-flash-preview";
  
  const prompt = `Perform a comprehensive analysis of this plant image.
  1. IDENTIFICATION: Identify the plant species. If it's NOT a plant/leaf, return an error.
  2. HEALTH CHECK: Detect any diseases or pests.
  3. WATERING: Provide specific watering frequency (e.g., "Twice a week during summer").
  4. FERTILIZERS: Suggest the best organic fertilizers for this specific plant.
  5. CLIMATE & GROWTH: Describe the ideal climate and specific areas/conditions where it grows best (especially in Kerala context).
  6. CARE GUIDE: Details on soil (Laterite focus), temperature, and monsoon care.
  7. REMEDIES: If a disease is detected, provide organic remedies.
  ${userMessage ? `\n\nUSER QUESTION/CONTEXT: "${userMessage}"\nAnswer this specifically in the 'userQuestionAnswer' field.` : ""}
  
  Return the response in JSON format.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      error: {
        type: Type.STRING,
        description: "Error message if the image is not a plant.",
      },
      plantName: { type: Type.STRING },
      healthStatus: { 
        type: Type.STRING, 
        enum: ["Healthy", "Warning", "Critical"] 
      },
      diseaseName: { type: Type.STRING },
      careGuide: {
        type: Type.OBJECT,
        properties: {
          soil: { type: Type.STRING },
          temperature: { type: Type.STRING },
          monsoon: { type: Type.STRING },
        },
        required: ["soil", "temperature", "monsoon"],
      },
      wateringFrequency: { type: Type.STRING },
      bestFertilizers: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      idealClimate: { type: Type.STRING },
      remedies: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      userQuestionAnswer: {
        type: Type.STRING,
      },
    },
  };

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { data: base64Image.split(",")[1] || base64Image, mimeType } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema,
          maxOutputTokens: 2048, // Ensure enough space for detailed analysis
          systemInstruction: "You are a Kerala-specific Agri-Tech expert. You specialize in identifying local plants and diseases. You focus on organic remedies and Kerala's unique climate (Laterite soil, high humidity, monsoon seasons). If an image is not a plant, you must strictly return the error field. Keep your responses concise and strictly follow the JSON schema.",
        }
      });

      let text = result.text;
      if (!text) throw new Error("No response from AI");
      
      // Clean potential markdown or extra whitespace
      text = text.replace(/```json\n?|```/g, "").trim();
      
      try {
        return JSON.parse(text) as PlantAnalysis;
      } catch (parseError) {
        console.error("JSON Parse Error. Text snippet:", text.substring(0, 500) + "...");
        throw new Error("The AI response was malformed. Please try again.");
      }
    } catch (error: any) {
      const isRetryable = error?.message?.includes("503") || 
                          error?.message?.includes("429") || 
                          error?.message?.includes("high demand") ||
                          error?.message?.includes("UNAVAILABLE");

      if (isRetryable && retryCount < maxRetries) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.warn(`Gemini API busy (503/429). Retrying in ${delay}ms... (Attempt ${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      console.error("Analysis error:", error);
      throw error;
    }
  }
  throw new Error("Maximum retries exceeded for AI analysis.");
}
