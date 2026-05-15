import { StorageWrapper } from './storage';

export interface UsageStats {
  totalCalls: number;
  estimatedTokensIn: number;
  estimatedTokensOut: number;
}

export class SettingsStore {
  private static readonly KEYS = {
    PREFERRED_MODEL: 'preferredModel',
    TOTAL_CALLS: 'totalCalls',
    TOKENS_IN: 'estimatedTokensIn',
    TOKENS_OUT: 'estimatedTokensOut',
    API_KEY_CHIPER: 'apiKeyCipher',
    API_KEY_IV: 'apiKeyIv',
    SESSION_ENC_KEY: 'sessionEncKey'
  };

  private static readonly DEFAULTS = {
    MODEL: 'gemini-3-flash-preview'
  };

  static async getPreferredModel(): Promise<string> {
    const model = await StorageWrapper.getLocal(this.KEYS.PREFERRED_MODEL);
    return model || this.DEFAULTS.MODEL;
  }

  static async setPreferredModel(model: string): Promise<void> {
    await StorageWrapper.setLocal(this.KEYS.PREFERRED_MODEL, model);
  }

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
