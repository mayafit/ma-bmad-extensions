# Open Presentation Workflow

**Goal:** Open the training deck for the user.

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

## Flow

The deck ships with this skill: `{skill-root}/assets/BMAD_AI_Development_Training.pptx` (BMAD-METHOD AI Development Training, deck version 1.1.0).

1. Check that the file exists. If it does not, tell the user: "The training deck is missing from this installation of `open-presentation` (expected at `{skill-root}/assets/BMAD_AI_Development_Training.pptx`); reinstall the `ma-standards` module." and stop.
2. Open it in the system's default presentation viewer with one shell command, chosen by the host platform:
   - Windows: `start "" "{skill-root}/assets/BMAD_AI_Development_Training.pptx"` (PowerShell: `Start-Process "{skill-root}/assets/BMAD_AI_Development_Training.pptx"`)
   - macOS: `open "{skill-root}/assets/BMAD_AI_Development_Training.pptx"`
   - Linux: `xdg-open "{skill-root}/assets/BMAD_AI_Development_Training.pptx"`
3. Confirm to the user that the deck was opened, and give the path so they can open it by hand if the viewer did not appear (a headless or remote session has no viewer: say so and give the path).

The skill changes no file.

{{ workflow.on_complete }}
