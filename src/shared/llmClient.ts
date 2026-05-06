export interface LLMOptions {
  provider: 'google' | 'openai';
  model: string;
  apiKey: string;
}

export async function callLLM(
  prompt: string,
  options: LLMOptions
): Promise<string> {
  const { provider, model, apiKey } = options;

  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (provider === 'google') {
    // TODO: Integrate with actual Google Gemini API
    // For now, return mock response with structured format
    return `ROLE: Expert assistant in the relevant domain
TASK: ${prompt.substring(0, 50)}...
OUTPUT FORMAT: Clear, structured text with sections
CONSTRAINTS: Be concise and actionable`;
  } else if (provider === 'openai') {
    // TODO: Integrate with actual OpenAI API
    throw new Error('OpenAI provider not yet implemented');
  }

  throw new Error(`Unknown provider: ${provider}`);
}
