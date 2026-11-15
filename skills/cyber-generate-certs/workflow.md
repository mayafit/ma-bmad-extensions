# Secure Certificate Generation Workflow

**Goal:** Generates a Root CA and self-signed certificates with SANs through the self-signed-cert skill, then explains trust-store import and rotation.

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

Automated workflow for generating self-signed certificates using the `self-signed-cert` skill.

## Instructions
1.  **Load Skill**: Activate the `self-signed-cert` skill (a member of this module, installed beside this one at `{skill-root}/../self-signed-cert/`); its scripts are under that folder's `scripts/`.
2.  **Requirement Analysis**: Determine common name (CN) and Subject Alternative Names (SANs).
3.  **Execution**:
    - **Linux/macOS**:
        - `bash <self-signed-cert>/scripts/generate-cert.sh root my-internal-ca`
        - `bash <self-signed-cert>/scripts/generate-cert.sh cert my-service localhost`
    - **Windows**:
        - `pwsh <self-signed-cert>\scripts\generate-cert.ps1 -Type root -Name my-internal-ca`
        - `pwsh <self-signed-cert>\scripts\generate-cert.ps1 -Type cert -Name my-service -Dns localhost`
4.  **Packaging**: Provide instructions for importing the cert into trust stores (OS, Browsers) or mounting in Kubernetes secrets.
5.  **Security**: Ensure private keys are stored with restricted permissions (600).
6.  **Rotation**: Offer a schedule for certificate renewal.

{{ workflow.on_complete }}
