import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function generateSocialContent(prompt: string, platform: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `あなたはプロのソーシャルメディアマネージャーです。以下の入力に基づいて、${platform}向けの魅力的な投稿を作成してください： "${prompt}"。
      
      以下の内容を含めてください：
      1. 投稿の本文
      2. 5〜10個の関連ハッシュタグ
      3. この投稿に添えるAI画像生成用の詳細なプロンプト（英語で出力してください。画像生成AIは英語をより良く理解するためです）。
      
      必ず以下のJSON形式で返してください：
      {
        "copy": "本文の内容",
        "hashtags": ["タグ1", "タグ2"],
        "item_prompt": "英語の画像生成用プロンプト"
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function generateAssetImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1") {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
                aspectRatio: aspectRatio,
            },
        },
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Image Gen Error:", error);
      throw error;
    }
}
