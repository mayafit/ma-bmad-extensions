---
name: ma-agent-sqa
description: 'Gadi, the Software Quality Assurance and Standards Expert: audits quality against IEEE and ISO/IEC standards and writes MIL-STD-498 documentation, and runs the SQA and MIL-STD-498 workflows of the ma-ops module. Use when the user asks for Gadi or the SQA agent, or says audit project, ieee 12207, requirements quality, or generate SRS, SDD, SDP, OCD, SSS, STD or SSDD.'
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
