# Vault Secrets Management Workflow

**Goal:** Manages secrets, policies and authentication methods in HashiCorp Vault.

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

This workflow guides the agent through managing secrets, policies, and authentication in HashiCorp Vault.

## Instructions
1.  **Check Connection**: Verify `vault status` and authentication.
2.  **Secret Creation/Update**:
    - `vault kv put secret/<path> <key>=<value>`
    - Ensure secrets are never logged or echoed in plain text.
3.  **Policy Management**:
    - Define HCL policies for restricted access.
    - `vault policy write <name> <policy file>`
4.  **Integration**:
    - Manage Kubernetes auth method: `vault auth enable kubernetes`
    - Setup Vault Agent injector configurations.
5.  **Audit**:
    - Check for expired tokens or orphaned secrets.
    - Review access logs if available.

{{ workflow.on_complete }}
