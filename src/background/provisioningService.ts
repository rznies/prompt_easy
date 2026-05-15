import { ConfigManager } from '../shared/configManager';
import { StorageWrapper } from '../shared/storage';

export class ProvisioningService {
  private static readonly LEGACY_SESSION_KEY = 'sessionApiKey';
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_DELAY_MS = 1000;
  private static readonly ALARM_NAME = 'daily-key-refresh';
  private static readonly LAST_KEY_CHECK_KEY = 'lastKeyCheck';
  private static readonly TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  static async handleInstalled(details: chrome.runtime.InstalledDetails): Promise<void> {
    if (details.reason === 'install') {
      const success = await this.fetchWithRetry();
      if (success) {
        await this.scheduleDailyAlarm();
      }
    } else if (details.reason === 'update') {
      await StorageWrapper.removeSession(this.LEGACY_SESSION_KEY);
      const success = await this.fetchWithRetry();
      if (success) {
        await this.scheduleDailyAlarm();
      }
    }
  }

  private static async fetchWithRetry(): Promise<boolean> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        await ConfigManager.ensureKey();
        await StorageWrapper.setLocal(this.LAST_KEY_CHECK_KEY, Date.now());
        return true;
      } catch {
        if (attempt < this.MAX_RETRIES) {
          const delay = this.BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }
    await StorageWrapper.setLocal('keyFetchFailed', true);
    return false;
  }

  private static async scheduleDailyAlarm(): Promise<void> {
    chrome.alarms.create(this.ALARM_NAME, { periodInMinutes: 24 * 60 });
  }

  static async handleAlarm(alarm: chrome.alarms.Alarm): Promise<void> {
    if (alarm.name !== this.ALARM_NAME) {
      return;
    }

    const lastCheck = await StorageWrapper.getLocal(this.LAST_KEY_CHECK_KEY);
    if (lastCheck && (Date.now() - lastCheck) < this.TWENTY_FOUR_HOURS_MS) {
      return;
    }

    await this.fetchWithRetry();
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static resetForTest(): void {
    ConfigManager.resetForTest();
  }
}
