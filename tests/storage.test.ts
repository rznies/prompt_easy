import { StorageWrapper } from '../src/shared/storage';

describe('StorageWrapper', () => {
  beforeEach(() => {
    // Mock global chrome object
    (global as any).chrome = {
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn(),
        },
        session: {
          get: jest.fn(),
          set: jest.fn(),
        },
      },
      runtime: {
        lastError: undefined,
      },
    };
  });

  describe('local storage', () => {
    it('should set local storage item', async () => {
      const setMock = (global as any).chrome.storage.local.set as jest.Mock;
      setMock.mockImplementation((data, callback) => callback && callback());

      await StorageWrapper.setLocal('testKey', 'testValue');
      
      expect(setMock).toHaveBeenCalledWith({ testKey: 'testValue' }, expect.any(Function));
    });

    it('should get local storage item', async () => {
      const getMock = (global as any).chrome.storage.local.get as jest.Mock;
      getMock.mockImplementation((keys, callback) => callback({ testKey: 'testValue' }));

      const value = await StorageWrapper.getLocal('testKey');
      
      expect(getMock).toHaveBeenCalledWith(['testKey'], expect.any(Function));
      expect(value).toBe('testValue');
    });
  });

  describe('session storage', () => {
    it('should set session storage item', async () => {
      const setMock = (global as any).chrome.storage.session.set as jest.Mock;
      setMock.mockImplementation((data, callback) => callback && callback());

      await StorageWrapper.setSession('testSessionKey', 'testSessionValue');
      
      expect(setMock).toHaveBeenCalledWith({ testSessionKey: 'testSessionValue' }, expect.any(Function));
    });

    it('should get session storage item', async () => {
      const getMock = (global as any).chrome.storage.session.get as jest.Mock;
      getMock.mockImplementation((keys, callback) => callback({ testSessionKey: 'testSessionValue' }));

      const value = await StorageWrapper.getSession('testSessionKey');
      
      expect(getMock).toHaveBeenCalledWith(['testSessionKey'], expect.any(Function));
      expect(value).toBe('testSessionValue');
    });
  });

  describe('lastError rejection', () => {
    it('should reject setLocal when chrome.runtime.lastError is set', async () => {
      const setMock = (global as any).chrome.storage.local.set as jest.Mock;
      setMock.mockImplementation((data, callback) => {
        (global as any).chrome.runtime.lastError = { message: 'Storage error' };
        callback && callback();
      });

      await expect(StorageWrapper.setLocal('key', 'value')).rejects.toThrow('Storage error');
    });

    it('should reject getLocal when chrome.runtime.lastError is set', async () => {
      const getMock = (global as any).chrome.storage.local.get as jest.Mock;
      getMock.mockImplementation((keys, callback) => {
        (global as any).chrome.runtime.lastError = { message: 'Storage error' };
        callback && callback({});
      });

      await expect(StorageWrapper.getLocal('key')).rejects.toThrow('Storage error');
    });

    it('should reject setSession when chrome.runtime.lastError is set', async () => {
      const setMock = (global as any).chrome.storage.session.set as jest.Mock;
      setMock.mockImplementation((data, callback) => {
        (global as any).chrome.runtime.lastError = { message: 'Storage error' };
        callback && callback();
      });

      await expect(StorageWrapper.setSession('key', 'value')).rejects.toThrow('Storage error');
    });

    it('should reject getSession when chrome.runtime.lastError is set', async () => {
      const getMock = (global as any).chrome.storage.session.get as jest.Mock;
      getMock.mockImplementation((keys, callback) => {
        (global as any).chrome.runtime.lastError = { message: 'Storage error' };
        callback && callback({});
      });

      await expect(StorageWrapper.getSession('key')).rejects.toThrow('Storage error');
    });
  });
});
