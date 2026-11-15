# Confluence Root Page Record Workflow

**Goal:** Report that this build of `ma-atlassian-confluence-record-root-page` is a placeholder of the skill (Story 38.1; the record arrives with Story 38.4), and stop.

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

## Workflow

1. Tell the user: "`ma-atlassian-confluence-record-root-page` in this version of the `ma-atlassian` module is a placeholder; its workflow is not available yet." Change no file.
2. Stop.
