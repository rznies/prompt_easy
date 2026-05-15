import {
  getImproveErrorDisplayMessage,
  ImproveError,
  normalizeImproveError,
} from '../src/shared/improveError';

describe('ImproveError normalization', () => {
  it('preserves ImproveError debug and display messages', () => {
    const error = new ImproveError('INPUT_TOO_LONG', 'Input too long (estimated 750 tokens). Max is 500.');
    const normalized = normalizeImproveError(error);

    expect(normalized.errorCode).toBe('INPUT_TOO_LONG');
    expect(normalized.message).toBe('Input too long (estimated 750 tokens). Max is 500.');
    expect(normalized.displayMessage).toBe('Input exceeds 500 tokens. Shorten and try again.');
  });

  it('maps rate limit errors by errorCode', () => {
    const error = new Error('Daily improve limit reached.');
    (error as any).errorCode = 'RATE_LIMITED';

    const normalized = normalizeImproveError(error);

    expect(normalized.errorCode).toBe('RATE_LIMITED');
    expect(normalized.debugMessage).toBe('Daily improve limit reached.');
    expect(normalized.displayMessage).toBe('This improve is rate limited. Please try again later.');
  });

  it('maps ReliableLLMError-like authentication errors structurally', () => {
    const normalized = normalizeImproveError({
      name: 'ReliableLLMError',
      type: 'AUTHENTICATION',
      message: 'Invalid API key.',
    });

    expect(normalized.errorCode).toBe('AUTHENTICATION');
    expect(normalized.displayMessage).toBe('API key invalid or unavailable. Try again in a moment.');
  });

  it('maps ReliableLLMError-like network errors structurally', () => {
    const normalized = normalizeImproveError({
      name: 'ReliableLLMError',
      type: 'NETWORK',
      message: 'Network connection failed.',
    });

    expect(normalized.errorCode).toBe('NETWORK_ERROR');
    expect(normalized.displayMessage).toBe('Network error. Check your connection and try again.');
  });

  it('returns a display message for plain serialized errors', () => {
    expect(getImproveErrorDisplayMessage({ errorCode: 'KEY_NOT_READY', message: 'Fetch failed.' }))
      .toBe('Setting up your API key... please try again in a moment.');
  });
});
