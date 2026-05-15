import { PromptEasyEngine } from '../src/improveEngine';
import { ReliableLLMClient, LLMErrorType, ReliableLLMError } from '../src/shared/reliableLLMClient';
import { ConfigManager } from '../src/shared/configManager';
import { RateLimiter } from '../src/shared/rateLimiter';

// Mock ReliableLLMClient
jest.mock('../src/shared/reliableLLMClient', () => {
  return {
    ReliableLLMClient: jest.fn(),
    LLMErrorType: {
      AUTHENTICATION: 'AUTHENTICATION',
      RATE_LIMIT: 'RATE_LIMIT',
      QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
      NETWORK: 'NETWORK',
    },
    ReliableLLMError: class ReliableLLMError extends Error {
      constructor(public type: string, message: string) {
        super(message);
        this.name = 'ReliableLLMError';
      }
    }
  };
});

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

jest.mock('../src/shared/rateLimiter', () => ({
  RateLimiter: {
    checkAndIncrement: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('Error Handling (Refactored)', () => {
  let engine: PromptEasyEngine;
  let mockExecute: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (RateLimiter.checkAndIncrement as jest.Mock).mockResolvedValue(undefined);
    engine = new PromptEasyEngine();
    mockExecute = jest.fn();
    (ReliableLLMClient as jest.Mock).mockImplementation(() => ({
      execute: mockExecute
    }));
  });

  it('should propagate Authentication errors', async () => {
    mockExecute.mockRejectedValue(new ReliableLLMError(LLMErrorType.AUTHENTICATION, 'Invalid API key.'));
    await expect(engine.improve('test')).rejects.toThrow('Invalid API key.');
  });

  it('should propagate Rate Limit errors', async () => {
    mockExecute.mockRejectedValue(new ReliableLLMError(LLMErrorType.RATE_LIMIT, 'Rate limit exceeded.'));
    await expect(engine.improve('test')).rejects.toThrow('Rate limit exceeded.');
  });

  it('should propagate Quota exceeded errors', async () => {
    mockExecute.mockRejectedValue(new ReliableLLMError(LLMErrorType.QUOTA_EXCEEDED, 'Quota exceeded.'));
    await expect(engine.improve('test')).rejects.toThrow('Quota exceeded.');
  });

  it('should propagate Network errors', async () => {
    mockExecute.mockRejectedValue(new ReliableLLMError(LLMErrorType.NETWORK, 'Network connection failed.'));
    await expect(engine.improve('test')).rejects.toThrow('Network connection failed.');
  });

  it('should validate input length', async () => {
    const longPrompt = 'a'.repeat(3000); // ~750 tokens
    await expect(engine.improve(longPrompt)).rejects.toThrow(/too long/i);
  });
});
