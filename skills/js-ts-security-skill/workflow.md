# JS/TS Security Workflow

**Goal:** Audit the JavaScript or TypeScript project at hand against OWASP Top 10 2025 and report every finding with its category and fix.

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

This skill provides a set of tools and best practices to ensure that JavaScript and TypeScript code (both client-side and server-side) is secure and compliant with the latest security standards, specifically the **OWASP Top 10 2025**.

## When to Use
- Before committing code to a repository.
- During a security audit of an existing codebase.
- When adding new dependencies or updating CI/CD pipelines.
- When implementing critical features like authentication, authorization, or error handling.

## Security Checks (OWASP 2025 Mapping)

### A01:2025 - Broken Access Control
- Verification of authorization logic.
- **SSRF (Server-Side Request Forgery)**: Detecting unvalidated URL fetching in `fetch`, `axios`, `http.get`.

### A02:2025 - Security Misconfiguration
- Auditing configuration files (`.env`, `docker-compose.yml`).
- Checking for insecure defaults and exposed debug endpoints.

### A03:2025 - Software Supply Chain Failures
- **NEW**: Focusing on dependency integrity.
- Verification of lockfiles (`package-lock.json`, `yarn.lock`).
- Checking for insecure registry URLs (HTTP).

### A04:2025 - Cryptographic Failures
- Detecting weak hashing (MD5, SHA1).
- Checking for insecure randomness (`Math.random()`).

### A05:2025 - Injection
- Expanded detection for OS commands (`child_process.exec`), SQL injection, and NoSQL injection.

### A06:2025 - Insecure Design
- Documentation on secure design principles (e.g., Fail Secure, Least Privilege).

### A07:2025 - Authentication Failures
- Checking for insecure cookies (`httpOnly: false`).
- Hardcoded credentials and weak session management.

### A08:2025 - Software or Data Integrity Failures
- Detecting unsafe deserialization (`unserialize`, `JSON.parse` of untrusted input).

### A09:2025 - Logging & Alerting Failures
- Identifying lack of security logging.
- Empty catch blocks that swallow security errors.

### A10:2025 - Mishandling of Exceptional Conditions
- **NEW**: Identifying insecure error handling.
- Detecting empty `catch` blocks and `console.log(err)` in critical paths.

## Usage

### Run the OWASP 2025 security scan

The bundled script `{skill-root}/scripts/verify_security.py` (standard library only) runs the five phases in order: lockfile and registry hygiene, the package manager's vulnerability audit, static analysis of dangerous patterns, empty catch blocks, and hard-coded secrets, and maps every finding to its OWASP 2025 category. Run it from the project root (or pass `--root <dir>`; `--skip-audit` skips the package-manager audit when the network is unavailable):

```bash
uv run --no-cache {skill-root}/scripts/verify_security.py
```

Exit 0 means `SECURE`, 1 `VULNERABLE` (the summary names the failing categories), 2 that the folder holds no `package.json`. Report the summary table to the user, then review each finding: a pattern hit is a lead, not a verdict (`JSON.parse` of trusted data is fine); confirm the exploitable ones, propose the fix, and say which hits are false positives and why.

{{ workflow.on_complete }}
