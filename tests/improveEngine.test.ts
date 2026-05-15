import { PromptEasyEngine } from '../src/improveEngine';
import { ReliableLLMClient } from '../src/shared/reliableLLMClient';
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

// Mock SettingsStore
jest.mock('../src/shared/settingsStore', () => ({
  SettingsStore: {
    getPreferredModel: jest.fn().mockResolvedValue('gemini-3-flash-preview'),
    updateUsage: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('PromptEasyEngine (Refactored)', () => {
  let engine: PromptEasyEngine;

  beforeEach(() => {
    engine = new PromptEasyEngine({
      provider: 'google',
      model: 'gemini-3-flash-preview',
    });
    jest.clearAllMocks();
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

    it('uses the preferred model from settings if none provided', async () => {
      const customEngine = new PromptEasyEngine();
      await customEngine.improve('test');
      
      expect(SettingsStore.getPreferredModel).toHaveBeenCalled();
      expect(ReliableLLMClient).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gemini-3-flash-preview'
      }));
    });

    it('injects context into the system prompt', async () => {
      const vaguePrompt = 'Write code';
      const context = 'I am building a SaaS';
      await engine.improve(vaguePrompt, { context });

      const clientInstance = (ReliableLLMClient as jest.Mock).mock.results[0].value;
      const executeCall = clientInstance.execute.mock.calls[0][0];
      
      expect(executeCall).toContain(context);
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
