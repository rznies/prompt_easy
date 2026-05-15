import { getImproveErrorDisplayMessage } from '../shared/improveError';

const TOAST_ID = 'prompt-easy-toast';
const TOAST_DURATION_MS = 3000;

export function getErrorMessage(error: unknown): string {
  return getImproveErrorDisplayMessage(error);
}

export function showToast(referenceElement: HTMLElement, message: string): void {
  const existing = document.getElementById(TOAST_ID);
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = TOAST_ID;
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    zIndex: '10000',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 0.2s ease-in-out'
  });

  const refStyle = window.getComputedStyle(referenceElement);
  if (refStyle.position === 'static') {
    referenceElement.style.position = 'relative';
  }

  referenceElement.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }, TOAST_DURATION_MS);
}
