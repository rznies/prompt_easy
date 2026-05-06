"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messaging_1 = require("../shared/messaging");
document.addEventListener('DOMContentLoaded', () => {
    const testBtn = document.getElementById('test-bg');
    const statusEl = document.getElementById('status');
    if (testBtn && statusEl) {
        testBtn.addEventListener('click', async () => {
            try {
                const response = await (0, messaging_1.sendMessage)({ type: 'PING' });
                statusEl.textContent = `Response: ${response.data}`;
            }
            catch (error) {
                statusEl.textContent = `Error: ${error.message}`;
            }
        });
    }
});
//# sourceMappingURL=popup.js.map