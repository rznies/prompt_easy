# Prompt Easy

A Chrome extension that improves prompts before sending them to AI chat interfaces.

## The Problem

Users don't know how to ask, so they get generic answers and waste time re-prompting. They write vague prompts ("marketing plan"), manually refine 2-3 times ("no, make it shorter"), and get stuck in clarification loops.

**5 seconds upfront → 2 minutes saved on clarification rounds.**

## Core Features

- **Improve Mode**: One-click rewrite using fixed template
- **Refine Mode**: 2-3 question popup to build a more complete prompt
- **Template**: Fixed scaffolding — role, task, output format, constraints
- **Memory**: Conversational context stored per domain (paid)
- **Context Cards**: User-defined context snippets injected into prompts

## Target Users

- **Power users (15%)**: Switch between ChatGPT, Claude, Perplexity daily. Pay $9-19/mo.
- **Casual users (85%)**: Top-of-funnel, free tier. Our distribution channel.

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 3/day, 10 improves on our key |
| Pro | $9/mo | Unlimited, 100-prompt library, memory, 3 custom templates |
| Team | $19/mo | + team sync (5 seats), priority models |

## Technical

- Client-side with hybrid API key model
- Default: BYOK (user brings their own key)
- Onboarding: 10 free improves on our key
- Site support: ChatGPT, Claude, Gemini, Perplexity

## Build Order

1. **Phase 1**: Prompt Improve Engine (backend LLM integration)
2. **Phase 2**: Manual Popup UI
3. **Phase 3**: Site Injection

## License

MIT