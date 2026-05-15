# Context: Prompt Easy

## What is this?

A Chrome extension that improves prompts before sending them to AI chat interfaces.

## The Problem

Users don't know how to ask, so they get generic answers and waste time re-prompting. They write vague prompts ("marketing plan"), manually refine 2-3 times ("no, make it shorter"), and get stuck in clarification loops.

The pain is observable: watch anyone new to ChatGPT — first 5 minutes is trial-and-error prompting. Power users already have templates in Notion. We're productizing that habit.

## Core Terms

- **Improve mode**: One-click rewrite using fixed template
- **Refine mode**: 2-3 question popup overlay to build a more complete prompt
- **Template**: Fixed scaffolding added to every improved prompt — role, task, output format, constraints
- **Language**: Input language stays unchanged (no translation); only intent and keywords are preserved
- **Memory**: Conversational context from previous turns, stored per domain (paid feature)
- **Context Cards**: User-defined context snippets (e.g., "I'm building a marketing tool for SaaS") injected into improved prompts

## Value Proposition

5 seconds upfront → 2 minutes saved on clarification rounds.

Use on complex first prompts ("marketing plan", "write code"). Skip on short follow-ups.

## Target Users

**Power users (15% of market):** Switch between ChatGPT, Claude, Perplexity daily. Pay $9-19/mo. Need cross-AI memory and team sync. Our revenue source.

**Casual users (85% of market):** Top-of-funnel. Try free tier, realize they don't use AI enough, churn. Cost us $0.12/user/mo in LLM. Provide word-of-mouth and distribution. Some upgrade later when usage grows.

Product is for power users. Free tier is a Trojan horse — gets extension installed so we're there when casual becomes power user.

## How It Works

1. User copies prompt or (future) types in AI chat box
2. Clicks ✨ Improve button
3. Extension calls LLM with template rewrite instruction
4. Result returns to user
5. User pastes improved prompt → sends to AI

## Technical

- Client-side with hybrid API key model:
  - v1: BYOK only (users bring their Gemini API key)
  - v2: 3 free improves/day on our key, then BYOK or upgrade to Pro
- API keys stored in `chrome.storage.local` (persistent, extension-scoped); managed key fetched from remote JSON config endpoint (`{ "apiKey": "...", "version": N }`) on install
- Install-time key fetch retries with exponential backoff (3 attempts); falls back to lazy retry on first "Improve" click if all fail
- Key freshness checked once per 24h via `chrome.alarms`; startup checks are throttled by a `lastKeyCheck` timestamp in storage
- Legacy BYOK session keys are purged on extension update to prevent conflicting state
- Test suite uses `jest-fetch-mock` for HTTP call interception
- Config endpoint URL delivered as hardcoded constant in `src/shared/config.ts`
- `"alarms"` permission added to manifest for daily key freshness checks
- `onInstalled` discriminates by `reason`: `install` → fetch key only; `update` → purge legacy session key then fetch key; other reasons → no-op
- Usage stats tracked internally only; no stats display or "Clear History" button in popup UI
- Client-side device-scoped rate limiter: 3 free improves/day tracked in `chrome.storage.local` (`dailyUsageCount` + `usageDate`); soft limit for v1.0
- `MessageResponse` extended with `errorCode` field (`RATE_LIMITED`, `KEY_NOT_READY`, `NETWORK_ERROR`, `UNKNOWN`) for UI differentiation
- Jest test environment switched to `jsdom` with `jest-fetch-mock`
- In-flight config fetch Promise deduplication to prevent concurrent key fetches
- Single-view popup: no settings view, no gear icon, no back button — minimalist improve-only interface
- `ConfigManager` consolidates managed config (key + model) into single storage read; replaces `ApiKeyManager` and dead `SettingsStore` model methods
- Gemini REST API uses `systemInstruction` field for system prompt, `contents` array for user prompt
- `fetch()` timeouts use `AbortSignal.timeout()` for proper request cancellation
- Content script `alert()` replaced with inline non-blocking toast near Improve button
- `document.execCommand('insertText')` replaced with modern `InputEvent` dispatch for contenteditable composers
- Model is locked server-side via config envelope; no user model selection
- Service worker uses long-lived ports; popup disconnect aborts in-flight LLM requests
- LLM cost: ~$0.003 per improve (GPT-4o-mini, 500 tokens in/out)
- COGS: ~$0.12/free user/month (40 improves)
- Fallback selector list per site + MutationObserver for DOM changes
- Floating button fallback if injection fails
- Site selectors:
  - ChatGPT: `textarea#prompt-textarea`, `div[contenteditable]`
  - Claude: `div[contenteditable="true"].ProseMirror`
  - Gemini: `rich-textarea`

## Distribution

Primary: **communities + YouTube, not store browse.**

- Chrome Web Store discovery is dead — nobody searches "prompt improver"
- Go where users complain: r/ChatGPT, r/ClaudeAI, r/PromptEngineering
- YouTube tutorials: "Stop wasting time on bad ChatGPT prompts" — 3-min demo
- SEO: "ChatGPT prompt template for X" blog posts → demo at end
- Product Hunt: good for social proof and initial 500 installs, not sustained growth

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | BYOK: Unlimited improves. (v2: 3/day on our key), no library, no memory |
| Pro | $9/mo | 100-prompt library, memory, 3 custom templates |
| Team | $19/mo | + team sync (5 seats), priority models |

Teams >5: $7/seat/month

Monthly cap, not per-prompt.

**Why 3/day instead of 10/week:** Enough to test and create habit, not enough to rely on. When they hit day 4 and want to reuse yesterday's prompt, they hit the paywall — library is the hook, not the count.

## Moat (Defense)

The real moat is **being the prompt layer outside the AI vendors.**

- Cross-platform: Works in ChatGPT, Claude, Gemini, Perplexity + other apps
- Prompt library: Usage data creates habit (which prompts work, team metrics)
- Memory: Cross-AI context ("I'm building a marketing tool") — users switch AIs, we remember
- Team sync: Bottom-up adoption → team expands → ops pays

**Why AI vendors won't compete:** They want lock-in, not interoperability. OpenAI won't improve your Claude prompts. They focus on model quality, not prompt UX.

If OpenAI clones the feature for ChatGPT only, power users who switch between models still need us.

## Out of Scope

- Auto-translation
- Voice preservation (only intent preserved)
- Server-side for free tier (hybrid model with our key for onboarding only)
- Custom templates (paid)
- Team management (paid)
- Auto-tagging conversations (v1: manual "remember this" on good threads)

## Build Order

1. **Prompt improve engine** (backend): Take vague input → return structured prompt. Test with 50 real prompts, tune system prompt until output consistently better. That's the product.

2. **Manual popup UI**: No injection yet. User copies prompt, clicks extension, pastes, gets improved version, copies back. Clunky but validates core value in 2 days.

3. **Then injection**: Once improve quality is solid, add site detection and auto-inject. That's the polish, not the product.

If you start with injection, you'll spend a week fighting DOM changes for a feature nobody wants yet. Validate improve first — if people won't copy-paste for it, they won't install for it.