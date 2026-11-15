# Infrastructure Configuration Workflow

**Goal:** Defines and configures core infrastructure components in Kubernetes: namespaces, ingress, storage, networking and resource policies, as code.

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

This workflow focuses on defining and configuring core infrastructure components in a Kubernetes environment.

## Instructions
1.  **Storage Definition**:
    - Define `PersistentVolume` (PV) with appropriate access modes and storage classes.
    - Define `PersistentVolumeClaim` (PVC) for application workloads.
2.  **Networking**:
    - Configure `Service` type `LoadBalancer` or `Ingress` controllers.
    - Define `NetworkPolicies` for secure communication.
3.  **Disconnected Environments**:
    - Provide templates for local storage provisioners (e.g., hostPath, Local Persistent Volumes).
    - Configure static IP assignments for on-prem load balancers.
4.  **Validation**:
    - Verify binding status: `kubectl get pv,pvc`
    - Verify endpoint availability: `kubectl get endpoints`

{{ workflow.on_complete }}
