import { ServiceBus, MessageType, ImprovePromptPayload } from '../shared/serviceBus';
import { PromptEasyEngine } from '../improveEngine';

console.log('Prompt Easy: Service Worker initialized with ServiceBus');

ServiceBus.addListener(async (type, payload) => {
  if (type === MessageType.PING) {
    return 'PONG';
  }

  if (type === MessageType.IMPROVE_PROMPT) {
    const { text, context } = payload as ImprovePromptPayload;
    const engine = new PromptEasyEngine();
    return await engine.improve(text, { context });
  }

  throw new Error(`Unhandled message type: ${type}`);
});
