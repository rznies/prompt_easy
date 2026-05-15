import { StorageWrapper } from './storage';

export class RateLimitError extends Error {
  errorCode: 'RATE_LIMITED';

  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
    this.errorCode = 'RATE_LIMITED';
  }
}

export class RateLimiter {
  private static readonly DAILY_LIMIT = 3;
  private static readonly USAGE_COUNT_KEY = 'dailyUsageCount';
  private static readonly USAGE_DATE_KEY = 'usageDate';

  static async checkAndIncrement(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const [count, savedDate] = await Promise.all([
      StorageWrapper.getLocal(this.USAGE_COUNT_KEY),
      StorageWrapper.getLocal(this.USAGE_DATE_KEY),
    ]);

    if (savedDate !== today) {
      await Promise.all([
        StorageWrapper.setLocal(this.USAGE_COUNT_KEY, 1),
        StorageWrapper.setLocal(this.USAGE_DATE_KEY, today),
      ]);
      return;
    }

    const currentCount = count || 0;
    if (currentCount >= this.DAILY_LIMIT) {
      throw new RateLimitError('Daily improve limit reached. Try again tomorrow.');
    }

    await StorageWrapper.setLocal(this.USAGE_COUNT_KEY, currentCount + 1);
  }
}
