export class StorageWrapper {
  static setLocal(key: string, value: any): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  static getLocal(key: string): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }

  static setSession(key: string, value: any): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.session.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  static getSession(key: string): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.session.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }
}
