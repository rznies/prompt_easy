export enum MessageType {
  IMPROVE_PROMPT = 'IMPROVE_PROMPT',
  PING = 'PING'
}

export interface ImprovePromptPayload {
  text: string;
  context?: string;
}

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * ServiceBus provides a typed interface for inter-process communication
 * in the Chrome extension.
 */
export class ServiceBus {
  /**
   * Send a request to the background script to improve a prompt
   */
  static async improvePrompt(text: string, context?: string): Promise<string> {
    const response: MessageResponse<string> = await this.send({
      type: MessageType.IMPROVE_PROMPT,
      payload: { text, context }
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to improve prompt');
    }

    return response.data!;
  }

  /**
   * Generic internal sender
   */
  private static send(message: { type: MessageType; payload?: any }): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          const errMsg = chrome.runtime.lastError.message || '';
          if (errMsg.includes('Extension context invalidated')) {
            reject(new Error('Extension was updated. Please refresh this page to continue using Prompt Easy.'));
          } else {
            reject(new Error(errMsg));
          }
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Helper for background script to listen for typed messages
   */
  static addListener(
    handler: (
      type: MessageType, 
      payload: any, 
      sender: chrome.runtime.MessageSender
    ) => Promise<any>
  ): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      handler(message.type, message.payload, sender)
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message || String(error) }));
      return true; // Keep port open for async response
    });
  }
}
