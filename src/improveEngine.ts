/**
 * Core Improve Engine for Prompt Easy
 * 
 * Transforms vague prompts into structured, effective prompts using LLM.
 * Issue #2: Phase 1a - LLM Interface Setup
 */

import { ApiKeyManager } from './shared/apiKeyManager';
import { callLLM, LLMOptions } from './shared/llmClient';

export interface ImproveOptions {
  maxTokens?: number;
  temperature?: number;
  context?: string;
}

export interface ImproveEngineConfig {
  apiKey?: string;
  provider?: 'google' | 'openai';
  model?: string;
}

export class PromptEasyEngine {
  private apiKey?: string;
  private provider: 'google' | 'openai';
  private model: string;
  private readonly DEFAULT_MODEL = 'gemini-2.0-flash';
  private readonly FALLBACK_MODEL = 'gemini-1.5-flash';
  private readonly MAX_INPUT_TOKENS = 500;

  constructor(config: ImproveEngineConfig = {}) {
    this.apiKey = config.apiKey;
    this.provider = config.provider || 'google';
    this.model = config.model || this.DEFAULT_MODEL;
  }

  /**
   * Improves a vague prompt into a structured, effective prompt.
   * 
   * Transforms user input into a prompt with clear ROLE, TASK, OUTPUT FORMAT,
   * CONSTRAINTS, and optional CONTEXT. Preserves input language.
   * 
   * @param prompt - The vague input prompt
   * @param options - Optional configuration for the improvement
   * @returns A promise that resolves to the improved prompt (plain text, no wrapper)
   * @throws Error if prompt is empty, too long, or LLM call fails
   */
  async improve(prompt: string, options?: ImproveOptions): Promise<string> {
    // Validate input
    this.validatePrompt(prompt);

    // Build system prompt that instructs the model to improve the prompt
    const systemPrompt = this.buildSystemPrompt(options?.context);

    // Resolve API key
    let resolvedKey = this.apiKey;
    if (!resolvedKey) {
      try {
        resolvedKey = await ApiKeyManager.getKey();
      } catch (error: any) {
        if (error.message.includes('Session key lost')) {
          throw new Error('Session expired. Please re-enter your API key.');
        }
        throw new Error(`Authentication failed: ${error.message}`);
      }
    }

    // Call LLM with model-agnostic interface and retry logic
    let attempts = 0;
    const maxRetries = 2;
    
    while (attempts <= maxRetries) {
      try {
        const improvedPrompt = await callLLM(systemPrompt + '\n\n' + prompt, {
          provider: this.provider,
          model: this.model,
          apiKey: resolvedKey,
        });

        // Return only the improved prompt text (no metadata wrapper)
        return improvedPrompt.trim();
      } catch (error: any) {
        const msg = error.message || String(error);
        
        const isRateLimit = msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('rate limit');
        const isNetworkError = msg.includes('fetch failed') || msg.includes('Network error') || msg.includes('ECONNREFUSED');
        
        if ((isRateLimit || isNetworkError) && attempts < maxRetries) {
          attempts++;
          // Exponential backoff: 1s, 2s
          const delay = Math.pow(2, attempts - 1) * 1000;
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }

        // Normalize error shape for UI callers
        if (msg.includes('403') || msg.includes('API key not valid') || msg.includes('invalid api key')) {
          throw new Error('API key invalid. Please check and re-enter.');
        }
        if (isRateLimit) {
          throw new Error('Rate limited. Wait a moment and try again.');
        }
        if (msg.includes('Quota exceeded') || msg.includes('quota') || msg.includes('402')) {
          throw new Error('Quota exceeded. Add your own key or try another model.');
        }
        if (isNetworkError) {
          throw new Error('Network error. Check connection.');
        }
        if (msg.includes('Unknown provider') || msg.includes('not found') || msg.includes('unsupported')) {
          throw new Error(`Unsupported provider/model configuration.`);
        }
        
        // Generic fallback - ensure we don't leak keys
        const safeMsg = msg.replace(resolvedKey, '***');
        throw new Error(`Failed to improve prompt: ${safeMsg}`);
      }
    }
    
    throw new Error('Failed to improve prompt: Max retries exceeded');
  }

  /**
   * Get fallback model (used if primary model fails)
   */
  private getFallbackModel(): string {
    return this.FALLBACK_MODEL;
  }

  /**
   * Validate prompt before sending to LLM
   */
  private validatePrompt(prompt: string): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    // Estimate tokens (rough: 1 token ≈ 4 characters)
    const estimatedTokens = Math.ceil(prompt.length / 4);
    if (estimatedTokens > this.MAX_INPUT_TOKENS) {
      throw new Error(
        `Input exceeds ${this.MAX_INPUT_TOKENS} tokens (estimated ${estimatedTokens} tokens). Shorten and try.`
      );
    }
  }

  /**
   * Build system prompt that instructs the model to improve the user's prompt
   * 
   * Preserves input language and returns structured prompt with ROLE, TASK,
   * OUTPUT FORMAT, CONSTRAINTS, and optional CONTEXT.
   */
  private buildSystemPrompt(userContext?: string): string {
    const contextSection = userContext
      ? `\nOPTIONAL CONTEXT: ${userContext}`
      : '';

    return `You are an expert prompt engineer. Your task is to improve the user's vague prompt into a structured, effective prompt that will yield much better AI responses.

INPUT FORMAT:
- User's raw prompt (may be vague, incomplete, or poorly structured)${contextSection}

OUTPUT FORMAT:
Improve the prompt by adding:
1. ROLE: Define a specific persona or expertise the AI should adopt
2. TASK: Clarify the exact deliverable or action
3. OUTPUT FORMAT: Specify format, length, tone
4. CONSTRAINTS: Specify any specific requirements or limitations
${userContext ? '5. CONTEXT: Inject the provided user context' : ''}

IMPORTANT:
- Do NOT translate the input. Preserve the original language.
- Return ONLY the improved prompt. No explanations, no prefixes, no markdown unless part of the output format.
- Target output around 200 tokens.`;
  }
}

/**
 * Global namespace for browser console testing
 * Entry point: window.promptEasy.improve(text, options?)
 * 
 * This allows developers to test the improve engine from the browser console
 * without needing to build the full UI.
 */
declare global {
  interface Window {
    promptEasy: {
      improve: (text: string, options?: ImproveOptions) => Promise<string>;
    };
  }
}

// Initialize global hook (in browser context)
if (typeof window !== 'undefined') {
  if (!window.promptEasy) {
    window.promptEasy = {
      improve: async (text: string, options?: ImproveOptions) => {
        const engine = new PromptEasyEngine({
          apiKey: 'test-key', // TODO: Get from storage in real implementation
          provider: 'google',
        });
        return engine.improve(text, options);
      },
    };
  }
}
