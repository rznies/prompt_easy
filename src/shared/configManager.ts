import { CONFIG_ENDPOINT_URL } from './config';
import { PromptEasyStorage, type ManagedConfig } from './promptEasyStorage';

export type { ManagedConfig };

export class ConfigManager {
  private static pendingFetch: Promise<ManagedConfig> | null = null;

  static async getManagedConfig(): Promise<ManagedConfig | null> {
    return PromptEasyStorage.getManagedConfig();
  }

  static async ensureKey(): Promise<string> {
    const config = await this.getManagedConfig();
    if (config?.apiKey) {
      return config.apiKey;
    }

    if (this.pendingFetch) {
      const result = await this.pendingFetch;
      return result.apiKey;
    }

    this.pendingFetch = this.fetchAndCacheConfig();
    try {
      const result = await this.pendingFetch;
      return result.apiKey;
    } finally {
      this.pendingFetch = null;
    }
  }

  private static async fetchAndCacheConfig(): Promise<ManagedConfig> {
    try {
      const response = await fetch(CONFIG_ENDPOINT_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const config = (await response.json()) as ManagedConfig;
      await PromptEasyStorage.setManagedConfig(config);
      return config;
    } catch (error: any) {
      await PromptEasyStorage.markKeyFetchFailed();
      throw new Error(`Failed to fetch API key configuration: ${error.message}`);
    }
  }

  static resetForTest(): void {
    this.pendingFetch = null;
  }
}
