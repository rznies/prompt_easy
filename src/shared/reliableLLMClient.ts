import { GoogleGenAI } from "@google/genai";
import { ApiKeyManager } from "./apiKeyManager";

export enum LLMErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  RATE_LIMIT = 'RATE_LIMIT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NETWORK = 'NETWORK',
  UNSUPPORTED = 'UNSUPPORTED',
  UNKNOWN = 'UNKNOWN'
}

export class ReliableLLMError extends Error {
  constructor(public type: LLMErrorType, message: string) {
    super(message);
    this.name = 'ReliableLLMError';
  }
}

export interface LLMResult {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ClientOptions {
  provider: 'google' | 'openai';
  model: string;
  maxRetries?: number;
  signal?: AbortSignal;
}

export class ReliableLLMClient {
  private readonly maxRetries: number;

  constructor(private options: ClientOptions) {
    this.maxRetries = options.maxRetries ?? 1;
  }

  async execute(prompt: string): Promise<LLMResult> {
    let attempts = 0;
    
    // Resolve credential inside the client (Option B)
    const apiKey = await this.resolveApiKey();

    while (attempts <= this.maxRetries) {
      if (this.options.signal?.aborted) {
        throw new ReliableLLMError(LLMErrorType.UNKNOWN, 'Request cancelled by caller.');
      }

      try {
        const result = await this.callProvider(prompt, apiKey);
        return result;
      } catch (error: any) {
        if (this.options.signal?.aborted) {
          throw new ReliableLLMError(LLMErrorType.UNKNOWN, 'Request cancelled by caller.');
        }

        const normalizedError = this.normalizeError(error);
        
        // Retry on network or rate limit errors
        const shouldRetry = (
          normalizedError.type === LLMErrorType.NETWORK || 
          normalizedError.type === LLMErrorType.RATE_LIMIT
        ) && attempts < this.maxRetries;

        if (shouldRetry) {
          attempts++;
          const delay = Math.pow(2, attempts - 1) * 1000;
          await new Promise((res) => {
            const timer = setTimeout(res, delay);
            this.options.signal?.addEventListener('abort', () => {
              clearTimeout(timer);
              res(undefined);
            }, { once: true });
          });
          continue;
        }

        throw normalizedError;
      }
    }

    throw new ReliableLLMError(LLMErrorType.UNKNOWN, 'Max retries exceeded');
  }

  private async resolveApiKey(): Promise<string> {
    try {
      return await ApiKeyManager.getKey();
    } catch (error: any) {
      if (error.message.includes('Session key lost') || error.message.includes('No API key stored')) {
        throw new ReliableLLMError(LLMErrorType.AUTHENTICATION, 'API key missing or session expired.');
      }
      throw new ReliableLLMError(LLMErrorType.AUTHENTICATION, `Auth failed: ${error.message}`);
    }
  }

  private async callProvider(prompt: string, apiKey: string): Promise<LLMResult> {
    if (this.options.provider === 'google') {
      const ai = new GoogleGenAI({ apiKey });

      const timeoutMs = 10_000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 15s')), timeoutMs);
      });

      const abortPromise = new Promise<never>((_, reject) => {
        this.options.signal?.addEventListener('abort', () => {
          reject(new ReliableLLMError(LLMErrorType.UNKNOWN, 'Request cancelled by caller.'));
        }, { once: true });
      });

      const response = await Promise.race([
        ai.models.generateContent({
          model: this.options.model,
          contents: prompt
        }),
        timeoutPromise,
        abortPromise
      ]);

      if (!response || !response.text) {
        throw new Error('Empty response from Gemini');
      }

      return {
        text: response.text.trim(),
        usage: {
          inputTokens: Math.ceil(prompt.length / 4),
          outputTokens: Math.ceil(response.text.length / 4)
        }
      };
    }

    throw new ReliableLLMError(LLMErrorType.UNSUPPORTED, `Provider ${this.options.provider} not implemented.`);
  }

  private normalizeError(error: any): ReliableLLMError {
    const msg = error.message || String(error);
    
    if (msg.includes('403') || msg.includes('API key not valid') || msg.includes('invalid api key')) {
      return new ReliableLLMError(LLMErrorType.AUTHENTICATION, 'Invalid API key.');
    }
    
    if (msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('rate limit')) {
      return new ReliableLLMError(LLMErrorType.RATE_LIMIT, 'Rate limit exceeded.');
    }
    
    if (msg.includes('Quota exceeded') || msg.includes('quota') || msg.includes('402')) {
      return new ReliableLLMError(LLMErrorType.QUOTA_EXCEEDED, 'Quota exceeded.');
    }
    
    if (msg.includes('fetch failed') || msg.includes('Network error') || msg.includes('ECONNREFUSED') || msg.includes('timed out')) {
      return new ReliableLLMError(LLMErrorType.NETWORK, 'Network connection failed.');
    }

    return new ReliableLLMError(LLMErrorType.UNKNOWN, msg);
  }
}
