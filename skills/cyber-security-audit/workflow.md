# Security Audit Workflow

**Goal:** Comprehensive security audit of infrastructure and application configuration against OWASP, CIS and NIST guidance, with findings by severity.

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

Deep-dive audit of infrastructure and application configuration.

## Instructions
1.  **Infrastructure Audit**:
    - **K8s**: Check for privileged containers, missing network policies, root users.
    - **Docker**: Check for exposed ports, unnecessary packages in images.
2.  **Code Audit**:
    - Static Analysis (SAST) for common patterns (SQLi, XSS).
    - Check for insecure defaults in frameworks.
3.  **Identity Audit**:
    - Review ServiceAccount permissions (RBAC).
    - Check for hard-coded credentials.
4.  **Final Recommendation**: 
    - Provide a prioritized list of hardening tasks.
    - Propose CIDCD guardrails.

{{ workflow.on_complete }}
