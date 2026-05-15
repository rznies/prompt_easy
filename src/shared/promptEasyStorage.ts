import { StorageWrapper } from './storage';

export interface ManagedConfig {
  apiKey: string;
  model: string;
  version: string;
}

export interface DailyUsage {
  count: number;
  date?: string;
}

export interface UsageStats {
  totalCalls: number;
  estimatedTokensIn: number;
  estimatedTokensOut: number;
}

const LOCAL_KEYS = {
  MANAGED_CONFIG: 'managedConfig',
  KEY_FETCH_FAILED: 'keyFetchFailed',
  LAST_KEY_CHECK: 'lastKeyCheck',
  DAILY_USAGE_COUNT: 'dailyUsageCount',
  USAGE_DATE: 'usageDate',
  TOTAL_CALLS: 'totalCalls',
  TOKENS_IN: 'estimatedTokensIn',
  TOKENS_OUT: 'estimatedTokensOut',
} as const;

const SESSION_KEYS = {
  LEGACY_SESSION_KEY: 'sessionApiKey',
} as const;

export class PromptEasyStorage {
  static async getManagedConfig(): Promise<ManagedConfig | null> {
    const config = await StorageWrapper.getLocal(LOCAL_KEYS.MANAGED_CONFIG);
    return config || null;
  }

  static async setManagedConfig(config: ManagedConfig): Promise<void> {
    await StorageWrapper.setLocal(LOCAL_KEYS.MANAGED_CONFIG, config);
  }

  static async markKeyFetchFailed(): Promise<void> {
    await StorageWrapper.setLocal(LOCAL_KEYS.KEY_FETCH_FAILED, true);
  }

  static async setLastKeyCheck(timestamp: number): Promise<void> {
    await StorageWrapper.setLocal(LOCAL_KEYS.LAST_KEY_CHECK, timestamp);
  }

  static async getLastKeyCheck(): Promise<number | null> {
    const lastCheck = await StorageWrapper.getLocal(LOCAL_KEYS.LAST_KEY_CHECK);
    return lastCheck || null;
  }

  static async purgeLegacySessionKey(): Promise<void> {
    await StorageWrapper.removeSession(SESSION_KEYS.LEGACY_SESSION_KEY);
  }

  static async getDailyUsage(): Promise<DailyUsage> {
    const [count, date] = await Promise.all([
      StorageWrapper.getLocal(LOCAL_KEYS.DAILY_USAGE_COUNT),
      StorageWrapper.getLocal(LOCAL_KEYS.USAGE_DATE),
    ]);

    return {
      count: count || 0,
      date: date || undefined,
    };
  }

  static async setDailyUsage(usage: DailyUsage): Promise<void> {
    await Promise.all([
      StorageWrapper.setLocal(LOCAL_KEYS.DAILY_USAGE_COUNT, usage.count),
      StorageWrapper.setLocal(LOCAL_KEYS.USAGE_DATE, usage.date),
    ]);
  }

  static async getUsageStats(): Promise<UsageStats> {
    const [totalCalls, estimatedTokensIn, estimatedTokensOut] = await Promise.all([
      StorageWrapper.getLocal(LOCAL_KEYS.TOTAL_CALLS),
      StorageWrapper.getLocal(LOCAL_KEYS.TOKENS_IN),
      StorageWrapper.getLocal(LOCAL_KEYS.TOKENS_OUT),
    ]);

    return {
      totalCalls: totalCalls || 0,
      estimatedTokensIn: estimatedTokensIn || 0,
      estimatedTokensOut: estimatedTokensOut || 0,
    };
  }

  static async setUsageStats(stats: UsageStats): Promise<void> {
    await Promise.all([
      StorageWrapper.setLocal(LOCAL_KEYS.TOTAL_CALLS, stats.totalCalls),
      StorageWrapper.setLocal(LOCAL_KEYS.TOKENS_IN, stats.estimatedTokensIn),
      StorageWrapper.setLocal(LOCAL_KEYS.TOKENS_OUT, stats.estimatedTokensOut),
    ]);
  }

  static async incrementUsageStats(inputTokens: number, outputTokens: number): Promise<void> {
    const stats = await this.getUsageStats();
    await this.setUsageStats({
      totalCalls: stats.totalCalls + 1,
      estimatedTokensIn: stats.estimatedTokensIn + inputTokens,
      estimatedTokensOut: stats.estimatedTokensOut + outputTokens,
    });
  }

  static async resetUsageStats(): Promise<void> {
    await this.setUsageStats({
      totalCalls: 0,
      estimatedTokensIn: 0,
      estimatedTokensOut: 0,
    });
  }
}
