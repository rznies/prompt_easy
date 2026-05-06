/**
 * Core Improve Engine for Prompt Easy
 *
 * Transforms vague prompts into structured, effective prompts using LLM.
 * Issue #2: Phase 1a - LLM Interface Setup
 */
export interface LLMOptions {
    provider: 'google' | 'openai';
    model: string;
    apiKey: string;
}
export interface ImproveOptions {
    maxTokens?: number;
    temperature?: number;
    context?: string;
}
export interface ImproveEngineConfig {
    apiKey: string;
    provider?: 'google' | 'openai';
    model?: string;
}
/**
 * Model-agnostic LLM interface
 *
 * Accepts provider, model, and API key to allow flexible provider/model swapping
 * without tightly coupling the improve engine to any specific provider.
 */
export declare function callLLM(prompt: string, options: LLMOptions): Promise<string>;
export declare class PromptEasyEngine {
    private apiKey;
    private provider;
    private model;
    private readonly DEFAULT_MODEL;
    private readonly FALLBACK_MODEL;
    private readonly MAX_INPUT_TOKENS;
    constructor(config: ImproveEngineConfig);
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
    improve(prompt: string, options?: ImproveOptions): Promise<string>;
    /**
     * Get fallback model (used if primary model fails)
     */
    private getFallbackModel;
    /**
     * Validate prompt before sending to LLM
     */
    private validatePrompt;
    /**
     * Build system prompt that instructs the model to improve the user's prompt
     *
     * Preserves input language and returns structured prompt with ROLE, TASK,
     * OUTPUT FORMAT, CONSTRAINTS, and optional CONTEXT.
     */
    private buildSystemPrompt;
}
/**
 * Global namespace for browser console testing
 * Entry point: window.promptEasy.improve(text, options?)
 *
 * This allows developers to test the improve engine from the browser console
 * without needing to build the full UI.
 */
declare global {
    interface Window {
        promptEasy: {
            improve: (text: string, options?: ImproveOptions) => Promise<string>;
        };
    }
}
//# sourceMappingURL=improveEngine.d.ts.map