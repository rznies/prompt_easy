import { PromptEasyStorage } from '../src/shared/promptEasyStorage';

describe('PromptEasyStorage', () => {
  let storedData: Record<string, any>;

  beforeEach(() => {
    storedData = {};

    (global as any).chrome = {
      storage: {
        local: {
          get: jest.fn((keys, callback) => {
            const key = Array.isArray(keys) ? keys[0] : keys;
            callback({ [key]: storedData[key] });
          }),
          set: jest.fn((data, callback) => {
            Object.assign(storedData, data);
            callback();
          }),
        },
        session: {
          remove: jest.fn((keys, callback) => {
            if (typeof keys === 'string') {
              delete storedData[keys];
            }
            callback();
          }),
        },
      },
      runtime: {
        lastError: undefined,
      },
    };
  });

  it('reads and writes managed config through a typed method', async () => {
    const config = {
      apiKey: 'managed-key',
      model: 'gemini-2.0-flash',
      version: '1.0.0',
    };

    await PromptEasyStorage.setManagedConfig(config);
    await expect(PromptEasyStorage.getManagedConfig()).resolves.toEqual(config);
    expect(storedData.managedConfig).toEqual(config);
  });

  it('marks key fetch failure with the canonical key', async () => {
    await PromptEasyStorage.markKeyFetchFailed();

    expect(storedData.keyFetchFailed).toBe(true);
  });

  it('reads and writes the last key check timestamp', async () => {
    await PromptEasyStorage.setLastKeyCheck(12345);

    await expect(PromptEasyStorage.getLastKeyCheck()).resolves.toBe(12345);
    expect(storedData.lastKeyCheck).toBe(12345);
  });

  it('purges the legacy session key through one storage method', async () => {
    storedData.sessionApiKey = 'legacy-key';

    await PromptEasyStorage.purgeLegacySessionKey();

    expect(storedData.sessionApiKey).toBeUndefined();
    expect(chrome.storage.session.remove).toHaveBeenCalledWith('sessionApiKey', expect.any(Function));
  });

  it('reads and writes daily usage as a single domain shape', async () => {
    await PromptEasyStorage.setDailyUsage({ count: 2, date: '2026-05-15' });

    await expect(PromptEasyStorage.getDailyUsage()).resolves.toEqual({
      count: 2,
      date: '2026-05-15',
    });
    expect(storedData.dailyUsageCount).toBe(2);
    expect(storedData.usageDate).toBe('2026-05-15');
  });

  it('increments usage stats behind one interface', async () => {
    storedData.totalCalls = 1;
    storedData.estimatedTokensIn = 10;
    storedData.estimatedTokensOut = 20;

    await PromptEasyStorage.incrementUsageStats(5, 7);

    expect(storedData.totalCalls).toBe(2);
    expect(storedData.estimatedTokensIn).toBe(15);
    expect(storedData.estimatedTokensOut).toBe(27);
  });
});
