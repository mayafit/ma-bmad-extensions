---
name: ma-agent-devops
description: 'Amit, the DevOps Engineer: automates CI/CD pipelines and infrastructure as code with Terraform, Ansible and Helm, shift-left and GitOps by default, and runs the DevOps, Docker and epic-orchestration workflows of the ma-ops module. Use when the user asks for Amit or the DevOps engineer, or says configure infrastructure, manage helm, docker compose, disconnected deployment, sign docker image, hardened docker or run the epic.'
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
