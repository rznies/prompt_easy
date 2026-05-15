import { ServiceBus } from '../shared/serviceBus';
import { ConfigManager } from '../shared/configManager';
import { getImproveErrorDisplayMessage } from '../shared/improveError';

document.addEventListener('DOMContentLoaded', async () => {
  const improveBtn = document.getElementById('improveBtn') as HTMLButtonElement;
  const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
  const inputPrompt = document.getElementById('inputPrompt') as HTMLTextAreaElement;
  const outputPrompt = document.getElementById('outputPrompt') as HTMLTextAreaElement;
  const loadingOverlay = document.getElementById('loadingOverlay') as HTMLDivElement;
  const toast = document.getElementById('toast') as HTMLDivElement;
  const charCount = document.getElementById('charCount') as HTMLSpanElement;
  const tokenEstimate = document.getElementById('tokenEstimate') as HTMLSpanElement;

  let isKeyReady = false;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.textContent = message;
    toast.className = '';
    toast.classList.add(type === 'success' ? 'toast-success' : 'toast-error');
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  };

  const updateStats = () => {
    const text = inputPrompt.value;
    const chars = text.length;
    const tokens = Math.ceil(chars / 4);

    charCount.textContent = `${chars} characters`;
    tokenEstimate.textContent = `~${tokens} tokens`;

    improveBtn.disabled = !isKeyReady || chars === 0;
  };

  inputPrompt.addEventListener('input', updateStats);

  improveBtn.addEventListener('click', async () => {
    const text = inputPrompt.value.trim();
    if (!text) return;

    improveBtn.disabled = true;
    loadingOverlay.classList.remove('hidden');
    outputPrompt.value = '';
    copyBtn.disabled = true;

    try {
      const result = await ServiceBus.improvePrompt(text);
      outputPrompt.value = result;
      copyBtn.disabled = false;
      showToast('Prompt improved successfully!');
    } catch (error: any) {
      showToast(getImproveErrorDisplayMessage(error), 'error');
    } finally {
      loadingOverlay.classList.add('hidden');
      improveBtn.disabled = !isKeyReady || inputPrompt.value.trim().length === 0;
    }
  });

  copyBtn.addEventListener('click', async () => {
    const text = outputPrompt.value;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!');
    } catch (error) {
      showToast('Failed to copy to clipboard.', 'error');
    }
  });

  updateStats();

  try {
    await ConfigManager.ensureKey();
    isKeyReady = true;
    updateStats();
  } catch (error: any) {
    showToast(getImproveErrorDisplayMessage({ errorCode: 'KEY_NOT_READY', message: error.message }), 'error');
    improveBtn.disabled = true;
  }
});
