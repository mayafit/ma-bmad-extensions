# System Status Check Workflow

**Goal:** Overall health check of the cluster or container host: nodes, workloads, resource pressure and recent failures, across container runtimes.

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

This workflow provides a high-level overview of the health of the container runtime and orchestration environment.

## Instructions
1.  **Detect Runtime**: Check if reachable:
    -   `kubectl cluster-info` (Kubernetes)
    -   `docker info` (Docker)
    -   `podman info` (Podman)
2.  **Resource Overview**:
    -   **K8s**: `kubectl get nodes`, `kubectl get pods -A | grep -v Running`
    -   **Docker**: `docker ps`, `docker stats --no-stream`
    -   **Podman**: `podman ps`, `podman stats --no-stream`
3.  **Cross-Platform Diagnostics**:
    -   Check for resource exhaustion (High CPU/Memory).
    -   Verify network connectivity between key services.
4.  **Summary Table**: Present a status table of all detected environments.

{{ workflow.on_complete }}
