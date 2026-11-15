---
name: ma-ops-dev-epic
description: 'Orchestrates one epic of the ticket tree end to end: reads its stories with tickets.py, orders them into dependency waves, has bmad-agent-po start each story, builds it with bmad-build or bmad-build-auto, reviews it with bmad-code-review, bmad-review and bmad-walkthrough, has bmad-agent-po mark it done, then runs an epic-level review gate. Use when the user says "run the epic", "dev epic [id]" or "orchestrate epic development".'
---

Run the following command exactly once without changing the current working directory.

Replace `{project-root}` with the nearest folder containing `_bmad/`, from the working directory upward.
Replace `{skill-root}` with the absolute path to this skill's directory.

```bash
uv run --no-cache "{project-root}/_bmad/scripts/render_skill.py" --project-root "{project-root}" --skill "{skill-root}"
```

- The command prints the skill's workflow: follow it. `HALT: <reason>`: report the reason and stop.
- If the script does not exist, BMad is not set up in this project yet. Offer to set it up using `bmad` skill, then run the command again. If you do not have the `bmad` skill, offer to install it first.
- On any other output or failure, including `uv` being unavailable, report the command output and stop. Do not run any workflow source directly.
