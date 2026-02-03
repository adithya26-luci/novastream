
import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIRecommendations = async (likedSongs: Song[]): Promise<string[]> => {
  if (likedSongs.length === 0) return ["Lofi hip hop", "Electronic ambient", "Nu jazz"];

  const songTitles = likedSongs.map(s => `${s.title} by ${s.artist}`).join(", ");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on these songs I like: [${songTitles}], suggest 5 specific niche music genres or artists I might enjoy. Return only a comma-separated list.`,
  });

  const text = response.text || "";
  return text.split(',').map(s => s.trim());
};

export const getSmartPlaylistInfo = async (mood: string): Promise<{ name: string; description: string }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a creative playlist name and a short description for someone feeling ${mood}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name", "description"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch {
    return { name: `${mood} Vibes`, description: `A custom selection for your ${mood} mood.` };
  }
};
