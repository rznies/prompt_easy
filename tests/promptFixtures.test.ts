import { PromptEasyEngine } from '../src/improveEngine';
import { ReliableLLMClient } from '../src/shared/reliableLLMClient';
import { ConfigManager } from '../src/shared/configManager';
import { RateLimiter } from '../src/shared/rateLimiter';
import { promptFixtures } from './fixtures/promptFixtures';

// Mock ReliableLLMClient
jest.mock('../src/shared/reliableLLMClient', () => ({
  ReliableLLMClient: jest.fn()
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

jest.mock('../src/shared/rateLimiter', () => ({
  RateLimiter: {
    checkAndIncrement: jest.fn().mockResolvedValue(undefined)
  }
}));

// Mock SettingsStore for usage tracking
jest.mock('../src/shared/settingsStore', () => ({
  SettingsStore: {
    updateUsage: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('Prompt Fixtures Validation', () => {
  let engine: PromptEasyEngine;
  let mockExecute: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (RateLimiter.checkAndIncrement as jest.Mock).mockResolvedValue(undefined);
    engine = new PromptEasyEngine();
    mockExecute = jest.fn().mockImplementation(async (fullPrompt: string) => ({
      text: `ROLE: Expert assistant\nTASK: Respond to fixture\nOUTPUT FORMAT: Clear and structured text\nCONSTRAINTS: Be concise`,
      usage: { inputTokens: 10, outputTokens: 20 }
    }));
    
    (ReliableLLMClient as jest.Mock).mockImplementation(() => ({
      execute: mockExecute
    }));
  });

  describe('Validation across 50+ representative prompt fixtures', () => {
    it('should successfully improve all 50+ fixtures', async () => {
      expect(promptFixtures.length).toBeGreaterThanOrEqual(50);

      for (const fixture of promptFixtures) {
        const improved = await engine.improve(fixture);
        
        expect(improved).toContain('ROLE:');
        expect(improved).toContain('TASK:');
      }
    });

    it('should verify input language preservation rule is in system prompt', async () => {
      await engine.improve('Bonjour le monde');
      const systemInstruction = mockExecute.mock.calls[0][1]?.systemInstruction;
      expect(systemInstruction).toContain('Preserve the original language');
    });

    it('should verify target length instruction is included', async () => {
      await engine.improve('Some short text');
      const systemInstruction = mockExecute.mock.calls[0][1]?.systemInstruction;
      expect(systemInstruction).toContain('Target output around 200 tokens');
    });
  });
});
