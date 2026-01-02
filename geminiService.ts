
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { GroundingLink, TeamStats } from "./types";

export const analyzeMatch = async (matchQuery: string): Promise<{ text: string, links: GroundingLink[], stats: TeamStats[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `
    You are an expert football analyst. 
    Analyze the requested match and provide:
    1. A detailed analysis in markdown format.
    2. Current season statistics for both teams involved (Win, Draw, Loss records).
    3. Recent form (last 5 matches) as a list of 'W', 'D', or 'L'.
    
    You MUST return the response in the specified JSON format.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a full analysis and current season stats for: ${matchQuery}. Include win/draw/loss counts for their respective leagues.`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { 
              type: Type.STRING,
              description: "The detailed match analysis in markdown format."
            },
            stats: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Full name of the team" },
                  win: { type: Type.INTEGER },
                  draw: { type: Type.INTEGER },
                  loss: { type: Type.INTEGER },
                  form: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Last 5 matches: W, D, or L"
                  }
                },
                required: ["name", "win", "draw", "loss", "form"]
              }
            }
          },
          required: ["analysis", "stats"]
        }
      },
    });

    const result = JSON.parse(response.text || "{}");
    const links: GroundingLink[] = [];

    // Extract links from grounding metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          links.push({
            uri: chunk.web.uri,
            title: chunk.web.title
          });
        }
      });
    }

    return { 
      text: result.analysis || "No analysis available.", 
      links, 
      stats: result.stats || [] 
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to generate football prediction. Please check your connection or try a different match.");
  }
};
