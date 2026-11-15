# Docker Hardening Verification Workflow

**Goal:** Audits a Docker image for security best practices: non-root user, least privilege, capabilities, exposed ports and OpenShift arbitrary-UID compliance.

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
Audit Docker images to ensure they follow security best practices, specifically focusing on non-root execution and least privilege principles required for hardened clusters like OpenShift.

## Instructions
1.  **Inspect Image**: Use `docker inspect` or `podman inspect` to check metadata.
2.  **Verify User**: 
    - Ensure `USER` is defined and is NOT `root` or `0`.
    - Recommended: Use a high-numbered UID (e.g., `1001`).
3.  **Check Permissions**:
    - Ensure sensitive directories are not world-writable.
    - Check for `setuid`/`setgid` bits on binaries.
4.  **OpenShift Compliance**:
    - Verify that the image doesn't require specific UIDs if it's meant to run with an arbitrary assigned UID (OpenShift's default).
    - Check if the `/etc/passwd` entry handles arbitrary UIDs (e.g., by using `nss_wrapper` or similar).

## Rules
- Fail the audit if `USER root` is detected.
- Flag a warning if many unnecessary packages/tools are present.
- Ensure only necessary ports are exposed.

## Usage
Run `bash {skill-root}/scripts/verify-hardening.sh <image name>`

{{ workflow.on_complete }}
