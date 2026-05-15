import { PromptEasyStorage } from './promptEasyStorage';

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

  static async checkAndIncrement(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const usage = await PromptEasyStorage.getDailyUsage();

    if (usage.date !== today) {
      await PromptEasyStorage.setDailyUsage({ count: 1, date: today });
      return;
    }

    if (usage.count >= this.DAILY_LIMIT) {
      throw new RateLimitError('Daily improve limit reached. Try again tomorrow.');
    }

    await PromptEasyStorage.setDailyUsage({ count: usage.count + 1, date: today });
  }
}
