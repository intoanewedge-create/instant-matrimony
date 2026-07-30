import { AiProvider } from "./ai-provider";
import { RuleBasedAiProvider } from "./rule-based-ai-provider";
import { OpenAiProvider } from "./openai-provider";
import { GeminiProvider } from "./gemini-provider";

export class AiProviderRegistry {
  private providers = new Map<string, AiProvider>();
  private activeProviderName = "rulebased";

  constructor() {
    this.providers.set("rulebased", new RuleBasedAiProvider());
    this.providers.set("openai", new OpenAiProvider());
    this.providers.set("gemini", new GeminiProvider());
    
    // Choose active provider from env
    const envProvider = process.env.AI_PROVIDER || "rulebased";
    this.activeProviderName = envProvider.toLowerCase();
  }

  registerProvider(name: string, provider: AiProvider): void {
    this.providers.set(name.toLowerCase(), provider);
  }

  async getActiveProvider(): Promise<AiProvider> {
    const preferred = this.providers.get(this.activeProviderName);
    if (preferred) {
      const isHealthy = await preferred.health();
      if (isHealthy) {
        return preferred;
      }
    }

    // OpenAI Fallback Chain
    if (this.activeProviderName === "openai") {
      const gemini = this.providers.get("gemini");
      if (gemini && (await gemini.health())) {
        return gemini;
      }
    }

    // Default Fallback
    return this.providers.get("rulebased")!;
  }
}

export const aiProviderRegistry = new AiProviderRegistry();
