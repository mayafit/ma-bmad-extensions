# MIL-STD-498 SSDD Workflow

**Goal:** Generates a MIL-STD-498 System/Subsystem Design Description (SSDD, DI-IPSC-81432) with a CSCI decomposition interview, through discovery, template, generation, validation, review and save.

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

> MIL-STD-498 Data Item Description: DI-IPSC-81432

## Workflow

This workflow generates a MIL-STD-498 SSDD document through progressive steps.
The SSDD describes the system-level design — how the system is organized into components (HWCIs, CSCIs, and manual operations) and how they interact.

### Steps

1. Discover Project Artifacts: `{{ rendered("references/01-discover-project-artifacts.md") }}`
2. Load Template: `{{ rendered("references/02-load-template.md") }}`
3. CSCI Discovery Interview: `{{ rendered("references/03-csci-discovery-interview.md") }}`
4. Generate Document: `{{ rendered("references/04-generate-document.md") }}`
5. Validate: `{{ rendered("references/05-validate.md") }}`
6. Review: `{{ rendered("references/06-review.md") }}`
7. Save: `{{ rendered("references/07-save.md") }}`

### Template

Output template: `{{ rendered("assets/template.md") }}`

{{ workflow.on_complete }}
