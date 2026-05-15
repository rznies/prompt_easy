import { ServiceBus, MessageType } from '../src/shared/serviceBus';
import { PromptEasyEngine } from '../src/improveEngine';

// Mock the dependencies
jest.mock('../src/shared/serviceBus', () => ({
  ServiceBus: {
    addListener: jest.fn(),
  },
  MessageType: {
    IMPROVE_PROMPT: 'IMPROVE_PROMPT',
    PING: 'PING'
  }
}));

jest.mock('../src/improveEngine', () => ({
  PromptEasyEngine: jest.fn()
}));

describe('Background Service Worker', () => {
  let messageHandler: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Global chrome mock
    (global as any).chrome = {
      runtime: {
        onMessage: {
          addListener: jest.fn()
        }
      }
    };

    // Require the service worker - this should call ServiceBus.addListener
    require('../src/background/service-worker');
    
    // Extract the handler passed to the listener
    const addListenerMock = ServiceBus.addListener as jest.Mock;
    if (addListenerMock.mock.calls.length > 0) {
      messageHandler = addListenerMock.mock.calls[0][0];
    }
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('should handle IMPROVE_PROMPT message', async () => {
    expect(messageHandler).toBeDefined();
    
    (PromptEasyEngine as jest.Mock).mockImplementation(() => ({
      improve: jest.fn().mockResolvedValue('Improved prompt')
    }));

    const result = await messageHandler(MessageType.IMPROVE_PROMPT, { text: 'test prompt' });
    
    expect(result).toBe('Improved prompt');
    expect(PromptEasyEngine).toHaveBeenCalled();
  });

  it('should handle PING message', async () => {
    expect(messageHandler).toBeDefined();
    const result = await messageHandler(MessageType.PING);
    expect(result).toBe('PONG');
  });

  it('should handle errors', async () => {
    expect(messageHandler).toBeDefined();
    
    (PromptEasyEngine as jest.Mock).mockImplementation(() => ({
      improve: jest.fn().mockRejectedValue(new Error('Test error'))
    }));

    await expect(messageHandler(MessageType.IMPROVE_PROMPT, { text: 'test prompt' }))
      .rejects.toThrow('Test error');
  });
});

