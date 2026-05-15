import { StorageWrapper } from './storage';
import { CONFIG_ENDPOINT_URL } from './config';

export interface ManagedConfig {
  apiKey: string;
  model: string;
  version: string;
}

export class ConfigManager {
  private static readonly STORAGE_KEY = 'managedConfig';
  private static readonly FAILED_FLAG_KEY = 'keyFetchFailed';
  private static pendingFetch: Promise<ManagedConfig> | null = null;

  static async getManagedConfig(): Promise<ManagedConfig | null> {
    const config = await StorageWrapper.getLocal(this.STORAGE_KEY);
    return config || null;
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
      await StorageWrapper.setLocal(this.STORAGE_KEY, config);
      return config;
    } catch (error: any) {
      await StorageWrapper.setLocal(this.FAILED_FLAG_KEY, true);
      throw new Error(`Failed to fetch API key configuration: ${error.message}`);
    }
  }

  static resetForTest(): void {
    this.pendingFetch = null;
  }
}
