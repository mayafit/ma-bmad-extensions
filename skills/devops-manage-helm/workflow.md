# Helm Chart Management Workflow

**Goal:** Creates and manages Helm charts and umbrella charts for complex systems: structure, values, templates, linting and release.

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

This workflow handles the creation and management of Helm charts and Helm umbrellas for complex systems.

## Instructions
1.  **Analyze System**: Determine if a single chart or an umbrella chart (multiple sub-charts) is needed.
2.  **Chart Creation**: 
    - `helm create <chart name>`
    - Structure for disconnected environments: Ensure all chart dependencies are bundled (vendorized).
3.  **Helm Umbrella Setup**:
    - Configure `Chart.yaml` with sub-chart dependencies.
    - Setup `values.yaml` to override sub-chart values.
4.  **On-prem Optimization**:
    - Prepare `chart-save` and `chart-load` routines for air-gapped systems.
    - Configure local registry mirrors.
5.  **Validation**:
    - `helm lint <chart path>`
    - `helm template <chart path>`

{{ workflow.on_complete }}
