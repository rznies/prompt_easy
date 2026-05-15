/**
 * Core Improve Engine for Prompt Easy
 * 
 * Transforms vague prompts into structured, effective prompts using LLM.
 * Issue #2: Phase 1a - LLM Interface Setup
 */

import { SettingsStore } from './shared/settingsStore';
import { ReliableLLMClient, LLMResult } from './shared/reliableLLMClient';

export interface ImproveOptions {
  context?: string;
}

export interface ImproveEngineConfig {
  provider?: 'google' | 'openai';
  model?: string;
}

export class PromptEasyEngine {
  private provider: 'google' | 'openai';
  private model?: string;
  private readonly MAX_INPUT_TOKENS = 500;

  constructor(config: ImproveEngineConfig = {}) {
    this.provider = config.provider || 'google';
    this.model = config.model;
  }

  /**
   * Improves a vague prompt into a structured, effective prompt.
   * 
   * @param prompt - The vague input prompt
   * @param options - Optional configuration (e.g., context cards)
   * @returns A promise that resolves to the improved prompt string
   */
  async improve(prompt: string, options?: ImproveOptions): Promise<string> {
    this.validatePrompt(prompt);

    // Resolve model from settings if not provided in constructor
    const activeModel = this.model || await SettingsStore.getPreferredModel();

    // Create a reliable client for execution
    const client = new ReliableLLMClient({
      provider: this.provider,
      model: activeModel
    });

    const systemPrompt = this.buildSystemPrompt(options?.context);
    const fullPrompt = `${systemPrompt}\n\nUSER PROMPT:\n${prompt}`;

    // Execute via Reliable Client
    const result: LLMResult = await client.execute(fullPrompt);

    // Persist usage stats (Domain logic)
    SettingsStore.updateUsage(result.usage.inputTokens, result.usage.outputTokens).catch(console.error);

    return result.text;
  }

  private validatePrompt(prompt: string): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    const estimatedTokens = Math.ceil(prompt.length / 4);
    if (estimatedTokens > this.MAX_INPUT_TOKENS) {
      throw new Error(
        `Input too long (estimated ${estimatedTokens} tokens). Max is ${this.MAX_INPUT_TOKENS}.`
      );
    }
  }

  private buildSystemPrompt(userContext?: string): string {
    const contextSection = userContext ? `\nOPTIONAL CONTEXT: ${userContext}` : '';

    return `You are an expert prompt engineer. Your task is to improve the user's vague prompt into a structured, effective prompt.

OUTPUT FORMAT:
Improve the prompt by adding:
1. ROLE: Define a specific persona or expertise the AI should adopt
2. TASK: Clarify the exact deliverable or action
3. OUTPUT FORMAT: Specify format, length, tone
4. CONSTRAINTS: Specify any specific requirements or limitations
${userContext ? '5. CONTEXT: Inject the provided user context' : ''}

IMPORTANT:
- Preserve the original language. Do NOT translate.
- Return ONLY the improved prompt text.
- Target output around 200 tokens.
${contextSection}`;
  }
}

