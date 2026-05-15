import { normalizeImproveError, type ImproveErrorCode } from './improveError';

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
  errorCode?: ImproveErrorCode;
  debugMessage?: string;
}

/**
 * ServiceBus provides a typed interface for inter-process communication
 * in the Chrome extension using long-lived ports for disconnect detection.
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
      const error = new Error(response.error || 'Failed to improve prompt');
      (error as any).errorCode = response.errorCode;
      (error as any).debugMessage = response.debugMessage;
      throw error;
    }

    return response.data!;
  }

  /**
   * Generic internal sender using long-lived ports for disconnect awareness
   */
  private static send(message: { type: MessageType; payload?: any }): Promise<any> {
    return new Promise((resolve, reject) => {
      const port = chrome.runtime.connect({ name: message.type });

      port.onMessage.addListener((response) => {
        port.disconnect();
        resolve(response);
      });

      port.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
          const errMsg = chrome.runtime.lastError.message || '';
          if (errMsg.includes('Extension context invalidated')) {
            reject(new Error('Extension was updated. Please refresh this page to continue using Prompt Easy.'));
          } else {
            reject(new Error(errMsg));
          }
        } else {
          reject(new Error('Connection to service worker lost.'));
        }
      });

      port.postMessage(message);
    });
  }

  /**
   * Helper for background script to listen for typed messages.
   * The handler receives (type, payload, abortSignal) where abortSignal
   * fires when the caller disconnects (e.g., popup closes).
   */
  static addListener(
    handler: (
      type: MessageType,
      payload: any,
      abortSignal: AbortSignal
    ) => Promise<any>
  ): void {
    chrome.runtime.onConnect.addListener((port) => {
      const abortController = new AbortController();

      port.onDisconnect.addListener(() => {
        abortController.abort();
      });

      port.onMessage.addListener((message) => {
        handler(message.type, message.payload, abortController.signal)
          .then(data => port.postMessage({ success: true, data }))
          .catch(error => {
            if (abortController.signal.aborted) {
              // Caller disconnected, no need to respond
              return;
            }
            const improveError = normalizeImproveError(error);
            port.postMessage({
              success: false,
              error: improveError.displayMessage,
              errorCode: improveError.errorCode,
              debugMessage: improveError.debugMessage,
            });
          });
      });
    });
  }
}
