# Docker Compose Setup Workflow

**Goal:** Multi-container orchestration with Docker Compose for development and on-prem: services, networks, volumes, health checks and environment handling.

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

This workflow handles multi-container orchestration using Docker Compose, optimized for development and on-prem deployments.

## Instructions
1.  **Define Services**: Map application components to Docker services.
2.  **Environment Sync**: Setup `.env` file management for different environments (on-prem, dev).
3.  **Disconnected Operations**:
    - Build images with `--pull=false` if registry is unavailable.
    - Use local image tags.
4.  **Orchestration**:
    - Setup dependencies with `depends_on` and health checks.
    - Configure volumes for persistence.
5.  **Execution**:
    - `docker-compose up -d`
    - `docker-compose ps`

{{ workflow.on_complete }}
