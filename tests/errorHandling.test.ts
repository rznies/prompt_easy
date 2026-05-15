import { PromptEasyEngine } from '../src/improveEngine';
import { ReliableLLMClient, LLMErrorType, ReliableLLMError } from '../src/shared/reliableLLMClient';
import { SettingsStore } from '../src/shared/settingsStore';

// Mock ReliableLLMClient
jest.mock('../src/shared/reliableLLMClient', () => {
  const original = jest.requireActual('../src/shared/reliableLLMClient');
  return {
    ...original,
    ReliableLLMClient: jest.fn()
  };
});

// Mock SettingsStore
jest.mock('../src/shared/settingsStore', () => ({
  SettingsStore: {
    getPreferredModel: jest.fn().mockResolvedValue('gemini-3-flash-preview'),
    updateUsage: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('Error Handling (Refactored)', () => {
  let engine: PromptEasyEngine;
  let mockExecute: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
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
