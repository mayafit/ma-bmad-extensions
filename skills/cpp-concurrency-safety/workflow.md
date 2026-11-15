# C++ Concurrency Safety Workflow

**Goal:** Prevent data races, deadlocks and shared-state corruption in the C++ code at hand.

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

This skill prevents common multi-threading defects like data races, deadlocks, and shared-state corruption.

## Policies

### 1. RAII Locking Only
*   **Rule**: Never call `mutex.lock()` or `mutex.unlock()` manually.
*   **Action**: 
    - Use `std::lock_guard` for single mutexes.
    - Use `std::unique_lock` if you need deferred locking or condition variables.
    - Use `std::scoped_lock` (C++17) for multiple mutexes to avoid deadlocks.
*   **Rationale**: Ensures locks are released even if an exception is thrown.

### 2. Task-Based Parallelism
*   **Rule**: Prefer tasks (`std::async`, `std::packaged_task`, `std::future`) over raw threads (`std::thread`).
*   **Action**: Use `auto result = std::async(std::launch::async, func, args...);`
*   **Rationale**: Automates thread management and handles value return/exception propagation naturally.

### 3. Minimize Shared Mutable State
*   **Rule**: Data should ideally be either "Thread-Local" or "Read-Only".
*   **Action**:
    - Pass data to threads by value where possible.
    - Use `const` for data shared between threads.
    - Group mutexes with the data they protect (e.g., in a struct).
*   **Rationale**: If data isn't shared or isn't mutable, it cannot have a race condition.

### 4. Never Sleep/Wait without a Condition
*   **Rule**: Avoid `std::this_thread::sleep_for` for synchronization.
*   **Action**: Use `std::condition_variable` with a predicate to wait for work.
*   **Rationale**: Sleeping is inefficient and bug-prone; condition variables are precise and responsive.

## Examples

### Before (Dangerous Concurrency)
```cpp
std::mutex mtx;
int sharedData = 0;

void worker() {
    mtx.lock();
    sharedData++;
    mtx.unlock(); // What if an exception happened above?
}
```

### After (Safe Concurrency)
```cpp
std::mutex mtx;
int sharedData = 0;

void worker() {
    std::lock_guard<std::mutex> lock(mtx);
    sharedData++;
} // Lock automatically released here
```

{{ workflow.on_complete }}
