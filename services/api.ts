import { GoogleGenAI, Type } from "@google/genai";

// Initialize the API client
// Note: For Veo, we re-instantiate before call to ensure fresh key if changed via UI
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper: File to Base64 ---
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// --- Feature: Text to Image (Nano Banana Pro / gemini-3-pro-image-preview) ---
export const generateImage = async (
  prompt: string,
  size: '1K' | '2K' | '4K' = '1K'
): Promise<string> => {
  // Check/Force Key Selection for Pro Image Model
  if (size !== '1K') {
     // 2K/4K usually implies higher tier needs, treating same as Veo for safety if needed, 
     // but guide only explicitly mandates it for Veo. 
     // However, `gemini-3-pro-image-preview` is the model.
     if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
     }
  }

  // Create a fresh client to pick up potential key changes
  const ai = getClient(); 
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1", // Default square for design assets
        imageSize: size,
      },
    },
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("未能生成图片，请重试。");
};

// --- Feature: Image Editing (gemini-2.5-flash-image) ---
export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("未能编辑图片，请重试。");
};

// --- Feature: Image to Video (Veo / veo-3.1-fast-generate-preview) ---
export const generateVeoVideo = async (
  base64Image: string,
  mimeType: string,
  aspectRatio: '16:9' | '9:16',
  prompt?: string
): Promise<string> => {
  // Mandatory Key Check for Veo
  if ((window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
    }
  }

  const ai = getClient(); // Fresh client

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || "Animate this image naturally",
    image: {
      imageBytes: base64Image,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p', // fast-generate supports 720p
      aspectRatio: aspectRatio,
    }
  });

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("视频生成失败。");

  // Fetch the actual video blob
  const videoRes = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  if (!videoRes.ok) throw new Error("无法下载生成的视频。");
  
  const blob = await videoRes.blob();
  return URL.createObjectURL(blob);
};

// --- Feature: Inspiration Search (gemini-2.5-flash with Google Search) ---
export const getInspiration = async (query: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Please provide 3 creative graphic design or video concept ideas based on this topic: "${query}". 
    Format the output as a JSON array of objects with 'title' and 'content' fields. 
    Focus on visual style, color palettes, and composition.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ["title", "content"]
        }
      }
    },
  });

  const text = response.text || "[]";
  const ideas = JSON.parse(text);
  
  // Extract search grounding URLs if available
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const urls = groundingChunks
    .filter((c: any) => c.web?.uri)
    .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

  return { ideas, urls };
};
