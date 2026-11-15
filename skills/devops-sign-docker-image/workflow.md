# Docker Image Signing Workflow

**Goal:** Signs a Docker image by its immutable digest with a certificate and key through the docker-image-signing skill, then verifies the signature.

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

This workflow guides the DevOps agent through the process of cryptographically signing a Docker image.

## Instructions
1.  **Select Image**: Identify the image to sign.
2.  **Get Digest**: Retrieve the immutable digest: `docker inspect --format='{{ '{{' }}index .RepoDigests 0{{ '}}' }}' <image name>`.
3.  **Prepare Certificate**: Locate the certificate file provided by the user.
4.  **Execute Signing**:
    - Use the `docker-image-signing` skill.
    - That skill is a member of this module, installed beside this one (`{skill-root}/../docker-image-signing/`); run its `scripts/sign-image.sh <image digest> <cert file> <key file>` with bash.
5.  **Verify**: Confirm the signature using `cosign verify`.
6.  **Report**: provide the signed image reference to the user.

{{ workflow.on_complete }}
