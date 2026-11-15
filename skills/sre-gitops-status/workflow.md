# GitOps Status Workflow

**Goal:** Monitors GitOps synchronisation and detects drift between Git and the cluster with ArgoCD or Flux.

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

This workflow monitors and reports the synchronization state between your git repository and the cluster using ArgoCD or Flux.

## Instructions
1.  **Identify Tool**: Detect if ArgoCD or Flux is in use.
2.  **Sync Status**:
    -   **ArgoCD**: `argocd app list`, `argocd app get <app name>`
    -   **Flux**: `flux get kustomizations`, `flux get helmreleases`
3.  **Drift Detection**:
    -   Identify "OutOfSync" resources.
    -   Compare live state with desired state in git.
4.  **Action**:
    -   Offer to trigger a sync: `argocd app sync <app name>` or `flux reconcile kustomization <name>`.
    -   Analyze reasons for permanent drift (e.g., manual cluster changes).

{{ workflow.on_complete }}
