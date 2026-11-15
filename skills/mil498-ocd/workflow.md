# MIL-STD-498 OCD Workflow

**Goal:** Generates a MIL-STD-498 Operational Concept Description (OCD, DI-IPSC-81430) from the project's planning artifacts through discovery, template, generation, validation, review and save.

## On Activation

### Step 1: Execute Prepend Steps

Execute each of these steps in order before proceeding (`_None._` means skip):

{{ workflow.activation_steps_prepend }}

### Step 2: Load Persistent Facts

Treat every entry below as foundational context you carry for the rest of the workflow run. Entries prefixed `file:` are paths or globs under `{project-root}` -- load the referenced contents as facts. All other entries are facts verbatim (`_None._` means none):

{{ workflow.persistent_facts }}

### Step 3: Execute Append Steps

Execute each of these steps in order (`_None._` means skip):

{{ workflow.activation_steps_append }}

Activation is complete after all activation steps have run.

> MIL-STD-498 Data Item Description: DI-IPSC-81430

## Workflow

This workflow generates a MIL-STD-498 OCD document through progressive steps.
The OCD describes the system from the user's and stakeholder's perspective, extracting operational concepts from existing project artifacts.

### Steps

1. Discover Project Artifacts: `{{ rendered("references/01-discover-project-artifacts.md") }}`
2. Load Template: `{{ rendered("references/02-load-template.md") }}`
3. Generate Document: `{{ rendered("references/03-generate-document.md") }}`
4. Validate: `{{ rendered("references/04-validate.md") }}`
5. Review: `{{ rendered("references/05-review.md") }}`
6. Save: `{{ rendered("references/06-save.md") }}`

### Template

Output template: `{{ rendered("assets/template.md") }}`

{{ workflow.on_complete }}
