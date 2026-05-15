import { BaseAdapter } from './interface';

export class ChatGPTAdapter extends BaseAdapter {
  name = 'ChatGPT';
  match() { return window.location.host.includes('chatgpt.com'); }
  getComposer() { return document.querySelector('#prompt-textarea') as HTMLElement; }
  getButtonStyles(): Partial<CSSStyleDeclaration> {
    return { right: '40px', bottom: '10px' };
  }
}

export class ClaudeAdapter extends BaseAdapter {
  name = 'Claude';
  match() { return window.location.host.includes('claude.ai'); }
  getComposer() { return document.querySelector('div[contenteditable="true"].ProseMirror') as HTMLElement; }
  getButtonStyles(): Partial<CSSStyleDeclaration> {
    return { right: '12px', bottom: '12px' };
  }
}


export class GeminiAdapter extends BaseAdapter {
  name = 'Gemini';
  match() { return window.location.host.includes('gemini.google.com'); }
  getComposer() { 
    const rich = document.querySelector('rich-textarea');
    if (rich) {
      const editable = rich.querySelector('[contenteditable="true"]');
      if (editable) return editable as HTMLElement;
      return rich as HTMLElement;
    }
    return document.querySelector('textarea') as HTMLElement; 
  }
  getButtonStyles(): Partial<CSSStyleDeclaration> {
    return { right: '16px', bottom: '16px' };
  }
}

export class PerplexityAdapter extends BaseAdapter {
  name = 'Perplexity';
  match() { return window.location.host.includes('perplexity.ai'); }
  getComposer() { return document.querySelector('textarea[placeholder*="Ask"], textarea') as HTMLElement; }
  getButtonStyles(): Partial<CSSStyleDeclaration> {
    return { right: '12px', bottom: '12px' };
  }
}

export const ALL_ADAPTERS = [
  new ChatGPTAdapter(),
  new ClaudeAdapter(),
  new GeminiAdapter(),
  new PerplexityAdapter()
];

export function getActiveAdapter() {
  return ALL_ADAPTERS.find(a => a.match()) || null;
}
