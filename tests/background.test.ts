import { ServiceBus, MessageType } from '../src/shared/serviceBus';
import { PromptEasyEngine } from '../src/improveEngine';
import { RateLimiter, RateLimitError } from '../src/shared/rateLimiter';
import { ConfigManager } from '../src/shared/configManager';

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

jest.mock('../src/shared/rateLimiter', () => ({
  RateLimiter: {
    checkAndIncrement: jest.fn().mockResolvedValue(undefined)
  },
  RateLimitError: class RateLimitError extends Error {
    errorCode = 'RATE_LIMITED';
    constructor(message: string) {
      super(message);
      this.name = 'RateLimitError';
    }
  }
}));

jest.mock('../src/shared/configManager', () => ({
  ConfigManager: {
    getManagedConfig: jest.fn().mockResolvedValue({ apiKey: 'test-key', model: 'gemini-2.0-flash', version: '1.0.0' }),
    ensureKey: jest.fn().mockResolvedValue('test-key')
  }
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
        },
        onInstalled: {
          addListener: jest.fn()
        }
      },
      alarms: {
        onAlarm: {
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

  it('should throw RateLimitError when rate limiter is exceeded', async () => {
    expect(messageHandler).toBeDefined();
    
    (RateLimiter.checkAndIncrement as jest.Mock).mockRejectedValueOnce(
      new RateLimitError('Daily improve limit reached')
    );

    await expect(messageHandler(MessageType.IMPROVE_PROMPT, { text: 'test prompt' }))
      .rejects.toThrow(RateLimitError);
  });

  it('should trigger transparent key healing when managed config is missing', async () => {
    expect(messageHandler).toBeDefined();
    
    (ConfigManager.getManagedConfig as jest.Mock).mockResolvedValueOnce(null);
    (ConfigManager.ensureKey as jest.Mock).mockResolvedValueOnce('healed-key');
    
    (PromptEasyEngine as jest.Mock).mockImplementation(() => ({
      improve: jest.fn().mockResolvedValue('Improved prompt')
    }));

    const result = await messageHandler(MessageType.IMPROVE_PROMPT, { text: 'test prompt' });
    
    expect(result).toBe('Improved prompt');
    expect(ConfigManager.ensureKey).toHaveBeenCalled();
  });

  it('should throw KEY_NOT_READY error when key healing fails', async () => {
    expect(messageHandler).toBeDefined();
    
    (ConfigManager.getManagedConfig as jest.Mock).mockResolvedValueOnce(null);
    (ConfigManager.ensureKey as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));

    try {
      await messageHandler(MessageType.IMPROVE_PROMPT, { text: 'test prompt' });
      fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error.message).toBe('API key not ready: Network timeout');
      expect(error.errorCode).toBe('KEY_NOT_READY');
    }
  });
});

