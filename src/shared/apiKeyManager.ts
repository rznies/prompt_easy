import { StorageWrapper } from './storage';

export class ApiKeyManager {
  static async storeKey(apiKey: string): Promise<void> {
    await StorageWrapper.setSession('apiKey', apiKey);
  }

  static async getKey(): Promise<string> {
    const apiKey = await StorageWrapper.getSession('apiKey');

    if (!apiKey) {
      throw new Error('No API key stored. Please re-enter your API key.');
    }

    return apiKey;
  }
}
