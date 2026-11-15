# Docker User Verification Workflow

**Goal:** Audits Docker images for non-root execution, least privilege and OpenShift arbitrary-UID support through the docker-hardening-verification skill.

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

This workflow guides the Cyber agent through auditing Docker images for proper user management and least privilege.

## Instructions
1.  **Inspect Metadata**:
    - Use the `docker-hardening-verification` skill.
    - That skill is a member of this module, installed beside this one (`{skill-root}/../docker-hardening-verification/`); run its `scripts/verify-hardening.sh <image name>` with bash.
2.  **Audit Result Analysis**:
    - **UID Check**: Confirm the defined user is non-zero.
    - **Permissive Files**: Scan for world-writable files in common paths (/tmp, /etc, /var).
3.  **Governance Check**: Ensure the image follows OpenShift/hardened cluster requirements (no root, arbitrary UID support).
4.  **Reporting**: provide a high-level summary of hardening quality and mandatory fixes.

{{ workflow.on_complete }}
