# Day 2 Operations Workflow

**Goal:** Day 2 operations and maintenance for long-term cluster stability: upgrades, certificate rotation, backups, capacity and housekeeping.

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

Focuses on long-term stability, cluster-to-config verification, and periodic maintenance.

## Instructions
1.  **Config Verification**:
    - Check current cluster status against the master configuration templates.
    - Verify consistency of secrets, configmaps, and resource limits.
2.  **Resource Optimization**:
    - Review `top nodes` and `top pods`.
    - Identify over-provisioned or under-utilized resources.
3.  **Maintenance Tasks**:
    - Node drain/uncordon (safe handling).
    - Certificate rotation check.
4.  **Automation**: Propose cronjobs for periodic backups or diagnostic reports.

{{ workflow.on_complete }}
