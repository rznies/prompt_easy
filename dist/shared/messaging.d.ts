export interface Message {
    type: string;
    payload?: any;
}
export declare function sendMessage(message: Message): Promise<any>;
export declare function addMessageListener(handler: (message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void): void;
//# sourceMappingURL=messaging.d.ts.map