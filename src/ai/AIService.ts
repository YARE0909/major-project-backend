import { AIProvider } from "./AIProvider";
import { GeminiAIProvider } from "./providers/GeminiAIProvider";
import { AIRoutePlan } from "./types/RoutePlan";

const provider = new GeminiAIProvider(process.env.GEMINI_API_KEY!);

class AIService {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async planRoutes(input: {
    source: string;
    destination: string;
    availableModes: string[];
  }): Promise<AIRoutePlan> {
    const { systemPrompt, userPrompt } = await import(
      "./prompts/routePlanning.prompt"
    );

    return this.provider.generate<AIRoutePlan>({
      systemPrompt,
      userPrompt: userPrompt(input),
    });
  }
}

export const aiService = new AIService(provider);
