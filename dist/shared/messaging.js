"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.addMessageListener = addMessageListener;
function sendMessage(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => {
            resolve(response);
        });
    });
}
function addMessageListener(handler) {
    chrome.runtime.onMessage.addListener(handler);
}
//# sourceMappingURL=messaging.js.map