export type ImproveErrorCode =
  | 'RATE_LIMITED'
  | 'KEY_NOT_READY'
  | 'NETWORK_ERROR'
  | 'INPUT_EMPTY'
  | 'INPUT_TOO_LONG'
  | 'AUTHENTICATION'
  | 'UNKNOWN';

const DISPLAY_MESSAGES: Record<ImproveErrorCode, string> = {
  RATE_LIMITED: 'This improve is rate limited. Please try again later.',
  KEY_NOT_READY: 'Setting up your API key... please try again in a moment.',
  NETWORK_ERROR: 'Network error. Check your connection and try again.',
  INPUT_EMPTY: 'Enter a prompt to improve.',
  INPUT_TOO_LONG: 'Input exceeds 500 tokens. Shorten and try again.',
  AUTHENTICATION: 'API key invalid or unavailable. Try again in a moment.',
  UNKNOWN: 'Improving failed. Please try again.',
};

export class ImproveError extends Error {
  readonly errorCode: ImproveErrorCode;
  readonly displayMessage: string;
  readonly debugMessage: string;

  constructor(errorCode: ImproveErrorCode, debugMessage: string, displayMessage = DISPLAY_MESSAGES[errorCode]) {
    super(debugMessage);
    this.name = 'ImproveError';
    this.errorCode = errorCode;
    this.displayMessage = displayMessage;
    this.debugMessage = debugMessage;
  }
}

function isImproveErrorCode(value: unknown): value is ImproveErrorCode {
  return typeof value === 'string' && value in DISPLAY_MESSAGES;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  const message = (error as any)?.message;
  if (typeof message === 'string') {
    return message;
  }

  return String(error);
}

function normalizeReliableLLMError(error: { type: string; message: string }): ImproveError {
  switch (error.type) {
    case 'AUTHENTICATION':
      return new ImproveError('AUTHENTICATION', error.message);
    case 'RATE_LIMIT':
    case 'QUOTA_EXCEEDED':
      return new ImproveError('RATE_LIMITED', error.message);
    case 'NETWORK':
      return new ImproveError('NETWORK_ERROR', error.message);
    case 'UNSUPPORTED':
    case 'UNKNOWN':
    default:
      return new ImproveError('UNKNOWN', error.message);
  }
}

export function normalizeImproveError(error: unknown): ImproveError {
  if (error instanceof ImproveError) {
    return error;
  }

  const reliableType = (error as any)?.type;
  if (typeof reliableType === 'string') {
    return normalizeReliableLLMError({ type: reliableType, message: getErrorMessage(error) });
  }

  const errorCode = (error as any)?.errorCode;
  const message = getErrorMessage(error);
  if (isImproveErrorCode(errorCode)) {
    return new ImproveError(errorCode, message);
  }

  return new ImproveError('UNKNOWN', message);
}

export function getImproveErrorDisplayMessage(error: unknown): string {
  return normalizeImproveError(error).displayMessage;
}
