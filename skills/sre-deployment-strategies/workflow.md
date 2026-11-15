# Deployment Strategies Workflow

**Goal:** Guides the choice and setup of Blue-Green, Canary and Rolling Update deployment strategies with their rollback paths.

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

Guides on implementing and monitoring advanced deployment techniques like Blue-Green, Canary, and Rolling Updates.

## Instructions
1.  **Select Strategy**:
    -   **Rolling Update**: Standard Kubernetes strategy.
    -   **Canary**: Gradual traffic shift (requires Service Mesh or specialized CRDs like Argo Rollouts).
    -   **Blue-Green**: Instant switch between versions.
2.  **Strategy Status**:
    -   `kubectl get rollouts` (Argo Rollouts)
    -   Monitor success metrics (HTTP 2xx vs 5xx) during transition.
3.  **Health Verification**: 
    - Verify healthy startup before increasing traffic.
    - Automatically propose rollbacks if SLOs are breached.
4.  **Execution**:
    - Trigger rollout update or promotion.

{{ workflow.on_complete }}
