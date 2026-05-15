import { PromptEasyEngine } from '../src/improveEngine';
import { ReliableLLMClient } from '../src/shared/reliableLLMClient';
import { ConfigManager } from '../src/shared/configManager';
import { RateLimiter, RateLimitError } from '../src/shared/rateLimiter';
import { SettingsStore } from '../src/shared/settingsStore';

// Mock the ReliableLLMClient
jest.mock('../src/shared/reliableLLMClient', () => ({
  ReliableLLMClient: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      text: 'ROLE: Expert assistant\nTASK: Improve prompt\nOUTPUT FORMAT: Structured\nCONSTRAINTS: Concise',
      usage: { inputTokens: 10, outputTokens: 20 }
    })
  })),
  LLMErrorType: {
    AUTHENTICATION: 'AUTHENTICATION',
    RATE_LIMIT: 'RATE_LIMIT',
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
    NETWORK: 'NETWORK',
    UNSUPPORTED: 'UNSUPPORTED',
    UNKNOWN: 'UNKNOWN'
  }
}));

// Mock ConfigManager
jest.mock('../src/shared/configManager', () => ({
  ConfigManager: {
    getManagedConfig: jest.fn().mockResolvedValue({
      apiKey: 'test-api-key',
      model: 'gemini-2.0-flash',
      version: '1.0.0'
    }),
    ensureKey: jest.fn().mockResolvedValue('test-api-key'),
    resetForTest: jest.fn()
  }
}));

// Mock RateLimiter
jest.mock('../src/shared/rateLimiter', () => ({
  RateLimiter: {
    checkAndIncrement: jest.fn().mockResolvedValue(undefined)
  },
  RateLimitError: class RateLimitError extends Error {
    errorCode = 'RATE_LIMITED';
    constructor(message: string) {
      super(message);
      this.name = 'RateLimitError';
    }
  }
}));

// Mock SettingsStore for usage tracking
jest.mock('../src/shared/settingsStore', () => ({
  SettingsStore: {
    updateUsage: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('PromptEasyEngine', () => {
  let engine: PromptEasyEngine;
  const managedConfig = {
    apiKey: 'test-api-key',
    model: 'gemini-2.0-flash',
    version: '1.0.0'
  };

  beforeEach(() => {
    engine = new PromptEasyEngine({ provider: 'google' });
    jest.clearAllMocks();
    (ConfigManager.getManagedConfig as jest.Mock).mockResolvedValue(managedConfig);
    (ConfigManager.ensureKey as jest.Mock).mockResolvedValue(managedConfig.apiKey);
    (RateLimiter.checkAndIncrement as jest.Mock).mockResolvedValue(undefined);
  });

  describe('improve()', () => {
    it('improves a vague prompt using the reliable client', async () => {
      const vaguePrompt = 'Write a marketing plan';
      const improvedPrompt = await engine.improve(vaguePrompt);

      expect(typeof improvedPrompt).toBe('string');
      expect(improvedPrompt).toContain('ROLE');
      expect(ReliableLLMClient).toHaveBeenCalled();
      expect(SettingsStore.updateUsage).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    });

    it('uses the model from ConfigManager', async () => {
      await engine.improve('test');
      
      expect(ConfigManager.getManagedConfig).toHaveBeenCalled();
      expect(ReliableLLMClient).toHaveBeenCalledWith(expect.objectContaining({
        apiKey: 'test-api-key',
        model: 'gemini-2.0-flash'
      }));
    });

    it('injects context into the system prompt', async () => {
      const vaguePrompt = 'Write code';
      const context = 'I am building a SaaS';
      await engine.improve(vaguePrompt, { context });

      const clientInstance = (ReliableLLMClient as jest.Mock).mock.results[0].value;
      const executeCall = clientInstance.execute.mock.calls[0];
      
      expect(executeCall[0]).toBe(vaguePrompt);
      expect(executeCall[1]).toEqual(expect.objectContaining({
        systemInstruction: expect.stringContaining(context),
      }));
    });

    it('passes cancellation through to the LLM adapter', async () => {
      const signal = new AbortController().signal;

      await engine.improve('test prompt', { signal });

      expect(ReliableLLMClient).toHaveBeenCalledWith(expect.objectContaining({
        signal,
      }));
    });

    it('checks the free tier rate limit before LLM execution', async () => {
      await engine.improve('test prompt');

      expect(RateLimiter.checkAndIncrement).toHaveBeenCalledTimes(1);
      expect(ReliableLLMClient).toHaveBeenCalledTimes(1);
    });

    it('does not call the LLM when the free tier rate limit rejects', async () => {
      (RateLimiter.checkAndIncrement as jest.Mock).mockRejectedValueOnce(
        new RateLimitError('Daily improve limit reached')
      );

      await expect(engine.improve('test prompt')).rejects.toThrow('Daily improve limit reached');
      expect(ReliableLLMClient).not.toHaveBeenCalled();
    });

    it('heals a missing managed config before LLM execution', async () => {
      (ConfigManager.getManagedConfig as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          apiKey: 'healed-key',
          model: 'gemini-2.0-flash',
          version: '1.0.1'
        });
      (ConfigManager.ensureKey as jest.Mock).mockResolvedValueOnce('healed-key');

      await engine.improve('test prompt');

      expect(ConfigManager.ensureKey).toHaveBeenCalledTimes(1);
      expect(ReliableLLMClient).toHaveBeenCalledWith(expect.objectContaining({
        apiKey: 'healed-key',
        model: 'gemini-2.0-flash',
      }));
    });

    it('throws KEY_NOT_READY when transparent key healing fails', async () => {
      (ConfigManager.getManagedConfig as jest.Mock).mockResolvedValueOnce(null);
      (ConfigManager.ensureKey as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));

      try {
        await engine.improve('test prompt');
        fail('Expected key readiness error');
      } catch (error: any) {
        expect(error.message).toBe('API key not ready: Network timeout');
        expect(error.errorCode).toBe('KEY_NOT_READY');
      }

      expect(ReliableLLMClient).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('throws error for empty prompt', async () => {
      await expect(engine.improve('')).rejects.toThrow('Prompt cannot be empty');
    });

    it('throws error for prompt that is too long', async () => {
      const longPrompt = 'a'.repeat(3000); // ~750 tokens
      await expect(engine.improve(longPrompt)).rejects.toThrow(/too long/i);
    });
  });
});
