import fetchMock from 'jest-fetch-mock';
import { ReliableLLMClient, ReliableLLMError, LLMErrorType } from '../src/shared/reliableLLMClient';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=test-api-key';

// Mock AbortSignal.timeout for jsdom (not fully supported)
const originalAbortSignalTimeout = AbortSignal.timeout;
beforeAll(() => {
  (AbortSignal as any).timeout = jest.fn(() => new AbortController().signal);
});
afterAll(() => {
  (AbortSignal as any).timeout = originalAbortSignalTimeout;
});

describe('ReliableLLMClient (raw fetch)', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();

    (global as any).chrome = {
      storage: {
        session: {
          get: jest.fn((keys, callback) => callback({ apiKey: 'test-api-key' })),
        },
        local: {
          get: jest.fn((keys, callback) => callback({})),
          set: jest.fn((data, callback) => callback()),
        },
      },
      runtime: { lastError: undefined },
    };
  });

  describe('execute() — payload shape', () => {
    it('sends correct REST payload with systemInstruction and contents', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({
        candidates: [{ content: { parts: [{ text: 'Improved prompt' }] } }],
      }));

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash' });
      await client.execute('Make this better', { systemInstruction: 'You are a prompt engineer.' });

      expect(fetchMock).toHaveBeenCalledWith(GEMINI_URL, expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));

      const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
      expect(body).toEqual({
        contents: [{ parts: [{ text: 'Make this better' }] }],
        systemInstruction: { parts: [{ text: 'You are a prompt engineer.' }] },
      });
    });

    it('works without systemInstruction', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({
        candidates: [{ content: { parts: [{ text: 'Result' }] } }],
      }));

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash' });
      await client.execute('Hello');

      const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
      expect(body.systemInstruction).toBeUndefined();
      expect(body.contents).toEqual([{ parts: [{ text: 'Hello' }] }]);
    });
  });

  describe('execute() — HTTP status normalization', () => {
    it('normalizes 400 to AUTHENTICATION error', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: { message: 'Bad request', status: 'INVALID_ARGUMENT' } }), { status: 400 });

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash' });
      try {
        await client.execute('test');
        fail('Expected to throw');
      } catch (e: any) {
        expect(e.type).toBe(LLMErrorType.AUTHENTICATION);
      }
    });

    it('normalizes 401 to AUTHENTICATION error', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: { message: 'API key invalid', status: 'UNAUTHENTICATED' } }), { status: 401 });

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash' });
      try {
        await client.execute('test');
        fail('Expected to throw');
      } catch (e: any) {
        expect(e.type).toBe(LLMErrorType.AUTHENTICATION);
      }
    });

    it('normalizes 403 to AUTHENTICATION error', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: { message: 'Forbidden' } }), { status: 403 });

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash' });
      try {
        await client.execute('test');
        fail('Expected to throw');
      } catch (e: any) {
        expect(e.type).toBe(LLMErrorType.AUTHENTICATION);
      }
    });

    it('normalizes 429 to RATE_LIMIT error', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: { message: 'Rate limited' } }), { status: 429 });

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash', maxRetries: 0 });
      try {
        await client.execute('test');
        fail('Expected to throw');
      } catch (e: any) {
        expect(e.type).toBe(LLMErrorType.RATE_LIMIT);
      }
    });

    it('normalizes 500 to NETWORK error', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: { message: 'Internal error' } }), { status: 500 });

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash', maxRetries: 0 });
      try {
        await client.execute('test');
        fail('Expected to throw');
      } catch (e: any) {
        expect(e.type).toBe(LLMErrorType.NETWORK);
      }
    });

    it('normalizes 502 to NETWORK error', async () => {
      fetchMock.mockResponseOnce('', { status: 502 });

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash', maxRetries: 0 });
      try {
        await client.execute('test');
        fail('Expected to throw');
      } catch (e: any) {
        expect(e.type).toBe(LLMErrorType.NETWORK);
      }
    });

    it('normalizes unknown status to UNKNOWN error', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: { message: 'Weird' } }), { status: 418 });

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash' });
      try {
        await client.execute('test');
        fail('Expected to throw');
      } catch (e: any) {
        expect(e.type).toBe(LLMErrorType.UNKNOWN);
      }
    });
  });

  describe('execute() — retry logic', () => {
    it('retries once on NETWORK error then succeeds', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify({ error: { message: 'Server error' } }), { status: 500 })
        .mockResponseOnce(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Retry worked' }] } }] }));

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash', maxRetries: 1 });
      const result = await client.execute('test');

      expect(result.text).toBe('Retry worked');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does NOT retry on AUTHENTICATION error', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: { message: 'Bad key' } }), { status: 401 });

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash', maxRetries: 1 });
      await expect(client.execute('test')).rejects.toThrow();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws last error after max retries exhausted', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify({ error: { message: 'Error' } }), { status: 500 })
        .mockResponseOnce(JSON.stringify({ error: { message: 'Error again' } }), { status: 500 });

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash', maxRetries: 1 });
      try {
        await client.execute('test');
        fail('Expected to throw');
      } catch (e: any) {
        expect(e.type).toBe(LLMErrorType.NETWORK);
        expect(e.message).toBe('Error again');
      }
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('execute() — abort signal', () => {
    it('throws immediately when signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();

      const client = new ReliableLLMClient({
        provider: 'google',
        model: 'gemini-2.0-flash',
        signal: controller.signal,
      });

      await expect(client.execute('test')).rejects.toThrow('Request cancelled');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('cancels fetch when AbortSignal.timeout fires', async () => {
      const originalTimeout = (AbortSignal as any).timeout;
      (AbortSignal as any).timeout = jest.fn((ms: number) => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 50);
        return controller.signal;
      });

      const originalFetch = globalThis.fetch;
      (globalThis.fetch as any) = jest.fn((_url: string, options: any) => {
        return new Promise((_, reject) => {
          const signal = options?.signal;
          if (signal) {
            signal.addEventListener('abort', () => {
              const err = new DOMException('The operation was aborted.', 'AbortError');
              reject(err);
            }, { once: true });
          }
        });
      });

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash', maxRetries: 0 });
      const result = client.execute('test');
      await expect(result).rejects.toThrow();

      (globalThis.fetch as any) = originalFetch;
      (AbortSignal as any).timeout = originalTimeout;
    }, 10000);
  });

  describe('execute() — response parsing', () => {
    it('extracts text from candidates response', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({
        candidates: [{ content: { parts: [{ text: 'Hello world' }] } }],
      }));

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash' });
      const result = await client.execute('test');

      expect(result.text).toBe('Hello world');
      expect(result.usage.inputTokens).toBeDefined();
      expect(result.usage.outputTokens).toBeDefined();
    });

    it('throws on empty response', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ candidates: [] }));

      const client = new ReliableLLMClient({ provider: 'google', model: 'gemini-2.0-flash' });
      await expect(client.execute('test')).rejects.toThrow('Empty response');
    });
  });
});
