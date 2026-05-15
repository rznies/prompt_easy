import { ServiceBus } from '../shared/serviceBus';
import { getActiveAdapter } from './adapters/registry';

console.log('Prompt Easy: Content script initialized with ServiceBus');

const BUTTON_ID = 'prompt-easy-improve-btn';
const FALLBACK_ID = 'prompt-easy-fallback-btn';
const IMPROVE_ICON = '⚡';

let isFallbackHidden = false;

function debounce(fn: Function, ms = 500) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Injects a floating fallback button when normal injection fails or site is unsupported
 */
function injectFloatingButton() {
  if (isFallbackHidden || document.getElementById(FALLBACK_ID)) return;

  const button = document.createElement('button');
  button.id = FALLBACK_ID;
  button.type = 'button';
  button.innerHTML = `${IMPROVE_ICON} Improve`;
  button.title = 'Improve Prompt (Prompt Easy Fallback)';
  
  Object.assign(button.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '9999',
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s, background-color 0.2s'
  });

  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '×';
  closeBtn.style.fontSize = '18px';
  closeBtn.style.marginLeft = '4px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    isFallbackHidden = true;
    button.remove();
  };
  button.appendChild(closeBtn);

  button.onclick = async () => {
    const adapter = getActiveAdapter();
    const composer = (adapter?.getComposer() || document.querySelector('textarea, [contenteditable="true"]')) as HTMLElement;
    
    const text = (adapter && composer) ? adapter.getText(composer) : (composer ? (composer as any).value || (composer as HTMLElement).innerText : '');
    
    if (!text.trim()) {
      alert('Could not find prompt text. Please type something first.');
      return;
    }

    try {
      button.disabled = true;
      button.style.opacity = '0.7';

      const result = await ServiceBus.improvePrompt(text);

      if (adapter && composer) {
        adapter.setText(composer, result);
        (composer as HTMLElement).focus();
      } else if (composer) {
        if (composer instanceof HTMLTextAreaElement) composer.value = result;
        else (composer as HTMLElement).innerText = result;
        (composer as HTMLElement).focus();
      } else {
        navigator.clipboard.writeText(result);
        alert('Improved prompt copied to clipboard!');
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      button.disabled = false;
      button.style.opacity = '1';
    }
  };


  document.body.appendChild(button);
}

/**
 * Main injection logic using Site Adapters
 */
function injectImproveButton() {
  const adapter = getActiveAdapter();
  if (!adapter) {
    injectFloatingButton();
    return;
  }

  const composer = adapter.getComposer() as HTMLElement;
  if (!composer) {
    const oldBtn = document.getElementById(BUTTON_ID);
    if (oldBtn) oldBtn.remove();
    injectFloatingButton();
    return;
  }

  const fallback = document.getElementById(FALLBACK_ID);
  if (fallback) fallback.remove();

  const container = composer.parentElement;
  if (!container) return;

  const existingBtn = document.getElementById(BUTTON_ID);
  if (existingBtn && existingBtn.parentElement === container) return;

  if (existingBtn) existingBtn.remove();

  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.innerHTML = IMPROVE_ICON;
  button.title = `Improve Prompt on ${adapter.name} (Prompt Easy)`;
  
  Object.assign(button.style, {
    position: 'absolute',
    zIndex: '1000',
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    ...adapter.getButtonStyles()
  });

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const text = adapter.getText(composer).trim();
    if (!text) return;

    try {
      button.innerHTML = '<span class="prompt-easy-spinner"></span>';
      button.disabled = true;

      const result = await ServiceBus.improvePrompt(text);
      adapter.setText(composer, result);
      composer.focus();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      button.innerHTML = IMPROVE_ICON;
      button.disabled = false;
    }
  });

  const containerStyle = window.getComputedStyle(container);
  if (containerStyle.position === 'static') {
    container.style.position = 'relative';
  }
  
  container.appendChild(button);
}

// Initial injection
injectImproveButton();

const debouncedInject = debounce(injectImproveButton, 500);
const observer = new MutationObserver(() => debouncedInject());
observer.observe(document.body, { childList: true, subtree: true });
setInterval(debouncedInject, 3000);
