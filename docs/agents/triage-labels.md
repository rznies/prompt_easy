# Triage Labels

The five canonical triage roles and their GitHub label strings:

| Role | Label String | Meaning |
|------|-------------|---------|
| Needs evaluation | `needs-triage` | Maintainer needs to review the issue |
| Waiting on reporter | `needs-info` | More information needed from the person who filed it |
| Ready for agent | `ready-for-agent` | Fully specified — an AFK agent can pick it up with no human context |
| Ready for human | `ready-for-human` | Needs a human to implement |
| Won't fix | `wontfix` | Will not be actioned |

## State Machine Flow

```
needs-triage → needs-info (waiting on reporter)
needs-triage → ready-for-agent (fully specified, agent-ready)
needs-triage → ready-for-human (needs human implementation)
needs-triage → wontfix (rejected)
```

## Notes

- Labels are applied via `gh issue edit <number> --add-label` / `--remove-label`
- No custom label overrides are configured — default strings are used
