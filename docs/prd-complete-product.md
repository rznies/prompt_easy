# PRD: Prompt Easy — Complete Product

## Problem Statement

Users don't know how to write effective prompts for AI chat interfaces. They write vague prompts like "marketing plan" or "write code" and receive generic responses, leading to time-wasting clarification loops.

**The pain is observable:** Watch anyone new to ChatGPT — the first 5 minutes is trial-and-error prompting. Power users already have templates in Notion. We're productizing that habit.

**Value proposition:** 5 seconds upfront → 2 minutes saved on clarification rounds.

**When to use:** Complex first prompts ("marketing plan", "write code"). Skip on short follow-ups.

## Solution

A Chrome extension that improves prompts before sending them to AI chat interfaces. The product follows a phased build order:

1. **Phase 1 — Improve Engine**: Backend LLM integration that takes vague input → returns structured output (testable from console)
2. **Phase 2 — Manual Popup UI**: Extension popup with copy/paste workflow (validates core value)
3. **Phase 3 — Site Injection**: Auto-detect AI sites and inject the improve button directly into the chat interface

## Core Terms

- **Improve mode**: One-click rewrite using fixed template
- **Refine mode**: 2-3 question popup overlay to build a more complete prompt
- **Template**: Fixed scaffolding added to every improved prompt — role, task, output format, constraints
- **Language**: Input language stays unchanged (no translation); only intent and keywords are preserved
- **Memory**: Conversational context from previous turns, stored per domain (paid feature)
- **Context Cards**: User-defined context snippets (e.g., "I'm building a marketing tool for SaaS") injected into improved prompts

## Target Users

**Power users (15% of market):** Switch between ChatGPT, Claude, Perplexity daily. Pay $9-19/mo. Need cross-AI memory and team sync. Our revenue source.

**Casual users (85% of market):** Top-of-funnel. Try free tier, realize they don't use AI enough, churn. Cost us $0.12/user/mo in LLM. Provide word-of-mouth and distribution. Some upgrade later when usage grows.

**Product is for power users.** Free tier is a Trojan horse — gets extension installed so we're there when casual becomes power user.

## User Stories

### Phase 1: Improve Engine

1. As a user, I want to call `promptEasy.improve(text)` with my vague prompt and receive a structured, more effective prompt, so that I get better AI responses.

2. As a user, I want to provide my own Gemini API key (BYOK) so that I have full control over my usage and don't rely on limited free tier.

3. As a user, I want to use the 10-free onboarding without providing my own key, so that I can try the product immediately.

4. As a user, I want my API key to be encrypted at rest, so that even if someone gains access to my browser storage, they cannot use my key.

5. As a system, I want to track remaining free uses locally, so that the proxy mode can enforce the 10-free limit.

6. As a system, I want to handle errors gracefully (invalid key, rate limits, quota exceeded), so that users understand what went wrong and how to fix it.

7. As a developer, I want the engine to be model-agnostic via a `callLLM(prompt, {provider, model, apiKey})` interface, so that we can swap providers or models without refactoring.

8. As a developer, I want to test the improve engine from browser console via `window.promptEasy.improve(text, options)`, so that I can iterate on the system prompt without building UI.

9. As a system, I want to re-prompt for the API key if the session key is lost (e.g., after browser restart), so that users can authenticate again.

10. As a system, I want to track usage statistics (total calls, estimated tokens) locally, so that I can show users their consumption.

### Phase 2: Manual Popup UI

11. As a user, I want to click the extension icon and see a popup with input/output text areas, so that I can paste my prompt, improve it, and copy the result.

12. As a user, I want to see a character/token count for my input, so that I know if I'm approaching the limit.

13. As a user, I want a loading state while the improve engine is processing, so that I know the system is working.

14. As a user, I want one-click copy of the improved prompt to clipboard, so that I can quickly paste it into the AI chat.

15. As a user, I want to toggle between Improve mode (one-click) and Refine mode (guided questions), so that I can choose my preferred workflow.

16. As a user, I want to add/edit/delete Context Cards in the popup, so that I can define context snippets to inject into my prompts.

17. As a user, I want to see remaining free uses in the popup, so that I know how many more I have.

18. As a user, I want to enter and save my API key in the popup settings, so that I can use BYOK mode.

### Phase 3: Site Injection

19. As a user, I want the improve button to appear automatically when I visit ChatGPT, Claude, Gemini, or Perplexity, so that I can improve my prompt without leaving the site.

20. As a user, I want the button to inject into the correct DOM element (textarea or contenteditable) on each site, so that it works reliably.

21. As a user, I want a floating button fallback to appear if site injection fails, so that I can still improve my prompt.

22. As a system, I want to detect which AI site the user is on and use the appropriate DOM selector, so that injection works across multiple sites.

