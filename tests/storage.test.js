"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../src/shared/storage");
describe('StorageWrapper', () => {
    beforeEach(() => {
        // Mock global chrome object
        global.chrome = {
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
            const setMock = global.chrome.storage.local.set;
            setMock.mockImplementation((data, callback) => callback && callback());
            await storage_1.StorageWrapper.setLocal('testKey', 'testValue');
            expect(setMock).toHaveBeenCalledWith({ testKey: 'testValue' }, expect.any(Function));
        });
        it('should get local storage item', async () => {
            const getMock = global.chrome.storage.local.get;
            getMock.mockImplementation((keys, callback) => callback({ testKey: 'testValue' }));
            const value = await storage_1.StorageWrapper.getLocal('testKey');
            expect(getMock).toHaveBeenCalledWith(['testKey'], expect.any(Function));
            expect(value).toBe('testValue');
        });
    });
    describe('session storage', () => {
        it('should set session storage item', async () => {
            const setMock = global.chrome.storage.session.set;
            setMock.mockImplementation((data, callback) => callback && callback());
            await storage_1.StorageWrapper.setSession('testSessionKey', 'testSessionValue');
            expect(setMock).toHaveBeenCalledWith({ testSessionKey: 'testSessionValue' }, expect.any(Function));
        });
        it('should get session storage item', async () => {
            const getMock = global.chrome.storage.session.get;
            getMock.mockImplementation((keys, callback) => callback({ testSessionKey: 'testSessionValue' }));
            const value = await storage_1.StorageWrapper.getSession('testSessionKey');
            expect(getMock).toHaveBeenCalledWith(['testSessionKey'], expect.any(Function));
            expect(value).toBe('testSessionValue');
        });
    });
});
//# sourceMappingURL=storage.test.js.map