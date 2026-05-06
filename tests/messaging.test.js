"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messaging_1 = require("../src/shared/messaging");
describe('Messaging Contract', () => {
    beforeEach(() => {
        global.chrome = {
            runtime: {
                sendMessage: jest.fn(),
                onMessage: {
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                }
            }
        };
    });
    it('should send a message via chrome.runtime', async () => {
        const sendMessageMock = global.chrome.runtime.sendMessage;
        sendMessageMock.mockImplementation((msg, callback) => {
            callback({ success: true, data: 'response' });
        });
        const message = { type: 'IMPROVE_PROMPT', payload: { text: 'test' } };
        const response = await (0, messaging_1.sendMessage)(message);
        expect(sendMessageMock).toHaveBeenCalledWith(message, expect.any(Function));
        expect(response).toEqual({ success: true, data: 'response' });
    });
    it('should add a message listener', () => {
        const addListenerMock = global.chrome.runtime.onMessage.addListener;
        const handler = jest.fn();
        (0, messaging_1.addMessageListener)(handler);
        expect(addListenerMock).toHaveBeenCalledWith(handler);
    });
});
//# sourceMappingURL=messaging.test.js.map