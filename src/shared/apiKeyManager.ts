import { StorageWrapper } from './storage';
import { generateSessionKey, encryptKey, decryptKey } from './encryption';

const cryptoObj = typeof crypto !== 'undefined' ? crypto : (globalThis as any).crypto;

export class ApiKeyManager {
  static async storeKey(apiKey: string): Promise<void> {
    // Generate a fresh session key
    const sessionKey = await generateSessionKey();
    
    // Encrypt the API key
    const { ciphertext, iv } = await encryptKey(apiKey, sessionKey);
    
    // Export the session key to store it (CryptoKey itself can't be stored directly in chrome.storage)
    const exportedKey = await cryptoObj.subtle.exportKey('jwk', sessionKey);

    // Store ciphertext and IV in local storage (persists across restarts)
    await StorageWrapper.setLocal('apiKeyCipher', ciphertext);
    await StorageWrapper.setLocal('apiKeyIv', iv);
    
    // Store session key in session storage (cleared on restart)
    await StorageWrapper.setSession('sessionEncKey', exportedKey);
  }

  static async getKey(): Promise<string> {
    const cipher = await StorageWrapper.getLocal('apiKeyCipher');
    const iv = await StorageWrapper.getLocal('apiKeyIv');
    const exportedKey = await StorageWrapper.getSession('sessionEncKey');

    if (!cipher || !iv) {
      throw new Error('No API key stored.');
    }

    if (!exportedKey) {
      throw new Error('Session key lost. Please re-enter your API key.');
    }

    // Re-import the session key
    const sessionKey = await cryptoObj.subtle.importKey(
      'jwk',
      exportedKey,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );

    // Decrypt and return
    return decryptKey(cipher, iv, sessionKey);
  }
}
