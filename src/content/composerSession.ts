import { getActiveAdapter } from './adapters/registry';
import type { SiteAdapter } from './adapters/interface';

export type ComposerSource = 'site-adapter' | 'generic-fallback';

function findGenericComposer(): HTMLElement | null {
  return document.querySelector('textarea, input[type="text"], [contenteditable="true"]') as HTMLElement | null;
}

function readGenericText(composer: HTMLElement): string {
  if (composer instanceof HTMLTextAreaElement || composer instanceof HTMLInputElement) {
    return composer.value;
  }

  return composer.innerText || composer.textContent || '';
}

function writeGenericText(composer: HTMLElement, text: string): void {
  if (composer instanceof HTMLTextAreaElement || composer instanceof HTMLInputElement) {
    composer.value = text;
    composer.dispatchEvent(new Event('input', { bubbles: true }));
    composer.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }

  composer.textContent = text;
  composer.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
}

export class ComposerSession {
  readonly source: ComposerSource;

  constructor(
    private readonly composer: HTMLElement,
    private readonly adapter: SiteAdapter | null = null,
    source?: ComposerSource
  ) {
    this.source = source ?? (adapter ? 'site-adapter' : 'generic-fallback');
  }

  static forActiveSite(): ComposerSession | null {
    const adapter = getActiveAdapter();
    if (!adapter) {
      return null;
    }

    return this.fromAdapter(adapter);
  }

  static forFallback(): ComposerSession | null {
    const adapter = getActiveAdapter();
    const adapterSession = adapter ? this.fromAdapter(adapter) : null;
    if (adapterSession) {
      return adapterSession;
    }

    const composer = findGenericComposer();
    return composer ? new ComposerSession(composer) : null;
  }

  static fromAdapter(adapter: SiteAdapter): ComposerSession | null {
    const composer = adapter.getComposer();
    return composer ? new ComposerSession(composer, adapter, 'site-adapter') : null;
  }

  get siteName(): string | null {
    return this.adapter?.name ?? null;
  }

  get container(): HTMLElement | null {
    return this.composer.parentElement;
  }

  get buttonStyles(): Partial<CSSStyleDeclaration> {
    return this.adapter?.getButtonStyles() ?? {};
  }

  get buttonTitle(): string {
    return this.adapter
      ? `Improve Prompt on ${this.adapter.name} (Prompt Easy)`
      : 'Improve Prompt (Prompt Easy Fallback)';
  }

  readPrompt(): string {
    return this.adapter ? this.adapter.getText(this.composer) : readGenericText(this.composer);
  }

  writePrompt(text: string): void {
    if (this.adapter) {
      this.adapter.setText(this.composer, text);
      return;
    }

    writeGenericText(this.composer, text);
  }

  focus(): void {
    this.composer.focus();
  }
}
