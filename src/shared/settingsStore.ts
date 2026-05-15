import { StorageWrapper } from './storage';

export interface UsageStats {
  totalCalls: number;
  estimatedTokensIn: number;
  estimatedTokensOut: number;
}

export class SettingsStore {
  private static readonly KEYS = {
    TOTAL_CALLS: 'totalCalls',
    TOKENS_IN: 'estimatedTokensIn',
    TOKENS_OUT: 'estimatedTokensOut'
  };

  static async getUsageStats(): Promise<UsageStats> {
    const [totalCalls, estimatedTokensIn, estimatedTokensOut] = await Promise.all([
      StorageWrapper.getLocal(this.KEYS.TOTAL_CALLS),
      StorageWrapper.getLocal(this.KEYS.TOKENS_IN),
      StorageWrapper.getLocal(this.KEYS.TOKENS_OUT)
    ]);

    return {
      totalCalls: totalCalls || 0,
      estimatedTokensIn: estimatedTokensIn || 0,
      estimatedTokensOut: estimatedTokensOut || 0
    };
  }

  static async updateUsage(inputTokens: number, outputTokens: number): Promise<void> {
    const stats = await this.getUsageStats();
    
    await Promise.all([
      StorageWrapper.setLocal(this.KEYS.TOTAL_CALLS, stats.totalCalls + 1),
      StorageWrapper.setLocal(this.KEYS.TOKENS_IN, stats.estimatedTokensIn + inputTokens),
      StorageWrapper.setLocal(this.KEYS.TOKENS_OUT, stats.estimatedTokensOut + outputTokens)
    ]);
  }

  static async resetUsage(): Promise<void> {
    await Promise.all([
      StorageWrapper.setLocal(this.KEYS.TOTAL_CALLS, 0),
      StorageWrapper.setLocal(this.KEYS.TOKENS_IN, 0),
      StorageWrapper.setLocal(this.KEYS.TOKENS_OUT, 0)
    ]);
  }
}
