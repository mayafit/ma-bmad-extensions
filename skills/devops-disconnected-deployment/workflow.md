# Disconnected Deployment Workflow

**Goal:** Deploys applications in air-gapped or restricted on-prem environments: image export and import, chart packaging, local registries and offline dependencies.

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

Strategies and actions for deploying applications in air-gapped or restricted on-prem environments.

## Instructions
1.  **Dependency Gathering**:
    - Identify all required container images.
    - Export images: `docker save <image list> | gzip > images.tar.gz`
    - Package Helm charts: `helm package <chart path>`
2.  **Target Readiness**:
    - Verify local registry availability.
    - Import images: `docker load < images.tar.gz`
3.  **Deployment**:
    - Use `--set image.repository=<local registry>/<repo>` for Helm.
    - Verify offline connectivity between components.
4.  **Troubleshooting**:
    - Check for 'ImagePullBackOff' due to incorrect registry paths.

{{ workflow.on_complete }}
