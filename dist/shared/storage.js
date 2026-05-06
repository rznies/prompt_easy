"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageWrapper = void 0;
class StorageWrapper {
    static setLocal(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                resolve();
            });
        });
    }
    static getLocal(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                resolve(result[key]);
            });
        });
    }
    static setSession(key, value) {
        return new Promise((resolve) => {
            chrome.storage.session.set({ [key]: value }, () => {
                resolve();
            });
        });
    }
    static getSession(key) {
        return new Promise((resolve) => {
            chrome.storage.session.get([key], (result) => {
                resolve(result[key]);
            });
        });
    }
}
exports.StorageWrapper = StorageWrapper;
//# sourceMappingURL=storage.js.map