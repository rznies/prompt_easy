import { ServiceBus, MessageType, ImprovePromptPayload } from '../shared/serviceBus';
import { PromptEasyEngine } from '../improveEngine';
import { ProvisioningService } from './provisioningService';
import { RateLimiter } from '../shared/rateLimiter';
import { ConfigManager } from '../shared/configManager';

console.log('Prompt Easy: Service Worker initialized with ServiceBus');

chrome.runtime.onInstalled.addListener(async (details) => {
  await ProvisioningService.handleInstalled(details);
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  await ProvisioningService.handleAlarm(alarm);
});

ServiceBus.addListener(async (type, payload, abortSignal) => {
  if (type === MessageType.PING) {
    return 'PONG';
  }

  if (type === MessageType.IMPROVE_PROMPT) {
    await RateLimiter.checkAndIncrement();
    
    // Transparent key healing: if managed config is missing, trigger fetch
    const config = await ConfigManager.getManagedConfig();
    if (!config?.apiKey) {
      try {
        await ConfigManager.ensureKey();
      } catch (error: any) {
        const healingError = new Error(`API key not ready: ${error.message}`);
        (healingError as any).errorCode = 'KEY_NOT_READY';
        throw healingError;
      }
    }

    const { text, context } = payload as ImprovePromptPayload;
    const engine = new PromptEasyEngine();
    return await engine.improve(text, { context, signal: abortSignal });
  }

  throw new Error(`Unhandled message type: ${type}`);
});
