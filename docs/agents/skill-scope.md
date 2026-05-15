# Skill Scope for prompt_easy

This document defines which agent skills are available when working in this repository. Only the skills listed below are loaded. All other skills are disabled at the repo level.

## Engineering Workflow (Matt Pocock)

- **diagnose** — Disciplined diagnosis loop for hard bugs and performance regressions: reproduce → minimise → hypothesise → instrument → fix → regression-test.
- **grill-with-docs** — Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates CONTEXT.md and ADRs inline.
- **triage** — Triage issues through a state machine of triage roles.
- **improve-codebase-architecture** — Find deepening opportunities in a codebase, informed by the domain language in CONTEXT.md and the decisions in docs/adr/.
- **setup-matt-pocock-skills** — Scaffold the per-repo config (issue tracker, triage label vocabulary, domain doc layout) that the other engineering skills consume.
- **tdd** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **to-issues** — Break any plan, spec, or PRD into independently-grabbable GitHub issues using vertical slices.
- **to-prd** — Turn the current conversation context into a PRD and submit it as a GitHub issue. No interview — just synthesizes what you've already discussed.
- **zoom-out** — Tell the agent to zoom out and give broader context or a higher-level perspective on an unfamiliar section of code.
- **prototype** — Build a throwaway prototype to flesh out a design — either a runnable terminal app for state/business-logic questions, or several radically different UI variations toggleable from one route.

## Technical Domain Knowledge

- **find-docs** — Retrieves authoritative, up-to-date technical documentation, API references, configuration details, and code examples for any developer technology.
- **context7** — Retrieve up-to-date documentation for software libraries, frameworks, and components via the Context7 API.
- **data-fetching** — Use when implementing or debugging ANY network request, API call, or data fetching. Covers fetch API, axios, React Query, SWR, error handling, caching strategies, offline support.

## UI Building & Design

- **frontend-ui-engineering** — Builds production-quality UIs. Use when building or modifying user-facing interfaces.
- **frontend-design** — Create distinctive, production-grade frontend interfaces with high design quality.
- **motion-design** — Applies motion design principles to create emotionally-driven, technically sound animations and transitions.
- **interface-guidelines** — Accessibility and interaction rules for building UIs.
- **design-polish** — Perform a meticulous final pass on UI code.
- **userinterface-wiki** — UI/UX best practices for web interfaces.
- **web-design-guidelines** — Review UI code for Web Interface Guidelines compliance.

## Code Quality

- **code-review-and-quality** — Conducts multi-axis code review. Use before merging any change.
- **code-simplification** — Simplifies code for clarity. Use when refactoring code for clarity without changing behavior.
- **incremental-implementation** — Delivers changes incrementally. Use when implementing any feature or change that touches more than one file.
- **git-workflow-and-versioning** — Structures git workflow practices. Use when making any code change.

## Security & Performance

- **security-and-hardening** — Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations.
- **performance-optimization** — Optimizes application performance. Use when performance requirements exist or when Core Web Vitals or load times need improvement.

## Marketing & Launch

- **copywriting** — Write, rewrite, or improve marketing copy for any page.
- **content-strategy** — Plan a content strategy, decide what content to create, or figure out what topics to cover.
- **launch-strategy** — Plan a product launch, feature announcement, or release strategy.
- **competitor-profiling** — Research, profile, or analyze competitors from their URLs.
- **pricing-strategy** — Help with pricing decisions, packaging, or monetization strategy.
- **social-content** — Create, schedule, or optimize social media content.
- **analytics-tracking** — Set up, improve, or audit analytics tracking and measurement.
- **page-cro** — Optimize, improve, or increase conversions on any marketing page.
- **seo-audit** — Audit, review, or diagnose SEO issues on a site.
- **ai-seo** — Optimize content for AI search engines, get cited by LLMs, or appear in AI-generated answers.
- **directory-submissions** — Submit product to startup, SaaS, AI, agent, MCP directories for backlinks and discovery.
- **lead-magnets** — Create, plan, or optimize a lead magnet for email capture or lead generation.
- **cold-email** — Write B2B cold emails and follow-up sequences that get replies.
- **competitor-alternatives** — Create competitor comparison or alternative pages for SEO and sales enablement.

## Video Production

- **remotion-best-practices** — Best practices for Remotion video creation in React.

## Web Research

- **firecrawl** — Handles all web operations: search, scraping, crawling, extraction, research. Replaces all built-in web tools.

## Browser Testing

- **browser-testing-with-devtools** — Tests in real browsers via Chrome DevTools MCP. Inspect DOM, capture console errors, analyze network requests, profile performance.
