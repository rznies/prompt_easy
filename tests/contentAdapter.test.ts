import { BaseAdapter } from '../src/content/adapters/interface';

class TestAdapter extends BaseAdapter {
  name = 'TestAdapter';
  match() { return true; }
  getComposer() { return document.getElementById('composer') as HTMLElement; }
  getButtonStyles() { return {}; }
}

describe('BaseAdapter setText', () => {
  let adapter: TestAdapter;

  beforeEach(() => {
    adapter = new TestAdapter();
    document.body.innerHTML = '';
  });

  describe('textarea/input elements', () => {
    it('sets value and dispatches input/change events for textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.id = 'composer';
      document.body.appendChild(textarea);

      const inputEvents: Event[] = [];
      const changeEvents: Event[] = [];
      textarea.addEventListener('input', (e) => inputEvents.push(e));
      textarea.addEventListener('change', (e) => changeEvents.push(e));

      adapter.setText(textarea, 'test prompt');

      expect(textarea.value).toBe('test prompt');
      expect(inputEvents.length).toBe(1);
      expect(inputEvents[0].bubbles).toBe(true);
      expect(changeEvents.length).toBe(1);
      expect(changeEvents[0].bubbles).toBe(true);
    });

    it('sets value and dispatches input/change events for input', () => {
      const input = document.createElement('input');
      input.id = 'composer';
      document.body.appendChild(input);

      const inputEvents: Event[] = [];
      const changeEvents: Event[] = [];
      input.addEventListener('input', (e) => inputEvents.push(e));
      input.addEventListener('change', (e) => changeEvents.push(e));

      adapter.setText(input, 'test prompt');

      expect(input.value).toBe('test prompt');
      expect(inputEvents.length).toBe(1);
      expect(changeEvents.length).toBe(1);
    });
  });

  describe('contenteditable elements', () => {
    it('sets textContent and dispatches InputEvent for contenteditable', () => {
      const div = document.createElement('div');
      div.id = 'composer';
      div.contentEditable = 'true';
      document.body.appendChild(div);

      const inputEvents: InputEvent[] = [];
      div.addEventListener('input', (e) => inputEvents.push(e as InputEvent));

      adapter.setText(div, 'test prompt');

      expect(div.textContent).toBe('test prompt');
      expect(inputEvents.length).toBe(1);
      expect(inputEvents[0].bubbles).toBe(true);
      expect(inputEvents[0].inputType).toBe('insertText');
      expect(inputEvents[0].data).toBe('test prompt');
    });

    it('does not use document.execCommand', () => {
      const div = document.createElement('div');
      div.id = 'composer';
      div.contentEditable = 'true';
      document.body.appendChild(div);

      // If execCommand were used, it would throw in jsdom
      // The fact that setText succeeds and sets textContent proves it doesn't use execCommand
      expect(() => adapter.setText(div, 'test prompt')).not.toThrow();
      expect(div.textContent).toBe('test prompt');
    });
  });
});
