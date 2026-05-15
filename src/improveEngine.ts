/**
 * Core Improve Engine for Prompt Easy
 * 
 * Transforms vague prompts into structured, effective prompts using LLM.
 * Issue #2: Phase 1a - LLM Interface Setup
 */

import { ConfigManager } from './shared/configManager';
import { ImproveError, normalizeImproveError } from './shared/improveError';
import { RateLimiter } from './shared/rateLimiter';
import { SettingsStore } from './shared/settingsStore';
import { ReliableLLMClient, LLMResult } from './shared/reliableLLMClient';
import { renderImproveTemplate, type ContextCard } from './template';

export interface ImproveOptions {
  context?: string;
  contextCards?: ContextCard[];
  signal?: AbortSignal;
}

export interface ImproveEngineConfig {
  provider?: 'google' | 'openai';
}

export class PromptEasyEngine {
  private provider: 'google' | 'openai';
  private readonly MAX_INPUT_TOKENS = 500;

  constructor(config: ImproveEngineConfig = {}) {
    this.provider = config.provider || 'google';
  }

  /**
   * Improves a vague prompt into a structured, effective prompt.
   * 
   * @param prompt - The vague input prompt
   * @param options - Optional configuration (e.g., context cards)
   * @returns A promise that resolves to the improved prompt string
   */
  async improve(prompt: string, options?: ImproveOptions): Promise<string> {
    try {
      this.validatePrompt(prompt);
      await RateLimiter.checkAndIncrement();

      const managedConfig = await this.getReadyConfig();
      const activeModel = managedConfig.model || 'gemini-2.0-flash';

      const client = new ReliableLLMClient({
        provider: this.provider,
        model: activeModel,
        apiKey: managedConfig.apiKey,
        signal: options?.signal
      });

      const systemInstruction = renderImproveTemplate({
        context: options?.context,
        contextCards: options?.contextCards,
      });

      const result: LLMResult = await client.execute(prompt, { systemInstruction });

      SettingsStore.updateUsage(result.usage.inputTokens, result.usage.outputTokens).catch(console.error);

      return result.text;
    } catch (error) {
      throw normalizeImproveError(error);
    }
  }

  private validatePrompt(prompt: string): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new ImproveError('INPUT_EMPTY', 'Prompt cannot be empty');
    }

    const estimatedTokens = Math.ceil(prompt.length / 4);
    if (estimatedTokens > this.MAX_INPUT_TOKENS) {
      throw new ImproveError(
        'INPUT_TOO_LONG',
        `Input too long (estimated ${estimatedTokens} tokens). Max is ${this.MAX_INPUT_TOKENS}.`
      );
    }
  }

  private async getReadyConfig(): Promise<{ apiKey: string; model?: string }> {
    const config = await ConfigManager.getManagedConfig();
    if (config?.apiKey) {
      return config;
    }

    try {
      const apiKey = await ConfigManager.ensureKey();
      const healedConfig = await ConfigManager.getManagedConfig();
      return {
        apiKey,
        model: healedConfig?.model,
      };
    } catch (error: any) {
      throw new ImproveError('KEY_NOT_READY', `API key not ready: ${error.message}`);
    }
  }
}
