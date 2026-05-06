import { addMessageListener } from '../shared/messaging';

// Log service worker start
console.log('Prompt Easy: Service Worker initialized');

addMessageListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  if (message.type === 'PING') {
    sendResponse({ success: true, data: 'PONG' });
  }

  // Handle async response
  return true;
});
