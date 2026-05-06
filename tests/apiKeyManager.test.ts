import { ApiKeyManager } from '../src/shared/apiKeyManager';
import { StorageWrapper } from '../src/shared/storage';
import { generateSessionKey } from '../src/shared/encryption';

jest.mock('../src/shared/storage');

const mockCrypto = require('crypto').webcrypto;

describe('ApiKeyManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).crypto = mockCrypto;
  });

  it('should store encrypted key in local and session key in session storage', async () => {
    const rawKey = 'test-gemini-key';
    
    await ApiKeyManager.storeKey(rawKey);

    // Verify session storage was called to save the CryptoKey
    expect(StorageWrapper.setSession).toHaveBeenCalledWith('sessionEncKey', expect.any(Object));
    
    // Verify local storage was called to save ciphertext and iv
    expect(StorageWrapper.setLocal).toHaveBeenCalledWith('apiKeyCipher', expect.any(String));
    expect(StorageWrapper.setLocal).toHaveBeenCalledWith('apiKeyIv', expect.any(String));
  });

  it('should retrieve and decrypt the key', async () => {
    // Setup mock values
    const rawKey = 'test-gemini-key-to-decrypt';
    const sessionKey = await generateSessionKey();
    const exportedKey = await mockCrypto.subtle.exportKey('jwk', sessionKey);
    
    // Manually encrypt to set up the mock
    const { encryptKey } = require('../src/shared/encryption');
    const { ciphertext, iv } = await encryptKey(rawKey, sessionKey);

    (StorageWrapper.getSession as jest.Mock).mockResolvedValue(exportedKey);
    (StorageWrapper.getLocal as jest.Mock).mockImplementation((key: string) => {
      if (key === 'apiKeyCipher') return Promise.resolve(ciphertext);
      if (key === 'apiKeyIv') return Promise.resolve(iv);
      return Promise.resolve(null);
    });

    const decrypted = await ApiKeyManager.getKey();
    expect(decrypted).toBe(rawKey);
  });

  it('should throw an error indicating session lost if session key is missing but ciphertext exists', async () => {
    (StorageWrapper.getSession as jest.Mock).mockResolvedValue(null); // Session lost
    (StorageWrapper.getLocal as jest.Mock).mockImplementation((key: string) => {
      if (key === 'apiKeyCipher') return Promise.resolve('someCipher');
      if (key === 'apiKeyIv') return Promise.resolve('someIv');
      return Promise.resolve(null);
    });

    await expect(ApiKeyManager.getKey()).rejects.toThrow('Session key lost. Please re-enter your API key.');
  });

  it('should throw an error if no API key is stored', async () => {
    (StorageWrapper.getSession as jest.Mock).mockResolvedValue(null);
    (StorageWrapper.getLocal as jest.Mock).mockResolvedValue(null);

    await expect(ApiKeyManager.getKey()).rejects.toThrow('No API key stored.');
  });
});
