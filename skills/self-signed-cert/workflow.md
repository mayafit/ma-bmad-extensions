# Self-Signed Certificate Generator Workflow

**Goal:** Generates secure self-signed certificates and Root CAs with OpenSSL (Bash and PowerShell scripts): 2048-bit or stronger keys, SHA-256, SANs, restricted key permissions.

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

## Purpose
Automate the creation of Root CAs and self-signed certificates for internal services, local development, and testing environments.

## Instructions
1.  **Environment Check**: Ensure `openssl` is installed and available in the PATH.
2.  **Workflow Selection**:
    - **Standalone Self-Signed**: Quickest for single service testing.
    - **Root CA + Signed Cert**: Recommended for internal architectures where multiple services need to trust a single authority.
3.  **Security Standards**:
    - Key Size: Minimum 2048-bit (4096-bit preferred).
    - Hashing: SHA-256 or higher.
    - Permissions: Private keys must be set to `600`.

## Rules
- NEVER store private keys in version control.
- ALWAYS include Subject Alternative Names (SANs) for modern browser compatibility.
- Ensure the certificate Common Name (CN) matches the intended hostname.

## Usage
The skill provide both Bash (Linux/macOS) and PowerShell (Windows) scripts.

### Linux / macOS
Run `bash {skill-root}/scripts/generate-cert.sh` with:
- `TYPE`: `root` or `cert`
- `NAME`: Base name for the files
- `DNS`: Primary domain/IP

Example: `bash {skill-root}/scripts/generate-cert.sh cert my-service localhost`

### Windows (PowerShell)
Run `pwsh {skill-root}\scripts\generate-cert.ps1` with:
- `-Type`: `root` or `cert`
- `-Name`: Base name
- `-Dns`: Primary domain/IP

Example: `pwsh {skill-root}\scripts\generate-cert.ps1 -Type cert -Name my-service -Dns localhost`

{{ workflow.on_complete }}
