import { ServiceBus } from '../shared/serviceBus';
import { ApiKeyManager } from '../shared/apiKeyManager';
import { SettingsStore } from '../shared/settingsStore';

document.addEventListener('DOMContentLoaded', () => {
  // Views
  const improveView = document.getElementById('improveView') as HTMLDivElement;
  const settingsView = document.getElementById('settingsView') as HTMLDivElement;

  // Buttons
  const goToSettingsBtn = document.getElementById('goToSettingsBtn') as HTMLButtonElement;
  const backToImproveBtn = document.getElementById('backToImproveBtn') as HTMLButtonElement;
  const improveBtn = document.getElementById('improveBtn') as HTMLButtonElement;
  const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
  const saveKeyBtn = document.getElementById('saveKeyBtn') as HTMLButtonElement;
  const clearStatsBtn = document.getElementById('clearStatsBtn') as HTMLButtonElement;

  // Inputs
  const inputPrompt = document.getElementById('inputPrompt') as HTMLTextAreaElement;
  const outputPrompt = document.getElementById('outputPrompt') as HTMLTextAreaElement;
  const apiKeyInput = document.getElementById('apiKeyInput') as HTMLInputElement;
  const modelSelect = document.getElementById('modelSelect') as HTMLSelectElement;

  // Displays
  const charCount = document.getElementById('charCount') as HTMLSpanElement;
  const tokenEstimate = document.getElementById('tokenEstimate') as HTMLSpanElement;
  const loadingOverlay = document.getElementById('loadingOverlay') as HTMLDivElement;
  const toast = document.getElementById('toast') as HTMLDivElement;
  const keyStatus = document.getElementById('keyStatus') as HTMLDivElement;
  const statTotalCalls = document.getElementById('statTotalCalls') as HTMLSpanElement;
  const statTokensIn = document.getElementById('statTokensIn') as HTMLSpanElement;
  const statTokensOut = document.getElementById('statTokensOut') as HTMLSpanElement;

  // View Switching
  const showView = (view: 'improve' | 'settings') => {
    if (view === 'improve') {
      improveView.classList.remove('hidden');
      settingsView.classList.add('hidden');
      updateStats();
    } else {
      improveView.classList.add('hidden');
      settingsView.classList.remove('hidden');
      loadSettings();
    }
  };

  goToSettingsBtn.addEventListener('click', () => showView('settings'));
  backToImproveBtn.addEventListener('click', () => showView('improve'));

  const updateStats = () => {
    const text = inputPrompt.value;
    const chars = text.length;
    const tokens = Math.ceil(chars / 4);
    
    charCount.textContent = `${chars} characters`;
    tokenEstimate.textContent = `~${tokens} tokens`;
    
    improveBtn.disabled = chars === 0;
  };

  inputPrompt.addEventListener('input', updateStats);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.textContent = message;
    toast.className = ''; 
    toast.classList.add(type === 'success' ? 'toast-success' : 'toast-error');
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  };

  const loadSettings = async () => {
    try {
      // Check API Key Status
      try {
        await ApiKeyManager.getKey();
        updateKeyStatus('configured', 'API key active');
      } catch (error: any) {
        if (error.message.includes('No API key')) {
          updateKeyStatus('missing', 'Not configured');
        } else if (error.message.includes('Session key lost')) {
          updateKeyStatus('expired', 'Session expired - re-enter key');
        } else {
          updateKeyStatus('missing', 'Error checking key');
        }
      }

      // Load Preferred Model via SettingsStore
      modelSelect.value = await SettingsStore.getPreferredModel();

      // Load Usage Stats via SettingsStore
      const stats = await SettingsStore.getUsageStats();
      statTotalCalls.textContent = stats.totalCalls.toString();
      statTokensIn.textContent = stats.estimatedTokensIn.toLocaleString();
      statTokensOut.textContent = stats.estimatedTokensOut.toLocaleString();

    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateKeyStatus = (status: 'configured' | 'missing' | 'expired', text: string) => {
    const dot = keyStatus.querySelector('.status-dot') as HTMLSpanElement;
    const statusText = keyStatus.querySelector('.status-text') as HTMLSpanElement;
    
    dot.className = 'status-dot';
    if (status === 'configured') dot.classList.add('green');
    else if (status === 'missing') dot.classList.add('grey');
    else if (status === 'expired') dot.classList.add('orange');
    
    statusText.textContent = text;
  };

  saveKeyBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      showToast('Please enter an API key', 'error');
      return;
    }

    try {
      saveKeyBtn.disabled = true;
      saveKeyBtn.textContent = 'Saving...';
      
      await ApiKeyManager.storeKey(key);
      apiKeyInput.value = '';
      updateKeyStatus('configured', 'API key active');
      showToast('API key saved securely!');
    } catch (error: any) {
      showToast(`Failed to save key: ${error.message}`, 'error');
    } finally {
      saveKeyBtn.disabled = false;
      saveKeyBtn.textContent = 'Save API Key';
    }
  });

  modelSelect.addEventListener('change', async () => {
    await SettingsStore.setPreferredModel(modelSelect.value);
    showToast('Model preference saved');
  });

  clearStatsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear your usage history?')) {
      await SettingsStore.resetUsage();
      loadSettings();
      showToast('History cleared');
    }
  });

  improveBtn.addEventListener('click', async () => {
    const text = inputPrompt.value.trim();
    if (!text) return;

    improveBtn.disabled = true;
    loadingOverlay.classList.remove('hidden');
    outputPrompt.value = '';
    copyBtn.disabled = true;

    try {
      // Use ServiceBus for the transformation
      const result = await ServiceBus.improvePrompt(text);
      outputPrompt.value = result;
      copyBtn.disabled = false;
      showToast('Prompt improved successfully!');
    } catch (error: any) {
      showToast(error.message || 'An unexpected error occurred.', 'error');
    } finally {
      loadingOverlay.classList.add('hidden');
      improveBtn.disabled = false;
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
});

