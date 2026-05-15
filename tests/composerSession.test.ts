import { ComposerSession } from '../src/content/composerSession';
import { BaseAdapter } from '../src/content/adapters/interface';

class TestAdapter extends BaseAdapter {
  name = 'TestAI';

  constructor(private readonly selector = '#composer') {
    super();
  }

  match() {
    return true;
  }

  getComposer() {
    return document.querySelector(this.selector) as HTMLElement | null;
  }

  getButtonStyles(): Partial<CSSStyleDeclaration> {
    return { right: '12px', bottom: '8px' };
  }
}

describe('ComposerSession', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('wraps supported site adapters for prompt read/write/focus', () => {
    const composer = document.createElement('textarea');
    composer.id = 'composer';
    composer.value = 'raw prompt';
    document.body.appendChild(composer);

    const session = ComposerSession.fromAdapter(new TestAdapter());

    expect(session).not.toBeNull();
    expect(session?.source).toBe('site-adapter');
    expect(session?.siteName).toBe('TestAI');
    expect(session?.buttonTitle).toBe('Improve Prompt on TestAI (Prompt Easy)');
    expect(session?.buttonStyles).toEqual({ right: '12px', bottom: '8px' });
    expect(session?.readPrompt()).toBe('raw prompt');

    session?.writePrompt('improved prompt');
    session?.focus();

    expect(composer.value).toBe('improved prompt');
    expect(document.activeElement).toBe(composer);
  });

  it('returns null when a supported site adapter has no composer', () => {
    const session = ComposerSession.fromAdapter(new TestAdapter('#missing'));

    expect(session).toBeNull();
  });

  it('uses a generic textarea composer on unsupported sites', () => {
    const composer = document.createElement('textarea');
    composer.value = 'fallback prompt';
    document.body.appendChild(composer);

    const session = ComposerSession.forFallback();

    expect(session).not.toBeNull();
    expect(session?.source).toBe('generic-fallback');
    expect(session?.siteName).toBeNull();
    expect(session?.readPrompt()).toBe('fallback prompt');

    session?.writePrompt('fallback improved');

    expect(composer.value).toBe('fallback improved');
  });

  it('uses a generic contenteditable composer on unsupported sites', () => {
    const composer = document.createElement('div');
    composer.setAttribute('contenteditable', 'true');
    composer.textContent = 'editable prompt';
    document.body.appendChild(composer);

    const inputEvents: InputEvent[] = [];
    composer.addEventListener('input', (event) => inputEvents.push(event as InputEvent));

    const session = ComposerSession.forFallback();

    expect(session?.readPrompt()).toBe('editable prompt');

    session?.writePrompt('editable improved');

    expect(composer.textContent).toBe('editable improved');
    expect(inputEvents).toHaveLength(1);
    expect(inputEvents[0].inputType).toBe('insertText');
  });

  it('returns null when no fallback composer exists', () => {
    const session = ComposerSession.forFallback();

    expect(session).toBeNull();
  });
});
