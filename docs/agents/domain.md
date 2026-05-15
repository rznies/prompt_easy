# Domain Docs

## Layout

This repo uses a **single-context** layout:

- `CONTEXT.md` at the repo root — product domain, terminology, value proposition, technical architecture
- `docs/adr/` at the repo root — architectural decision records (created as decisions are made)

## Consumer Rules

Skills that read domain docs (`improve-codebase-architecture`, `diagnose`, `tdd`, `grill-with-docs`) follow these rules:

1. **Read `CONTEXT.md` first** — understand the product, users, and technical constraints before making changes
2. **Check `docs/adr/` for past decisions** — don't contradict recorded decisions without good reason
3. **Use the domain language** — use the terms defined in `CONTEXT.md` when naming variables, functions, and writing comments
4. **Don't invent new terms** — if a concept isn't in `CONTEXT.md`, use the closest existing term or propose an addition

## CONTEXT.md Location

`CONTEXT.md` is at the repo root. There is no `CONTEXT-MAP.md` — this is not a multi-context monorepo.
