import { encryptKey, decryptKey, generateSessionKey } from '../src/shared/encryption';

describe('Encryption Utilities', () => {
  let sessionKey: CryptoKey;

  beforeAll(async () => {
    // Generate a key once for all tests
    sessionKey = await generateSessionKey();
  });

  it('should generate a valid AES-GCM key', () => {
    expect(sessionKey.algorithm.name).toBe('AES-GCM');
    expect(sessionKey.extractable).toBe(true); // Needed to export/store in some cases, or maybe false
  });

  it('should encrypt a plaintext string and return ciphertext and IV', async () => {
    const plaintext = 'my-secret-api-key';
    const { ciphertext, iv } = await encryptKey(plaintext, sessionKey);
    
    expect(ciphertext).toBeDefined();
    expect(iv).toBeDefined();
    expect(ciphertext).not.toBe(plaintext);
    expect(typeof ciphertext).toBe('string');
  });

  it('should decrypt a valid ciphertext back to the original plaintext', async () => {
    const plaintext = 'my-secret-api-key-2';
    const { ciphertext, iv } = await encryptKey(plaintext, sessionKey);
    
    const decrypted = await decryptKey(ciphertext, iv, sessionKey);
    expect(decrypted).toBe(plaintext);
  });

  it('should generate a fresh IV for each encryption', async () => {
    const plaintext = 'my-secret-api-key-3';
    const result1 = await encryptKey(plaintext, sessionKey);
    const result2 = await encryptKey(plaintext, sessionKey);
    
    expect(result1.iv).not.toBe(result2.iv);
    // Ciphertext should also be different due to different IV
    expect(result1.ciphertext).not.toBe(result2.ciphertext);
  });
});
