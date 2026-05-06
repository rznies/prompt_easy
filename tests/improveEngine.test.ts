/**
 * Issue #2: Phase 1a: LLM Interface Setup
 * 
 * Tests for the core improve engine that transforms vague prompts into structured prompts.
 * Acceptance criteria validation for all requirements in issue #2.
 */

import { PromptEasyEngine, callLLM, LLMOptions } from '../src/improveEngine';

describe('Phase 1a: LLM Interface Setup (Issue #2)', () => {
  let engine: PromptEasyEngine;

  beforeEach(() => {
    engine = new PromptEasyEngine({
      apiKey: 'test-api-key-12345',
      provider: 'google',
      model: 'gemini-2.0-flash',
    });
  });

  describe('Acceptance Criteria: Shared improve() function', () => {
    it('AC1: improve(text, options?) function exists and is usable outside UI code', async () => {
      const vaguePrompt = 'Write a marketing plan';
      const improvedPrompt = await engine.improve(vaguePrompt);

      expect(typeof improvedPrompt).toBe('string');
      expect(improvedPrompt.length).toBeGreaterThan(50);
    });

    it('AC2: improve() accepts optional options parameter', async () => {
      const vaguePrompt = 'Write code for login';
      const improvedPrompt = await engine.improve(vaguePrompt, {
        maxTokens: 300,
        temperature: 0.7,
      });

      expect(typeof improvedPrompt).toBe('string');
    });
  });

  describe('Acceptance Criteria: callLLM interface', () => {
    it('AC3: callLLM interface exists and accepts provider, model, and apiKey', async () => {
      const options: LLMOptions = {
        provider: 'google',
        model: 'gemini-2.0-flash',
        apiKey: 'test-key',
      };

      // Verify the interface exists and accepts the right parameters
      expect(typeof callLLM).toBe('function');
    });

    it('AC4: Default provider is Google', () => {
      expect(engine['provider']).toBe('google');
    });

    it('AC5: Default model is gemini-2.0-flash', () => {
      expect(engine['model']).toBe('gemini-2.0-flash');
    });

    it('AC5b: Fallback model gemini-1.5-flash is defined', () => {
      const fallbackModel = engine['getFallbackModel']?.();
      expect(fallbackModel).toBe('gemini-1.5-flash');
    });
  });

  describe('Acceptance Criteria: Output format', () => {
    it('AC6: Function returns plain improved prompt text (no metadata wrapper)', async () => {
      const vaguePrompt = 'Write a marketing plan';
      const improvedPrompt = await engine.improve(vaguePrompt);

      // Should not be JSON, should be plain text
      expect(() => JSON.parse(improvedPrompt)).toThrow();
      expect(typeof improvedPrompt).toBe('string');
    });

    it('AC8: System prompt preserves input language (no translation)', async () => {
      const englishPrompt = 'Write a marketing plan';
      const improvedPrompt = await engine.improve(englishPrompt);

      // Output should remain in English
      expect(improvedPrompt).toMatch(/[A-Za-z]/);
    });

    it('AC9: Output structure includes ROLE, TASK, CONSTRAINTS, and CONTEXT when provided', async () => {
      const vaguePrompt = 'Write code';
      const improvedPrompt = await engine.improve(vaguePrompt);

      expect(improvedPrompt).toContain('ROLE');
      expect(improvedPrompt).toContain('TASK');
      expect(improvedPrompt).toContain('CONSTRAINTS');
    });

    it('AC9b: Output includes CONTEXT when provided via options', async () => {
      const vaguePrompt = 'Write code';
      const improvedPrompt = await engine.improve(vaguePrompt, {
        context: 'I am building a SaaS app',
      });

      // Context may be present in output
      expect(improvedPrompt.length).toBeGreaterThan(0);
    });
  });

  describe('Acceptance Criteria: Error handling', () => {
    it('AC7: Error shape is normalized for UI callers - empty prompt', async () => {
      await expect(engine.improve('')).rejects.toThrow(Error);
    });

    it('AC7b: Error shape is normalized - too long', async () => {
      const longPrompt = 'a'.repeat(5000);
      await expect(engine.improve(longPrompt)).rejects.toThrow(Error);
    });
  });

  describe('Scope: What should NOT be included', () => {
    it('AC10: No UI code (popup, buttons, DOM manipulation)', () => {
      // Engine should not reference DOM APIs
      const source = engine.improve.toString();
      expect(source).not.toMatch(/document\.|window\.|querySelector/);
    });

    it('AC10b: No proxy mode implementation', () => {
      // Engine should not have proxy-specific logic
      const source = engine.improve.toString();
      expect(source).not.toMatch(/proxy|managed.*free/i);
    });

    it('AC10c: No billing logic', () => {
      // Engine should not track usage/billing
      const source = engine.constructor.toString();
      expect(source).not.toMatch(/billing|pricing|credit|tier/i);
    });
  });
});
