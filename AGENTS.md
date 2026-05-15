# AGENTS.md

This is the local instruction layer for the prompt_easy repository.

## Agent skills

### Issue tracker

Issues tracked in GitHub (rznies/prompt_easy) via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: CONTEXT.md + docs/adr/ at repo root. See `docs/agents/domain.md`.

### Skill scope

Only the skills listed in `docs/agents/skill-scope.md` are available in this repository. All other skills are disabled at the repo level. Before loading any skill, check it against this list. If a skill is not in the scope file, do not use it.
