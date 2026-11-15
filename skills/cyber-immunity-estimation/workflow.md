# Immunity Estimation Workflow

**Goal:** Assesses the overall security posture and immunity of a system against common attack vectors and rates each area.

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

Assesses the overall security posture and 'immunity' of the system against common attack vectors.

## Instructions
1.  **Attack Surface Analysis**: Identify all entry points (APIs, UI, SSH, 3rd party integrations).
2.  **Control Verification**:
    - Authentication/Authorization presence.
    - Encryption in transit and at rest.
    - Secret management maturity (Hardcoded vs Vault).
3.  **Posture Scoring**: Rate 1-10 on:
    - Code quality/Sanitization.
    - Dependency health.
    - Infrastructure hardening.
    - Visibility/Logging.
4.  **Immunity Report**:
    - Summarize major gaps.
    - Provide a roadmap for reach 'Immunity Level 5' (Robust).
5.  **Verification**: Recommend automated regression tests for security controls.

{{ workflow.on_complete }}
