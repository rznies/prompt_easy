import { sendMessage, addMessageListener, Message } from '../src/shared/messaging';

describe('Messaging Contract', () => {
  beforeEach(() => {
    (global as any).chrome = {
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
    const sendMessageMock = (global as any).chrome.runtime.sendMessage as jest.Mock;
    sendMessageMock.mockImplementation((msg, callback) => {
      callback({ success: true, data: 'response' });
    });

    const message: Message = { type: 'IMPROVE_PROMPT', payload: { text: 'test' } };
    const response = await sendMessage(message);

    expect(sendMessageMock).toHaveBeenCalledWith(message, expect.any(Function));
    expect(response).toEqual({ success: true, data: 'response' });
  });

  it('should add a message listener', () => {
    const addListenerMock = (global as any).chrome.runtime.onMessage.addListener as jest.Mock;
    const handler = jest.fn();

    addMessageListener(handler);

    expect(addListenerMock).toHaveBeenCalledWith(handler);
  });
});
