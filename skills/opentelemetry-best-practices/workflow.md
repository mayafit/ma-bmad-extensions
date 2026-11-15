# OpenTelemetry Best Practices Workflow

**Goal:** Instrument the code at hand with standard, propagating, safe OpenTelemetry spans and metrics.

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

Guidelines for implementing standardized distributed tracing and metrics using OpenTelemetry to ensure high-quality observability.

## Mandatory Policies

### 1. Semantic Conventions
You MUST use OpenTelemetry Semantic Conventions for all attribute names. Never invent custom names for standard concepts (e.g., use `http.method` instead of `method` or `http_method`).

### 2. Context Propagation
You MUST ensure trace context is propagated across asynchronous boundaries. When starting a background task or making a network call, ensure the active span is correctly parented or the context is injected into headers.

### 3. Span Granularity
- **Database**: Every query MUST have its own span with attributes for the statement (sanitized) and database name.
- **External API**: Every outgoing request MUST have a span.
- **Complex Logic**: Large internal computation blocks SHOULD have spans if they represent a distinct logical step.

### 4. Meaningful Metrics
- **Counters**: Use for discrete events (e.g., `api.requests.total`).
- **Histograms**: Use for durations and sizes (e.g., `api.latency`).
- **Attributes**: Common attributes (e.g., `status_code`, `service.name`) SHOULD be applied to both spans and metrics.

## Critical Rules
- **No Sensitive Data**: Never include PII, passwords, or tokens in span attributes or logs associated with spans.
- **Fail Gracefully**: Instrumentation should never crash the application. Use `tracer.startActiveSpan` carefully with `try...finally` to ensure spans are always ended.
- **Status Codes**: Always set the span status to `Error` when an exception is caught that isn't handled.

## Resources
- [Semantic Conventions Reference]({{ rendered("references/otel-standards.md") }})
- [Example Implementations]({{ rendered("examples/javascript.md") }})

{{ workflow.on_complete }}
