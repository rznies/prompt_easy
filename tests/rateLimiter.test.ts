import { RateLimiter } from '../src/shared/rateLimiter';

describe('RateLimiter', () => {
  let storedData: Record<string, any> = {};

  beforeEach(() => {
    storedData = {};
    (global as any).chrome = {
      storage: {
        local: {
          get: jest.fn((keys, callback) => {
            const result: Record<string, any> = {};
            const keysToFetch = Array.isArray(keys) ? keys : [keys];
            for (const key of keysToFetch) {
              result[key] = storedData[key];
            }
            callback(result);
          }),
          set: jest.fn((data, callback) => {
            Object.assign(storedData, data);
            callback();
          }),
        },
      },
      runtime: {
        lastError: undefined,
      },
    };
  });

  describe('checkAndIncrement()', () => {
    it('allows first improve call and increments counter', async () => {
      await RateLimiter.checkAndIncrement();
      expect(storedData.dailyUsageCount).toBe(1);
    });

    it('allows up to 3 improves per day', async () => {
      await RateLimiter.checkAndIncrement();
      await RateLimiter.checkAndIncrement();
      await RateLimiter.checkAndIncrement();
      expect(storedData.dailyUsageCount).toBe(3);
    });

    it('rejects on 4th call with RATE_LIMITED error', async () => {
      await RateLimiter.checkAndIncrement();
      await RateLimiter.checkAndIncrement();
      await RateLimiter.checkAndIncrement();
      
      await expect(RateLimiter.checkAndIncrement()).rejects.toEqual(
        expect.objectContaining({ errorCode: 'RATE_LIMITED' })
      );
    });

    it('resets counter when date rolls over', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      storedData.usageDate = yesterday.toISOString().split('T')[0];
      storedData.dailyUsageCount = 3;

      await RateLimiter.checkAndIncrement();
      
      expect(storedData.dailyUsageCount).toBe(1);
      expect(storedData.usageDate).toBe(new Date().toISOString().split('T')[0]);
    });

    it('persists usageDate as ISO date string', async () => {
      await RateLimiter.checkAndIncrement();
      const today = new Date().toISOString().split('T')[0];
      expect(storedData.usageDate).toBe(today);
    });
  });
});
