"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messaging_1 = require("../shared/messaging");
// Log service worker start
console.log('Prompt Easy: Service Worker initialized');
(0, messaging_1.addMessageListener)((message, sender, sendResponse) => {
    console.log('Received message:', message);
    if (message.type === 'PING') {
        sendResponse({ success: true, data: 'PONG' });
    }
    // Handle async response
    return true;
});
//# sourceMappingURL=service-worker.js.map