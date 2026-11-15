# Image Signature Verification Workflow

**Goal:** Verifies Docker image signatures with cosign for supply-chain security, by digest, against the expected key.

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

This workflow guides the Cyber agent through verifying that a Docker image has been properly signed.

## Instructions
1.  **Identify Image**: Get the image name and digest.
2.  **Locate Public Key**: Obtain the public key or certificate used for signing.
3.  **Execute Verification**:
    - Use `cosign verify --key <public key> <image digest>`.
    - Check the output for valid signatures.
4.  **Policy Compliance**: Verify if the signing entity (certificate CN) matches the expected trusted authorities.
5.  **Report**: Alert the user if the image is unsigned or the signature is invalid.

{{ workflow.on_complete }}
