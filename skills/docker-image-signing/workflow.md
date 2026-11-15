# Docker Image Signing Workflow

**Goal:** Signs Docker images with a certificate and key through cosign, by immutable digest, and verifies the signature afterwards.

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
Ensure the integrity and authenticity of Docker images by signing them with a cryptographic key/certificate. This prevents unauthorized image substitution and ensures only trusted images are deployed.

## Instructions
1.  **Tool Selection**: Use `cosign` (recommended) or `notary`.
2.  **Environment Check**: Verify that the signing tool and Docker/Podman are installed.
3.  **Signing Process**:
    - Load the provided certificate/key.
    - Run the signing command against the target image (using its SHA256 digest for immutability).
4.  **Verification**: Always run a verification check immediately after signing.

## Rules
- NEVER sign images by tag alone; use the immutable digest (e.g., `image@sha256:...`).
- Private keys must be handled as secrets and never stored in the clear.
- Ensure the certificate provided is valid and not expired.

## Usage
Run `bash {skill-root}/scripts/sign-image.sh <image> <cert> <key> [passphrase]` with:
- `IMAGE`: The image reference with digest.
- `CERT`: Path to the certificate file.
- `KEY`: Path to the private key file.
- `PASSPHRASE`: (Optional) Key passphrase.

{{ workflow.on_complete }}