23. As a system, I want to observe DOM changes and re-inject the button if the chat interface reloads, so that the button persists across conversations.

### Refine Mode

24. As a user, I want to answer 2-3 questions in a popup overlay to build my prompt incrementally, so that I can create more complete prompts through guided interaction.

25. As a user, I want to see the questions adapt based on my previous answers, so that I don't get redundant questions.

26. As a user, I want to skip Refine and go straight to Improve, so that I can choose the faster path.

### Context Cards

27. As a user, I want to create a Context Card with a name and text snippet, so that I can define reusable context for my prompts.

28. As a user, I want to select which Context Card(s) to apply to a prompt, so that I can inject relevant context.

29. As a user, I want to edit and delete existing Context Cards, so that I can manage my collection.

### Memory (Pro feature)

30. As a Pro user, I want the system to remember context from previous turns within the same domain, so that I don't have to repeat background info.

31. As a Pro user, I want memory to be stored per-domain (chatgpt.com, claude.ai, etc.), so that context doesn't leak between different AI platforms.

### Template System (Pro feature)

32. As a Pro user, I want to create and save custom templates, so that I can have personalized prompt scaffolding.

33. As a Pro user, I want to switch between the default template and my custom templates, so that I can choose what works for me.

34. As a Pro user, I want up to 3 custom templates, so that I have options for different prompt types.

### Prompt Library (Pro feature)

35. As a Pro user, I want to save my improved prompts to a library, so that I can reuse them later.

36. As a Pro user, I want to search and filter my saved prompts, so that I can find what I need.

37. As a Pro user, I want up to 100 saved prompts in my library, so that I have enough storage for my use cases.

### Team Features (Team tier)

38. As a Team admin, I want to invite team members (up to 5 seats), so that we can share the extension.

39. As a Team admin, I want to see team usage metrics, so that I can monitor adoption.

40. As a Team user, I want to access team-shared Context Cards and templates, so that I can leverage team resources.

41. As a Team user, I want priority access to faster models, so that I get better performance.

### Authentication & Billing

42. As a user, I want to upgrade to Pro or Team from within the extension, so that I can access paid features.

43. As a user, I want my usage to persist across browser sessions, so that I don't lose my history.

## Implementation Decisions

### Architecture

- **Manifest V3**: Chrome extension with service worker
- **Storage**: chrome.storage.local for persistent data, chrome.storage.session for sensitive session data
- **Module Pattern**: `window.promptEasy` namespace with improve(), setKey(), getStats(), etc.

### Phase 1: Improve Engine

```
Entry Point: window.promptEasy.improve(text, options?) → Promise<string>
Interface: callLLM(prompt, {provider, model, apiKey})
- Provider defaults to "google"
- Model defaults to "gemini-2.0-flash" (fallback: gemini-1.5-flash)
```

### Phase 2: Popup UI

- Popup HTML with input textarea, output textarea, improve button, refine button
- Settings panel for API key, Context Cards management
- Usage display (free uses remaining)
- Toast notifications for copy success, errors

### Phase 3: Site Injection

| Site | DOM Selector |
|------|--------------|
| ChatGPT | `textarea#prompt-textarea`, `div[contenteditable]` |
| Claude | `div[contenteditable="true"].ProseMirror` |
| Gemini | `rich-textarea` |
| Perplexity | (to be determined) |

- MutationObserver to watch for DOM changes
- Fallback: floating toolbar button if injection fails

### Storage Schema

```typescript
interface StorageSchema {
  // Phase 1: Improve Engine
  encryptedApiKey?: string;
  keyIv?: string;
  freeUsesRemaining: number;
  totalCalls: number;
  estimatedTokensIn: number;
  estimatedTokensOut: number;
  preferredProvider: "google" | "openai";
  preferredModel: string;

  // Phase 2: Context Cards
  contextCards: ContextCard[];

  // Phase 2+: Memory (per domain)
  memory: Record<string, MemoryEntry[]>;

  // Phase 2+: Templates (Pro)
  customTemplates: Template[];

  // Phase 2+: Library (Pro)
  savedPrompts: SavedPrompt[];

  // Team features
  teamId?: string;
  teamRole?: "admin" | "member";
  teamSharedCards?: ContextCard[];
  teamSharedTemplates?: Template[];
}

interface ContextCard {
  id: string;
  name: string;
  text: string;
  createdAt: number;
}

interface MemoryEntry {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Template {
  id: string;
  name: string;
  systemPrompt: string;
}

interface SavedPrompt {
  id: string;
  original: string;
  improved: string;
  createdAt: number;
  tags?: string[];
}
```

### Authentication Modes

| Mode | Key Source | Storage | Encryption |
|------|-----------|---------|------------|
| BYOK | User-provided | chrome.storage.local (ciphertext) | AES-GCM |
| Proxy | Our backend | No key stored | N/A |

### Encryption Flow

