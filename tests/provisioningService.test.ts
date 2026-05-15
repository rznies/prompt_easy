import fetchMock from 'jest-fetch-mock';
import { ProvisioningService } from '../src/background/provisioningService';
import { ConfigManager } from '../src/shared/configManager';

describe('ProvisioningService', () => {
  let storedData: Record<string, any> = {};
  let alarmsCreated: any[] = [];
  let lastError: any;

  beforeEach(() => {
    fetchMock.resetMocks();
    ConfigManager.resetForTest();
    ProvisioningService.resetForTest();
    storedData = {};
    alarmsCreated = [];
    lastError = undefined;

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
          remove: jest.fn((keys, callback) => {
            if (typeof keys === 'string') {
              delete storedData[keys];
            } else {
              keys.forEach((k: string) => delete storedData[k]);
            }
            callback();
          }),
        },
        session: {
          get: jest.fn((keys, callback) => {
            const key = Array.isArray(keys) ? keys[0] : keys;
            callback({ [key]: storedData[key] });
          }),
          set: jest.fn((data, callback) => {
            Object.assign(storedData, data);
            callback();
          }),
          remove: jest.fn((keys, callback) => {
            if (typeof keys === 'string') {
              delete storedData[keys];
            } else {
              keys.forEach((k: string) => delete storedData[k]);
            }
            callback();
          }),
        },
      },
      runtime: {
        lastError: undefined,
      },
      alarms: {
        create: jest.fn((name: string, details: any, callback?: () => void) => {
          alarmsCreated.push({ name, details });
          callback?.();
        }),
        clear: jest.fn((name: string, callback?: (wasCreated: boolean) => void) => {
          callback?.(true);
        }),
      },
    };
  });

  describe('handleInstalled()', () => {
    describe('reason: install', () => {
      it('fetches and caches config on install', async () => {
        const configResponse = {
          apiKey: 'install-key',
          model: 'gemini-2.0-flash',
          version: '1.0.0',
        };
        fetchMock.mockResponseOnce(JSON.stringify(configResponse));

        await ProvisioningService.handleInstalled({ reason: 'install' } as chrome.runtime.InstalledDetails);

        expect(storedData.managedConfig).toEqual(configResponse);
        expect(storedData.keyFetchFailed).toBeUndefined();
      });
    });

    describe('reason: update', () => {
      it('purges legacy session key then fetches config', async () => {
        storedData.sessionApiKey = 'legacy-key';
        const configResponse = {
          apiKey: 'update-key',
          model: 'gemini-2.0-flash',
          version: '1.0.0',
        };
        fetchMock.mockResponseOnce(JSON.stringify(configResponse));

        await ProvisioningService.handleInstalled({ reason: 'update' } as chrome.runtime.InstalledDetails);

        expect(storedData.sessionApiKey).toBeUndefined();
        expect(storedData.managedConfig).toEqual(configResponse);
      });
    });

    describe('other reasons', () => {
      it('does nothing for chrome_update', async () => {
        await ProvisioningService.handleInstalled({ reason: 'chrome_update' } as chrome.runtime.InstalledDetails);

        expect(fetchMock).not.toHaveBeenCalled();
        expect(storedData).toEqual({});
      });

      it('does nothing for shared_module_update', async () => {
        await ProvisioningService.handleInstalled({ reason: 'shared_module_update' } as chrome.runtime.InstalledDetails);

        expect(fetchMock).not.toHaveBeenCalled();
        expect(storedData).toEqual({});
      });
    });
  });

  describe('fetchWithRetry()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('retries 3 times with exponential backoff before succeeding', async () => {
      const configResponse = {
        apiKey: 'retry-success-key',
        model: 'gemini-2.0-flash',
        version: '1.0.0',
      };

      fetchMock
        .mockRejectOnce(new Error('First failure'))
        .mockRejectOnce(new Error('Second failure'))
        .mockResponseOnce(JSON.stringify(configResponse));

      const promise = ProvisioningService.handleInstalled({ reason: 'install' } as chrome.runtime.InstalledDetails);

      // Advance timers through retry delays: ~1s, ~2s
      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);

      await promise;

      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(storedData.managedConfig).toEqual(configResponse);
    });

    it('fails after 3 attempts and sets keyFetchFailed flag', async () => {
      fetchMock
        .mockRejectOnce(new Error('First failure'))
        .mockRejectOnce(new Error('Second failure'))
        .mockRejectOnce(new Error('Third failure'));

      const promise = ProvisioningService.handleInstalled({ reason: 'install' } as chrome.runtime.InstalledDetails);

      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);

      await promise;

      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(storedData.keyFetchFailed).toBe(true);
    });
  });

  describe('daily alarm scheduling', () => {
    it('schedules daily alarm after successful install fetch', async () => {
      const configResponse = {
        apiKey: 'alarm-key',
        model: 'gemini-2.0-flash',
        version: '1.0.0',
      };
      fetchMock.mockResponseOnce(JSON.stringify(configResponse));

      await ProvisioningService.handleInstalled({ reason: 'install' } as chrome.runtime.InstalledDetails);

      expect(alarmsCreated.length).toBe(1);
      expect(alarmsCreated[0].name).toBe('daily-key-refresh');
      expect(alarmsCreated[0].details.periodInMinutes).toBe(24 * 60);
      expect(storedData.lastKeyCheck).toBeDefined();
    });

    it('skips refresh when alarm fires within 24h of lastKeyCheck', async () => {
      storedData.lastKeyCheck = Date.now() - (12 * 60 * 60 * 1000); // 12 hours ago

      await ProvisioningService.handleAlarm({ name: 'daily-key-refresh' } as chrome.alarms.Alarm);

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('refreshes config when alarm fires after 24h', async () => {
      storedData.lastKeyCheck = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      const configResponse = {
        apiKey: 'refreshed-key',
        model: 'gemini-2.0-flash',
        version: '1.0.0',
      };
      fetchMock.mockResponseOnce(JSON.stringify(configResponse));

      await ProvisioningService.handleAlarm({ name: 'daily-key-refresh' } as chrome.alarms.Alarm);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(storedData.managedConfig).toEqual(configResponse);
    });

    it('ignores alarms with different names', async () => {
      await ProvisioningService.handleAlarm({ name: 'some-other-alarm' } as chrome.alarms.Alarm);

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('schedules alarm after successful update fetch', async () => {
      storedData.sessionApiKey = 'legacy-key';
      const configResponse = {
        apiKey: 'update-alarm-key',
        model: 'gemini-2.0-flash',
        version: '1.0.0',
      };
      fetchMock.mockResponseOnce(JSON.stringify(configResponse));

      await ProvisioningService.handleInstalled({ reason: 'update' } as chrome.runtime.InstalledDetails);

      expect(alarmsCreated.length).toBe(1);
      expect(alarmsCreated[0].name).toBe('daily-key-refresh');
    });

    it('does not schedule alarm when fetch fails', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      jest.useFakeTimers();
      const promise = ProvisioningService.handleInstalled({ reason: 'install' } as chrome.runtime.InstalledDetails);
      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);
      await promise;
      jest.useRealTimers();

      expect(alarmsCreated.length).toBe(0);
    });
  });
});
