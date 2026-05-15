import * as fs from 'fs';
import * as path from 'path';

describe('Popup Single-View', () => {
  const htmlPath = path.join(__dirname, '../src/popup/popup.html');
  const tsPath = path.join(__dirname, '../src/popup/popup.ts');

  let htmlContent: string;
  let tsContent: string;

  beforeAll(() => {
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    tsContent = fs.readFileSync(tsPath, 'utf-8');
  });

  describe('HTML structure', () => {
    it('contains only a single view (improveView)', () => {
      expect(htmlContent).toContain('id="improveView"');
      expect(htmlContent).not.toContain('id="settingsView"');
    });

    it('has no settings-related elements', () => {
      expect(htmlContent).not.toContain('goToSettingsBtn');
      expect(htmlContent).not.toContain('backToImproveBtn');
      expect(htmlContent).not.toContain('apiKeyInput');
      expect(htmlContent).not.toContain('saveKeyBtn');
      expect(htmlContent).not.toContain('keyStatus');
      expect(htmlContent).not.toContain('modelSelect');
      expect(htmlContent).not.toContain('statTotalCalls');
      expect(htmlContent).not.toContain('statTokensIn');
      expect(htmlContent).not.toContain('statTokensOut');
      expect(htmlContent).not.toContain('clearStatsBtn');
    });

    it('has core improve elements', () => {
      expect(htmlContent).toContain('id="inputPrompt"');
      expect(htmlContent).toContain('id="improveBtn"');
      expect(htmlContent).toContain('id="outputPrompt"');
      expect(htmlContent).toContain('id="copyBtn"');
    });

    it('is CSP-compliant (no inline scripts or handlers)', () => {
      expect(htmlContent).not.toMatch(/<script>(.*?)<\/script>/s);
      expect(htmlContent).not.toMatch(/<script[^>]*>[\s\S]+?<\/script>/);
      expect(htmlContent).not.toMatch(/on\w+="[^"]*"/);
      expect(htmlContent).not.toContain('https://');
    });
  });

  describe('TypeScript code', () => {
    it('has no settings-related code', () => {
      expect(tsContent).not.toContain('settingsView');
      expect(tsContent).not.toContain('goToSettingsBtn');
      expect(tsContent).not.toContain('backToImproveBtn');
      expect(tsContent).not.toContain('saveKeyBtn');
      expect(tsContent).not.toContain('clearStatsBtn');
      expect(tsContent).not.toContain('apiKeyInput');
      expect(tsContent).not.toContain('modelSelect');
      expect(tsContent).not.toContain('keyStatus');
      expect(tsContent).not.toContain('loadSettings');
      expect(tsContent).not.toContain('updateKeyStatus');
      expect(tsContent).not.toContain('showView');
    });

    it('calls ConfigManager.ensureKey() on initialization', () => {
      expect(tsContent).toContain('ConfigManager.ensureKey()');
    });

    it('tracks key-ready state to prevent premature button enable', () => {
      expect(tsContent).toContain('isKeyReady');
      expect(tsContent).toContain('!isKeyReady');
    });

    it('updates button state after key is confirmed', () => {
      expect(tsContent).toContain('isKeyReady = true');
      expect(tsContent).toContain('updateStats()');
    });
  });
});
