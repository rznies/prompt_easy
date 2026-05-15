# Issue Tracker

Issues for this repo are tracked in **GitHub** at `rznies/prompt_easy`.

## CLI

Use the `gh` CLI for all issue operations:

```bash
# List issues
gh issue list

# Create an issue
gh issue create --title "Title" --body "Description" --label "needs-triage"

# View an issue
gh issue view <number>

# Edit labels
gh issue edit <number> --add-label "ready-for-agent" --remove-label "needs-triage"
```

## Workflow

- New issues start with `needs-triage`
- The `triage` skill evaluates and moves issues through the state machine
- The `to-issues` skill converts plans/PRDs into GitHub issues
- The `to-prd` skill publishes PRDs as GitHub issues
