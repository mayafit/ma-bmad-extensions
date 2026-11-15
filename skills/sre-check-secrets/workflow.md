# Secret Debugging Workflow

**Goal:** Finds and resolves Kubernetes Secret problems: visibility, mounting, RBAC and missing keys, without printing sensitive values.

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

This workflow helps identify and resolve problems related to Kubernetes Secrets.

## Instructions
1.  **Check Visibility**: `kubectl get secret -n <namespace>`
2.  **Verify Mounting**:
    -   Check if the deployment actually mounts the secret.
    -   `kubectl get deployment <deployment name> -o yaml | grep secret`
3.  **Check Permissions**: Verify ServiceAccount has permissions to read the secret (RBAC).
4.  **Content Verification**: (Safety first!) Offer to check if keys exist WITHOUT displaying sensitive values unless explicitly requested.
    -   `kubectl get secret <name> -n <namespace> -o jsonpath='{.data}'`
5.  **Common Errors**: Look for "Secret not found" or "Authorization" errors in pod events.

{{ workflow.on_complete }}
