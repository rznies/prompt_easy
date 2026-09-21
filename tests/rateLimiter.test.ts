import { RateLimiter } from '../src/shared/rateLimiter';

// NOTE: RateLimiter is deliberately DISABLED in rateLimiter.ts
// (demo-friendly: no daily cap). These tests lock that contract:
// checkAndIncrement must always resolve and never touch storage.
// If DISABLED is ever flipped to false, replace this file with
// enabled-behavior tests (3/day cap, date rollover, RATE_LIMITED).

describe('RateLimiter (disabled)', () => {
  let storedData: Record<string, any> = {};

  beforeEach(() => {
    storedData = {};
    (global as any).chrome = {
      storage: {
        local: {
          get: jest.fn((keys, callback) => {
            callback({});
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

  it('resolves without throwing', async () => {
    await expect(RateLimiter.checkAndIncrement()).resolves.toBeUndefined();
  });

  it('never writes usage to storage while disabled', async () => {
    await RateLimiter.checkAndIncrement();
    await RateLimiter.checkAndIncrement();
    await RateLimiter.checkAndIncrement();
    await RateLimiter.checkAndIncrement();
    expect(storedData.dailyUsageCount).toBeUndefined();
    expect(storedData.usageDate).toBeUndefined();
  });
});
