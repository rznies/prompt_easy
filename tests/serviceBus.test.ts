import { RateLimitError } from '../src/shared/rateLimiter';
import { ServiceBus } from '../src/shared/serviceBus';

const flushPromises = () => new Promise(process.nextTick);

describe('ServiceBus Error Codes', () => {
  describe('addListener error code propagation', () => {
    it('includes errorCode in response when handler throws RateLimitError', async () => {
      const postMessageMock = jest.fn();
      const onConnectCallbacks: any[] = [];

      (global as any).chrome = {
        runtime: {
          onConnect: {
            addListener: jest.fn((cb) => {
              onConnectCallbacks.push(cb);
            })
          }
        }
      };

      jest.isolateModules(() => {
        const { ServiceBus } = require('../src/shared/serviceBus');
        const handler = jest.fn().mockRejectedValue(new RateLimitError('Daily limit reached'));
        ServiceBus.addListener(handler);
      });

      expect(onConnectCallbacks.length).toBeGreaterThan(0);

      const mockPort = {
        onMessage: { addListener: jest.fn() },
        onDisconnect: { addListener: jest.fn() },
        postMessage: postMessageMock
      };

      onConnectCallbacks[0](mockPort);

      const onMessageCb = mockPort.onMessage.addListener.mock.calls[0][0];
      onMessageCb({ type: 'IMPROVE_PROMPT', payload: { text: 'test' } });
      
      await flushPromises();

      expect(postMessageMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errorCode: 'RATE_LIMITED'
        })
      );
    });
  });

  describe('improvePrompt client-side error differentiation', () => {
    function setupServiceBusMock() {
      const onMessageCallbacks: any[] = [];
      const mockPort = {
        onMessage: { addListener: jest.fn((cb) => onMessageCallbacks.push(cb)) },
        onDisconnect: { addListener: jest.fn() },
        postMessage: jest.fn(),
        disconnect: jest.fn()
      };

      (global as any).chrome = {
        runtime: {
          connect: jest.fn(() => mockPort)
        }
      };

      return { onMessageCallbacks, mockPort };
    }

    it('throws error with errorCode when response is rate limited', async () => {
      const { onMessageCallbacks } = setupServiceBusMock();

      const improvePromise = new Promise<void>((resolve, reject) => {
        jest.isolateModules(() => {
          const { ServiceBus: SB } = require('../src/shared/serviceBus');
          SB.improvePrompt('test prompt')
            .then(() => resolve())
            .catch((error: any) => reject(error));
        });
      });

      onMessageCallbacks[0]({ success: false, error: 'Daily limit reached', errorCode: 'RATE_LIMITED' });

      await expect(improvePromise).rejects.toMatchObject({
        message: 'Daily limit reached',
        errorCode: 'RATE_LIMITED'
      });
    });

    it('throws error with errorCode when key is not ready', async () => {
      const { onMessageCallbacks } = setupServiceBusMock();

      const improvePromise = new Promise<void>((resolve, reject) => {
        jest.isolateModules(() => {
          const { ServiceBus: SB } = require('../src/shared/serviceBus');
          SB.improvePrompt('test prompt')
            .then(() => resolve())
            .catch((error: any) => reject(error));
        });
      });

      onMessageCallbacks[0]({ success: false, error: 'API key not ready', errorCode: 'KEY_NOT_READY' });

      await expect(improvePromise).rejects.toMatchObject({
        message: 'API key not ready',
        errorCode: 'KEY_NOT_READY'
      });
    });
  });
});
