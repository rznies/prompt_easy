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

export interface ExecuteOptions {
  systemInstruction?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text: string }>;
    };
  }>;
  error?: {
    message?: string;
    status?: string;
  };
}

export class ReliableLLMClient {
  private readonly maxRetries: number;

  constructor(private options: ClientOptions) {
    this.maxRetries = options.maxRetries ?? 1;
  }

  async execute(prompt: string, executeOptions?: ExecuteOptions): Promise<LLMResult> {
    let attempts = 0;
    let lastError: ReliableLLMError | null = null;
    const apiKey = await this.resolveApiKey();

    while (attempts <= this.maxRetries) {
      if (this.options.signal?.aborted) {
        throw new ReliableLLMError(LLMErrorType.UNKNOWN, 'Request cancelled by caller.');
      }

      try {
        const result = await this.callProvider(prompt, apiKey, executeOptions?.systemInstruction);
        return result;
      } catch (error: any) {
        if (this.options.signal?.aborted) {
          throw new ReliableLLMError(LLMErrorType.UNKNOWN, 'Request cancelled by caller.');
        }

        const normalizedError = this.normalizeError(error);
        lastError = normalizedError;

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

    throw lastError!;
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

  private async callProvider(prompt: string, apiKey: string, systemInstruction?: string): Promise<LLMResult> {
    if (this.options.provider !== 'google') {
      throw new ReliableLLMError(LLMErrorType.UNSUPPORTED, `Provider ${this.options.provider} not implemented.`);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.options.model}:generateContent?key=${apiKey}`;

    const timeoutSignal = AbortSignal.timeout(10_000);

    const body: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: timeoutSignal,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorBody = await response.json() as GeminiResponse;
        if (errorBody.error?.message) {
          errorMessage = errorBody.error.message;
        }
      } catch {
        // JSON parse failed, use status-based message
      }
      throw Object.assign(new Error(errorMessage), { status: response.status });
    }

    const data = await response.json() as GeminiResponse;

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    return {
      text: text.trim(),
      usage: {
        inputTokens: Math.ceil(prompt.length / 4),
        outputTokens: Math.ceil(text.length / 4),
      },
    };
  }

  private normalizeError(error: any): ReliableLLMError {
    const status: number | undefined = error.status;

    if (status) {
      if (status === 400 || status === 401 || status === 403) {
        return new ReliableLLMError(LLMErrorType.AUTHENTICATION, error.message || 'Authentication failed.');
      }
      if (status === 429) {
        return new ReliableLLMError(LLMErrorType.RATE_LIMIT, error.message || 'Rate limit exceeded.');
      }
      if (status === 500 || status === 502 || status === 503) {
        return new ReliableLLMError(LLMErrorType.NETWORK, error.message || 'Network connection failed.');
      }
      return new ReliableLLMError(LLMErrorType.UNKNOWN, error.message || `HTTP ${status}`);
    }

    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return new ReliableLLMError(LLMErrorType.NETWORK, 'Request timed out.');
    }

    const msg = error.message || String(error);

    if (msg.includes('fetch failed') || msg.includes('Network error') || msg.includes('ECONNREFUSED') || msg.includes('timed out')) {
      return new ReliableLLMError(LLMErrorType.NETWORK, 'Network connection failed.');
    }

    return new ReliableLLMError(LLMErrorType.UNKNOWN, msg);
  }
}
