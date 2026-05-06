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
});
