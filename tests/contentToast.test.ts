import { showToast, getErrorMessage } from '../src/content/toast';

describe('Content Script Toast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(0); return 0; });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    const existing = document.getElementById('prompt-easy-toast');
    if (existing) existing.remove();
  });

  describe('Toast creation & auto-dismissal', () => {
    it('creates a toast element in the DOM', () => {
      const button = document.createElement('button');
      button.id = 'test-btn';
      document.body.appendChild(button);

      showToast(button, 'Test message');

      const toast = document.getElementById('prompt-easy-toast');
      expect(toast).not.toBeNull();
      expect(toast?.textContent).toContain('Test message');
    });

    it('positions toast near the reference button', () => {
      const button = document.createElement('button');
      button.id = 'test-btn';
      document.body.appendChild(button);

      showToast(button, 'Test message');

      const toast = document.getElementById('prompt-easy-toast') as HTMLElement;
      expect(toast).not.toBeNull();
      expect(toast.style.position).toBe('absolute');
    });

    it('auto-dismisses after 3 seconds', () => {
      const button = document.createElement('button');
      button.id = 'test-btn';
      document.body.appendChild(button);

      showToast(button, 'Test message');

      expect(document.getElementById('prompt-easy-toast')).not.toBeNull();

      jest.advanceTimersByTime(3200);

      expect(document.getElementById('prompt-easy-toast')).toBeNull();
    });

    it('removes existing toast before creating a new one', () => {
      const button = document.createElement('button');
      button.id = 'test-btn';
      document.body.appendChild(button);

      showToast(button, 'First message');
      showToast(button, 'Second message');

      const toasts = document.querySelectorAll('#prompt-easy-toast');
      expect(toasts.length).toBe(1);
      expect(document.getElementById('prompt-easy-toast')?.textContent).toContain('Second message');
    });
  });

  describe('errorCode-aware messages', () => {
    it('returns user-friendly message for RATE_LIMITED', () => {
      const error = new Error('Daily limit reached');
      (error as any).errorCode = 'RATE_LIMITED';
      expect(getErrorMessage(error)).toBe('You have reached your free limit. Please try again later.');
    });

    it('returns user-friendly message for KEY_NOT_READY', () => {
      const error = new Error('API key not ready');
      (error as any).errorCode = 'KEY_NOT_READY';
      expect(getErrorMessage(error)).toBe('Setting up your API key... please try again in a moment.');
    });

    it('returns generic message for unknown errors', () => {
      const error = new Error('Something went wrong');
      expect(getErrorMessage(error)).toBe('Improving failed — please try again.');
    });

    it('returns generic message for NETWORK_ERROR', () => {
      const error = new Error('Network error');
      (error as any).errorCode = 'NETWORK_ERROR';
      expect(getErrorMessage(error)).toBe('Improving failed — please try again.');
    });
  });
});
