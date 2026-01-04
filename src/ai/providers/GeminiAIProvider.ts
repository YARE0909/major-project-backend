import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "../AIProvider";

export class GeminiAIProvider implements AIProvider {
  private model;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);

    this.model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });
  }

  async generate<T>({
    systemPrompt,
    userPrompt,
  }: {
    systemPrompt: string;
    userPrompt: string;
  }): Promise<T> {
    const result = await this.model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\n${userPrompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();

    try {
      return JSON.parse(text) as T;
    } catch {
      console.error("Gemini raw output:", text);
      throw new Error("Gemini returned invalid JSON");
    }
  }
}
