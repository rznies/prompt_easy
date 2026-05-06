import { sendMessage } from '../shared/messaging';

document.addEventListener('DOMContentLoaded', () => {
  const testBtn = document.getElementById('test-bg');
  const statusEl = document.getElementById('status');

  if (testBtn && statusEl) {
    testBtn.addEventListener('click', async () => {
      try {
        const response = await sendMessage({ type: 'PING' });
        statusEl.textContent = `Response: ${response.data}`;
      } catch (error: any) {
        statusEl.textContent = `Error: ${error.message}`;
      }
    });
  }
});
