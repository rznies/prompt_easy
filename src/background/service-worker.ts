import { ServiceBus, MessageType, ImprovePromptPayload } from '../shared/serviceBus';
import { PromptEasyEngine } from '../improveEngine';
import { ProvisioningService } from './provisioningService';
import { RateLimiter } from '../shared/rateLimiter';

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
    const { text, context } = payload as ImprovePromptPayload;
    const engine = new PromptEasyEngine();
    return await engine.improve(text, { context, signal: abortSignal });
  }

  throw new Error(`Unhandled message type: ${type}`);
});
