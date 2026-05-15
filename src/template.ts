export interface ContextCard {
  name: string;
  text: string;
}

export interface ImproveTemplateInput {
  context?: string;
  contextCards?: ContextCard[];
}

export const IMPROVE_TEMPLATE_SECTIONS = [
  'ROLE',
  'TASK',
  'OUTPUT FORMAT',
  'CONSTRAINTS',
] as const;

function hasText(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function buildContextCards(input: ImproveTemplateInput): ContextCard[] {
  const contextCards = (input.contextCards ?? [])
    .filter((card) => hasText(card.name) && hasText(card.text))
    .map((card) => ({
      name: card.name.trim(),
      text: card.text.trim(),
    }));

  if (hasText(input.context)) {
    contextCards.unshift({
      name: 'User Context',
      text: input.context.trim(),
    });
  }

  return contextCards;
}

function renderContextCards(contextCards: ContextCard[]): string {
  if (contextCards.length === 0) {
    return '';
  }

  const renderedCards = contextCards
    .map((card) => `- ${card.name}: ${card.text}`)
    .join('\n');

  return `

CONTEXT CARDS:
${renderedCards}`;
}

export function renderImproveTemplate(input: ImproveTemplateInput = {}): string {
  const contextCards = buildContextCards(input);
  const outputFormatLines = [
    '1. ROLE: Define a specific persona or expertise the AI should adopt',
    '2. TASK: Clarify the exact deliverable or action',
    '3. OUTPUT FORMAT: Specify format, length, tone',
    '4. CONSTRAINTS: Specify any specific requirements or limitations',
    ...(contextCards.length > 0
      ? ['5. CONTEXT: Inject the provided Context Cards only when they are relevant']
      : []),
  ];

  return `You are an expert prompt engineer. Your task is to improve the user's vague prompt into a structured, effective prompt.

OUTPUT FORMAT:
Return the improved prompt with exactly these sections:
${outputFormatLines.join('\n')}

IMPORTANT:
- Preserve the original language. Do NOT translate.
- Preserve the user's intent and important keywords.
- Return ONLY the improved prompt text.
- Target output around 200 tokens.${renderContextCards(contextCards)}`;
}
