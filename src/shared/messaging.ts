export interface Message {
  type: string;
  payload?: any;
}

export function sendMessage(message: Message): Promise<any> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response);
    });
  });
}

export function addMessageListener(handler: (message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void): void {
  chrome.runtime.onMessage.addListener(handler);
}
