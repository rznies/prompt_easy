import { IMPROVE_TEMPLATE_SECTIONS, renderImproveTemplate } from '../src/template';

describe('Improve mode Template', () => {
  it('renders the default Template as a stable snapshot', () => {
    expect(renderImproveTemplate()).toMatchInlineSnapshot(`
"You are an expert prompt engineer. Your task is to improve the user's vague prompt into a structured, effective prompt.

OUTPUT FORMAT:
Return the improved prompt with exactly these sections:
1. ROLE: Define a specific persona or expertise the AI should adopt
2. TASK: Clarify the exact deliverable or action
3. OUTPUT FORMAT: Specify format, length, tone
4. CONSTRAINTS: Specify any specific requirements or limitations

IMPORTANT:
- Preserve the original language. Do NOT translate.
- Preserve the user's intent and important keywords.
- Return ONLY the improved prompt text.
- Target output around 200 tokens."
`);
  });

  it('requires the strict visible output sections', () => {
    const template = renderImproveTemplate();

    for (const section of IMPROVE_TEMPLATE_SECTIONS) {
      expect(template).toContain(section);
    }

    expect(template).toContain('Return the improved prompt with exactly these sections');
  });

  it('keeps Language preservation in the Template seam', () => {
    const template = renderImproveTemplate();

    expect(template).toContain('Preserve the original language');
    expect(template).toContain('Do NOT translate');
  });

  it('renders named Context Cards when provided', () => {
    const template = renderImproveTemplate({
      contextCards: [
        { name: 'Product', text: 'Prompt Easy improves prompts before AI chats.' },
        { name: 'Audience', text: 'Power users who switch between AI tools.' },
      ],
    });

    expect(template).toContain('5. CONTEXT');
    expect(template).toContain('CONTEXT CARDS');
    expect(template).toContain('Product: Prompt Easy improves prompts before AI chats.');
    expect(template).toContain('Audience: Power users who switch between AI tools.');
  });

  it('preserves legacy context as a named Context Card', () => {
    const template = renderImproveTemplate({ context: 'I am building a SaaS.' });

    expect(template).toContain('User Context: I am building a SaaS.');
  });
});
