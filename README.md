# Prompt Easy

A Chrome extension that improves prompts before sending them to AI chat interfaces.

## The Problem

Users don't know how to ask, so they get generic answers and waste time re-prompting. They write vague prompts ("marketing plan"), manually refine 2-3 times ("no, make it shorter"), and get stuck in clarification loops.

**5 seconds upfront → 2 minutes saved on clarification rounds.**

## Core Features

- **Improve Mode**: One-click rewrite using a fixed prompt template (role, task, output format, constraints)
- **Managed API Key**: Zero-friction onboarding — API key provisioned at install, no user setup required
- **Site Injection**: ✨ Improve button auto-injected into ChatGPT, Claude, Gemini, Perplexity
- **Toast Notifications**: Non-blocking, errorCode-aware feedback in content script
- **Rate Limiting**: 3 free improves/day on managed key (device-scoped)
- **Transparent Key Healing**: Automatic config refresh when API key is missing or stale

## Target Users

- **Power users (15%)**: Switch between ChatGPT, Claude, Perplexity daily. Pay $9-19/mo.
- **Casual users (85%)**: Top-of-funnel, free tier. Our distribution channel.

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | BYOK: unlimited improves. Managed key: 3/day |
| Pro | $9/mo | 100-prompt library, memory, 3 custom templates |
| Team | $19/mo | + team sync (5 seats), priority models |

Teams >5: $7/seat/month

## Architecture

```
src/
├── background/          # Service worker (extension lifecycle, event handling)
│   ├── service-worker.ts   # ServiceBus listener, key healing, rate limiting
│   └── provisioningService.ts  # Install-time key fetch, daily refresh alarm
├── content/             # Content script (site injection, composer interaction)
│   ├── content.ts          # Button injection, click handling, toast display
│   ├── toast.ts            # Non-blocking toast notifications
│   ├── composerSession.ts  # Composer discovery, prompt read/write abstraction
│   └── adapters/           # Site-specific adapters (ChatGPT, Claude, Gemini)
├── popup/               # Extension popup UI
│   ├── popup.html          # Single-view improve-only interface
│   └── popup.ts            # Improve button handler, ServiceBus client
├── shared/              # Shared modules (used across contexts)
│   ├── serviceBus.ts       # Typed IPC via long-lived ports
│   ├── configManager.ts    # Managed config fetch + caching
│   ├── promptEasyStorage.ts  # Centralized chrome.storage wrapper
│   ├── improveError.ts     # Typed error codes + user-friendly messages
│   ├── rateLimiter.ts      # Daily usage tracking
│   ├── reliableLLMClient.ts  # LLM API client with retry logic
│   └── storage.ts          # chrome.storage.session/local wrapper
├── improveEngine.ts     # PromptEasyEngine: validation, rate limiting, template, LLM call
└── template.ts          # Pure prompt template rendering + context cards
```

## Key Design Decisions

- **Managed key architecture**: API key fetched from remote config endpoint at install, stored in `chrome.storage.local`
- **Single-view popup**: No settings, no gear icon — minimalist improve-only interface
- **ServiceBus IPC**: Long-lived ports for disconnect awareness (popup close aborts in-flight requests)
- **Error normalization**: All errors flow through `ImproveError` with stable codes (`RATE_LIMITED`, `KEY_NOT_READY`, `NETWORK_ERROR`, etc.)
- **Modern text injection**: `InputEvent` dispatch for contenteditable (no deprecated `execCommand`)
- **CSP-compliant**: No inline scripts or handlers in popup HTML

## Development

### Prerequisites

- Node.js 18+
- Chrome or Chromium-based browser

### Local Development

1. Run `npm install` to install dependencies.
2. Run `npm run build` to compile the extension.
3. Open Chrome and go to `chrome://extensions/`.
4. Enable "Developer mode" in the top right corner.
5. Click "Load unpacked" and select the `dist/` directory from this project.

### Testing

```bash
npm test          # Run all tests
npm test -- <file>  # Run specific test file
```

Test suite: Jest + jsdom, 115+ tests covering storage, errors, rate limiting, service bus, improve engine, content script, and popup.

## Roadmap

### Phase 2 (Planned)

- **Refine Mode**: 2-3 question guided popup to build complete prompts
- **Context Cards Management**: User-defined context snippets UI
- **Prompt Library**: Save and reuse improved prompts (Pro)
- **Memory Per Domain**: Cross-AI conversational context (Pro)

### Phase 3 (Planned)

- **Custom Templates**: User-defined prompt templates (Pro)
- **Multi-User Support**: Team sync and shared libraries (Team)

## License

MIT
