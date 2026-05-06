"use strict";
/**
 * Core Improve Engine for Prompt Easy
 *
 * Transforms vague prompts into structured, effective prompts using LLM.
 * Issue #2: Phase 1a - LLM Interface Setup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptEasyEngine = void 0;
exports.callLLM = callLLM;
/**
 * Model-agnostic LLM interface
 *
 * Accepts provider, model, and API key to allow flexible provider/model swapping
 * without tightly coupling the improve engine to any specific provider.
 */
async function callLLM(prompt, options) {
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
    }
    else if (provider === 'openai') {
        // TODO: Integrate with actual OpenAI API
        throw new Error('OpenAI provider not yet implemented');
    }
    throw new Error(`Unknown provider: ${provider}`);
}
class PromptEasyEngine {
    constructor(config) {
        this.DEFAULT_MODEL = 'gemini-2.0-flash';
        this.FALLBACK_MODEL = 'gemini-1.5-flash';
        this.MAX_INPUT_TOKENS = 500;
        if (!config.apiKey) {
            throw new Error('API key is required');
        }
        this.apiKey = config.apiKey;
        this.provider = config.provider || 'google';
        this.model = config.model || this.DEFAULT_MODEL;
    }
    /**
     * Improves a vague prompt into a structured, effective prompt.
     *
     * Transforms user input into a prompt with clear ROLE, TASK, OUTPUT FORMAT,
     * CONSTRAINTS, and optional CONTEXT. Preserves input language.
     *
     * @param prompt - The vague input prompt
     * @param options - Optional configuration for the improvement
     * @returns A promise that resolves to the improved prompt (plain text, no wrapper)
     * @throws Error if prompt is empty, too long, or LLM call fails
     */
    async improve(prompt, options) {
        // Validate input
        this.validatePrompt(prompt);
        // Build system prompt that instructs the model to improve the prompt
        const systemPrompt = this.buildSystemPrompt(options?.context);
        // Call LLM with model-agnostic interface
        try {
            const improvedPrompt = await callLLM(systemPrompt + '\n\n' + prompt, {
                provider: this.provider,
                model: this.model,
                apiKey: this.apiKey,
            });
            // Return only the improved prompt text (no metadata wrapper)
            return improvedPrompt.trim();
        }
        catch (error) {
            // Normalize error shape for UI callers
            if (error instanceof Error) {
                throw new Error(`Failed to improve prompt: ${error.message}`);
            }
            throw new Error('Failed to improve prompt: Unknown error');
        }
    }
    /**
     * Get fallback model (used if primary model fails)
     */
    getFallbackModel() {
        return this.FALLBACK_MODEL;
    }
    /**
     * Validate prompt before sending to LLM
     */
    validatePrompt(prompt) {
        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Prompt cannot be empty');
        }
        // Estimate tokens (rough: 1 token ≈ 4 characters)
        const estimatedTokens = Math.ceil(prompt.length / 4);
        if (estimatedTokens > this.MAX_INPUT_TOKENS) {
            throw new Error(`Input exceeds ${this.MAX_INPUT_TOKENS} tokens (estimated ${estimatedTokens} tokens). Shorten and try.`);
        }
    }
    /**
     * Build system prompt that instructs the model to improve the user's prompt
     *
     * Preserves input language and returns structured prompt with ROLE, TASK,
     * OUTPUT FORMAT, CONSTRAINTS, and optional CONTEXT.
     */
    buildSystemPrompt(userContext) {
        const contextSection = userContext
            ? `\nOPTIONAL CONTEXT: ${userContext}`
            : '';
        return `You are an expert prompt engineer. Your task is to improve the user's vague prompt into a structured, effective prompt that will yield much better AI responses.

INPUT FORMAT:
- User's raw prompt (may be vague, incomplete, or poorly structured)${contextSection}

OUTPUT FORMAT:
Improve the prompt by adding:
1. ROLE: Define a specific persona or expertise the AI should adopt
2. TASK: Clarify the exact deliverable or action
3. OUTPUT FORMAT: Specify format, length, tone
4. CONSTRAINTS: Specify any specific requirements or limitations
${userContext ? '5. CONTEXT: Inject the provided user context' : ''}

IMPORTANT:
- Do NOT translate the input. Preserve the original language.
- Return ONLY the improved prompt. No explanations, no prefixes, no markdown unless part of the output format.
- Target output around 200 tokens.`;
    }
}
exports.PromptEasyEngine = PromptEasyEngine;
// Initialize global hook (in browser context)
if (typeof window !== 'undefined') {
    if (!window.promptEasy) {
        window.promptEasy = {
            improve: async (text, options) => {
                const engine = new PromptEasyEngine({
                    apiKey: 'test-key', // TODO: Get from storage in real implementation
                    provider: 'google',
                });
                return engine.improve(text, options);
            },
        };
    }
}
//# sourceMappingURL=improveEngine.js.map