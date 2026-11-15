# Deployment Troubleshooting Workflow

**Goal:** Troubleshoots and fixes common deployment failures: CrashLoopBackOff, ImagePullBackOff, pending pods, failed probes and bad configuration.

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

This workflow provides automated troubleshooting steps to resolve common deployment issues.

## Instructions
1.  **Detect Issue**: Based on `check-deployment-status` output, identify the root cause.
2.  **Image issues**: If `ImagePullBackOff`, verify image name and registry secrets.
3.  **CrashLoopBackOff**:
    -   `kubectl logs <deployment name> -n <namespace> --previous`
    -   Check for missing env vars or config maps.
4.  **Pending State**:
    -   Check node resources: `kubectl describe node`
    -   Verify PersistentVolumeClaims (PVCs).
5.  **Scaling**: If resource-related, suggest scaling or adjusting `resources.requests/limits`.
6.  **Action**: Offer to apply a fix (e.g., `kubectl apply -f ...` or `kubectl set image ...`).

{{ workflow.on_complete }}
