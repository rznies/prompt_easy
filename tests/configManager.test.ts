import fetchMock from 'jest-fetch-mock';
import { ConfigManager } from '../src/shared/configManager';
import { CONFIG_ENDPOINT_URL } from '../src/shared/config';

describe('ConfigManager', () => {
  let storedData: Record<string, any> = {};

  beforeEach(() => {
    fetchMock.resetMocks();
    ConfigManager.resetForTest();
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
      },
      runtime: { lastError: undefined },
    };
  });

  describe('getManagedConfig()', () => {
    it('reads managed config from chrome.storage.local in a single read', async () => {
      storedData.managedConfig = {
        apiKey: 'test-key-123',
        model: 'gemini-2.0-flash',
        version: '1.0.0',
      };

      const result = await ConfigManager.getManagedConfig();

      expect(result).toEqual({
        apiKey: 'test-key-123',
        model: 'gemini-2.0-flash',
        version: '1.0.0',
      });
      expect(chrome.storage.local.get).toHaveBeenCalledWith(
        ['managedConfig'],
        expect.any(Function)
      );
    });

    it('returns null when no config is stored', async () => {
      const result = await ConfigManager.getManagedConfig();
      expect(result).toBeNull();
    });
  });

  describe('ensureKey()', () => {
    it('returns cached apiKey when config exists', async () => {
      storedData.managedConfig = {
        apiKey: 'cached-key',
        model: 'gemini-2.0-flash',
        version: '1.0.0',
      };

      const key = await ConfigManager.ensureKey();

      expect(key).toBe('cached-key');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('fetches from endpoint and caches result when config is missing', async () => {
      const configResponse = {
        apiKey: 'fetched-key',
        model: 'gemini-2.0-flash',
        version: '1.0.0',
      };
      fetchMock.mockResponseOnce(JSON.stringify(configResponse));

      const key = await ConfigManager.ensureKey();

      expect(key).toBe('fetched-key');
      expect(fetchMock).toHaveBeenCalledWith(CONFIG_ENDPOINT_URL);
      expect(storedData.managedConfig).toEqual(configResponse);
    });

    it('deduplicates concurrent fetches', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({
        apiKey: 'deduped-key',
        model: 'gemini-2.0-flash',
        version: '1.0.0',
      }));

      const [key1, key2] = await Promise.all([
        ConfigManager.ensureKey(),
        ConfigManager.ensureKey(),
      ]);

      expect(key1).toBe('deduped-key');
      expect(key2).toBe('deduped-key');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('stores keyFetchFailed flag and rejects on fetch failure', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      await expect(ConfigManager.ensureKey()).rejects.toThrow(
        'Failed to fetch API key configuration: Network error'
      );
      expect(storedData.keyFetchFailed).toBe(true);
    });

    it('rejects with descriptive error on HTTP error status', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ error: 'Server error' }), { status: 500 });

      await expect(ConfigManager.ensureKey()).rejects.toThrow(
        'Failed to fetch API key configuration: HTTP 500'
      );
      expect(storedData.keyFetchFailed).toBe(true);
    });

    it('allows retry after a failed fetch', async () => {
      fetchMock
        .mockRejectOnce(new Error('First failure'))
        .mockResponseOnce(JSON.stringify({
          apiKey: 'recovered-key',
          model: 'gemini-2.0-flash',
          version: '1.0.0',
        }));

      await expect(ConfigManager.ensureKey()).rejects.toThrow('First failure');
      expect(storedData.keyFetchFailed).toBe(true);

      storedData.keyFetchFailed = false;
      const key = await ConfigManager.ensureKey();
      expect(key).toBe('recovered-key');
    });
  });
});
