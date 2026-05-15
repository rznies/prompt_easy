export interface SiteAdapter {
  /** The human-readable name of the site */
  name: string;
  /** Returns true if the current page matches this site */
  match(): boolean;
  /** Finds the composer element in the DOM */
  getComposer(): HTMLElement | null;
  /** Extracts text from the composer */
  getText(composer: HTMLElement): string;
  /** Sets text in the composer and triggers necessary events */
  setText(composer: HTMLElement, text: string): void;
  /** Returns styling for the absolute-positioned button */
  getButtonStyles(): Partial<CSSStyleDeclaration>;
}

export abstract class BaseAdapter implements SiteAdapter {
  abstract name: string;
  abstract match(): boolean;
  abstract getComposer(): HTMLElement | null;
  abstract getButtonStyles(): Partial<CSSStyleDeclaration>;

  getText(composer: HTMLElement): string {
    if (composer instanceof HTMLTextAreaElement || composer instanceof HTMLInputElement) {
      return composer.value;
    }
    return composer.innerText || composer.textContent || '';
  }

  setText(composer: HTMLElement, text: string): void {
    if (composer instanceof HTMLTextAreaElement || composer instanceof HTMLInputElement) {
      composer.value = text;
      composer.dispatchEvent(new Event('input', { bubbles: true }));
      composer.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      composer.textContent = text;
      composer.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    }
  }
}
