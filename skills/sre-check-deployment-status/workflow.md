# Deployment Status Check Workflow

**Goal:** Checks the status of a Kubernetes deployment across environments: replicas, rollout history, pod state and recent events.

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

This workflow guides the agent through checking the status of a specific deployment in a Kubernetes cluster.

## Parameters
- `<namespace>`: The namespace of the deployment (default: `default`)
- `<deployment name>`: The name of the deployment to check

## Instructions
1.  **Identify Resource**: Determine the `<deployment name>` and `<namespace>` from user input or context.
2.  **Run Diagnostics**:
    -   `kubectl get deployment <deployment name> -n <namespace>`
    -   `kubectl describe deployment <deployment name> -n <namespace>`
3.  **Check Pods**:
    -   `kubectl get pods -l app=<deployment name> -n <namespace>`
    -   Identify any pods that are NOT in `Running` state.
4.  **Analyze Events**:
    -   Look at the `Events` section of the `describe` output for error messages (e.g., `ImagePullBackOff`, `CrashLoopBackOff`).
5.  **Report**:
    -   Summarize the current status.
    -   Highlight any issues found.
    -   Suggest next steps (e.g., "Check logs", "Check resource limits").

{{ workflow.on_complete }}