1. On extension install: Generate AES-GCM key via `crypto.subtle.generateKey()`, store in `chrome.storage.session`
2. On key set (BYOK): Encrypt user's API key with session key → store ciphertext + IV in `chrome.storage.local`
3. On session clear: Session key lost → prompt user for key again on next use

### System Prompt (Improve Mode)

Target output: ∼200 tokens

```
You are an expert prompt engineer. Your task is to improve the user's vague prompt into a structured, effective prompt that will yield much better AI responses.

INPUT FORMAT:
- User's raw prompt (may be vague, incomplete, or poorly structured)
- Optional context: "Context: <user-defined context>" if provided

OUTPUT FORMAT:
Improve the prompt by adding:
1. ROLE: Define a specific persona or expertise the AI should adopt
2. TASK: Clarify the exact deliverable or action
3. CONSTRAINTS: Specify format, length, tone, or specific requirements
4. CONTEXT: Inject relevant background if provided

Return ONLY the improved prompt. No explanations, no prefixes, no markdown unless part of the output format.
```

### Refine Mode Flow

1. User clicks "Refine" → popup overlay with Question 1
2. User answers → Question 2 appears (context-aware)
3. User answers → Question 3 appears (if applicable)
4. User submits → improved prompt generated
5. User can copy result or send directly (if injection enabled)

### Site Injection Strategy

1. On page load, check if URL matches known AI sites
2. If match, attempt injection using site-specific selector
3. If injection fails, show floating button
4. MutationObserver watches for dynamic content changes
5. Re-inject button when new chat session starts

### Error Handling

| Error Type | User Message | Recovery |
|------------|--------------|----------|
| Invalid API key | "API key invalid. Please check and re-enter." | Prompt for new key |
| Rate limited | "Rate limited. Wait a moment and try again." | Exponential backoff |
| Quota exceeded | "Quota exceeded. Add your own key or upgrade." | Switch to BYOK or show upgrade |
| Network error | "Network error. Check connection." | Retry with backoff |
| Input too long | "Input exceeds 500 tokens. Shorten and try." | Truncate or reject |
| Session lost | "Session expired. Please re-enter your API key." | Prompt for key |
| Injection failed | "Could not inject button. Use floating button instead." | Show fallback |

### Pricing Logic

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 3/day (21/week), no library, no memory, 10 improves on our key |
| Pro | $9/mo | Unlimited, 100-prompt library, memory, 3 custom templates |
| Team | $19/mo | + team sync (5 seats), priority models |

- Free tier: 3 improves/day, resets at midnight
- Free tier: 10 "onboarding" uses on our key (one-time, for users without API key)
- Pro/Team: Monthly cap, not per-prompt

## Testing Decisions

### Phase 1 Test Modules

1. **improve() function**: Call with sample prompts, validate output structure
2. **encryption flow**: Encrypt → decrypt, verify ciphertext ≠ plaintext
3. **storage operations**: Save/load, verify persistence
4. **error handling**: Each error type, verify appropriate message
5. **system prompt**: Test with/without context, various input lengths
6. **proxy mode**: Mock proxy response, verify fallback behavior

### Phase 2 Test Modules

1. **popup render**: Verify all UI elements render correctly
2. **copy to clipboard**: Test copy button functionality
3. **Context Cards CRUD**: Create, read, update, delete operations
4. **usage display**: Verify free uses shown correctly
5. **mode toggle**: Switch between Improve and Refine

### Phase 3 Test Modules

1. **site detection**: Verify correct site identified for each URL
2. **DOM injection**: Verify button appears in correct location per site
3. **MutationObserver**: Verify button re-injects after DOM changes
4. **floating fallback**: Verify appears when injection fails

### Test Strategy

- **External behavior only**: Test input → output, not implementation details
- **Golden inputs**: Use real prompts from target use cases
- **Output validation**: Check structure (role, task, constraints, context) not exact wording

## Out of Scope

- **Auto-translation**: Input language stays as-is
- **Voice preservation**: Only intent preserved, not voice
- **Server-side for free tier**: Hybrid model with our key for onboarding only
- **Team management beyond 5 seats**: $7/seat/month for additional
- **Auto-tagging conversations**: v1: manual "remember this" only

## Further Notes

- **Build order matters**: Validate improve engine (Phase 1) before building UI (Phase 2) before injection (Phase 3). If people won't copy-paste for it, they won't install for it.
- **Distribution**: Primary is communities + YouTube, not Chrome Web Store browse. Go where users complain: r/ChatGPT, r/ClaudeAI, r/PromptEngineering.
- **Moat**: Being the prompt layer outside the AI vendors — cross-platform, memory, library, team sync. AI vendors won't compete because they want lock-in, not interoperability.
- **Technical debt**: MutationObserver may need tuning per-site as AI sites update their DOM structure. Plan for maintenance.