import { ApiKeyManager } from '../src/shared/apiKeyManager';
import { StorageWrapper } from '../src/shared/storage';

jest.mock('../src/shared/storage');

describe('ApiKeyManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should store key directly in session storage', async () => {
    const rawKey = 'test-gemini-key';
    
    await ApiKeyManager.storeKey(rawKey);

    expect(StorageWrapper.setSession).toHaveBeenCalledWith('apiKey', rawKey);
  });

  it('should retrieve the key from session storage', async () => {
    const rawKey = 'test-gemini-key-to-retrieve';
    (StorageWrapper.getSession as jest.Mock).mockResolvedValue(rawKey);

    const retrieved = await ApiKeyManager.getKey();
    expect(retrieved).toBe(rawKey);
  });

  it('should throw an error if no API key is stored', async () => {
    (StorageWrapper.getSession as jest.Mock).mockResolvedValue(null);

    await expect(ApiKeyManager.getKey()).rejects.toThrow('No API key stored. Please re-enter your API key.');
  });
});
