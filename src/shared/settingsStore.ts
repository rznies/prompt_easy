import { PromptEasyStorage, type UsageStats } from './promptEasyStorage';

export type { UsageStats };

export class SettingsStore {
  static async getUsageStats(): Promise<UsageStats> {
    return PromptEasyStorage.getUsageStats();
  }

  static async updateUsage(inputTokens: number, outputTokens: number): Promise<void> {
    await PromptEasyStorage.incrementUsageStats(inputTokens, outputTokens);
  }

  static async resetUsage(): Promise<void> {
    await PromptEasyStorage.resetUsageStats();
  }
}
