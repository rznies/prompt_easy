import { PromptEasyEngine } from '../src/improveEngine';
import { ApiKeyManager } from '../src/shared/apiKeyManager';
import * as llmClient from '../src/shared/llmClient';

jest.mock('../src/shared/apiKeyManager');

describe('Phase 1d: Error Handling (Issue #5)', () => {
  let engine: PromptEasyEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new PromptEasyEngine();
    (ApiKeyManager.getKey as jest.Mock).mockResolvedValue('valid-key');
  });

  it('should normalize Invalid API key error', async () => {
    jest.spyOn(llmClient, 'callLLM').mockRejectedValue(new Error('API key not valid. Please pass a valid API key. [403]'));

    await expect(engine.improve('test prompt')).rejects.toThrow('API key invalid. Please check and re-enter.');
  });

  it('should normalize Rate limited error', async () => {
    jest.spyOn(llmClient, 'callLLM').mockRejectedValue(new Error('429 Too Many Requests'));

    await expect(engine.improve('test prompt')).rejects.toThrow('Rate limited. Wait a moment and try again.');
  });

  it('should normalize Quota exceeded error', async () => {
    jest.spyOn(llmClient, 'callLLM').mockRejectedValue(new Error('Quota exceeded for this month.'));

    await expect(engine.improve('test prompt')).rejects.toThrow('Quota exceeded. Add your own key or try another model.');
  });

  it('should normalize Network error', async () => {
    jest.spyOn(llmClient, 'callLLM').mockRejectedValue(new Error('fetch failed'));

    await expect(engine.improve('test prompt')).rejects.toThrow('Network error. Check connection.');
  });

  it('should throw Session lost error from ApiKeyManager directly', async () => {
    (ApiKeyManager.getKey as jest.Mock).mockRejectedValue(new Error('Session key lost. Please re-enter your API key.'));

    await expect(engine.improve('test prompt')).rejects.toThrow('Session expired. Please re-enter your API key.');
  });

  it('should prevent input too long', async () => {
    const longPrompt = 'a'.repeat(5000); // Exceeds 500 tokens (approx 2000 chars)

    await expect(engine.improve(longPrompt)).rejects.toThrow('Input exceeds 500 tokens');
  });

  it('should handle unsupported provider/model safely without leaking keys', async () => {
    jest.spyOn(llmClient, 'callLLM').mockRejectedValue(new Error('Model gemini-fake not found'));

    // If it's an unrecognized error, don't leak raw details to the UI if they contain keys
    // The requirement says "Unsupported provider/model produces a clear developer-facing error"
    // And "Raw provider errors and API keys are not leaked into UI messages"
    await expect(engine.improve('test prompt')).rejects.toThrow(/Failed to improve prompt:|Unsupported/);
  });
});