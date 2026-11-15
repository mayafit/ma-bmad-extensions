# Test Generator Workflow

**Goal:** Generate a complete, independent test suite for the code at hand in the project's test framework.

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

Generate comprehensive unit and integration tests for code.

## Process

1. **Analyze**: Understand code purpose, paths, dependencies, edge cases
2. **Framework**: Determine or ask for testing framework
3. **Generate**: Create test cases covering:
   - Happy path (normal behavior)
   - Edge cases (boundaries, empty/null inputs)
   - Error cases (invalid inputs, exceptions)
   - Integration scenarios (if applicable)

## Test Structure (AAA Pattern)

```
- Arrange: Setup test data
- Act: Execute code
- Assert: Verify results
```

## Coverage Goals

- 80%+ code coverage
- All public methods
- All conditional branches
- Positive and negative cases

## Best Practices

- One assertion per test
- Independent tests
- Descriptive test names
- Mock external dependencies
- Clear assertion messages

## Example Outputs

### JavaScript (Jest)
```javascript
describe('ComponentName', () => {
  test('should [behavior] when [condition]', () => {
    // Arrange
    const input = setupTestData();

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });
});
```

### Python (Pytest)
```python
import pytest
from app.module import function_under_test

def test_should_behavior_when_condition():
    # Arrange
    input_data = setup_test_data()
    
    # Act
    result = function_under_test(input_data)
    
    # Assert
    assert result == expected_output

def test_should_raise_on_invalid_input():
    with pytest.raises(ValueError):
        function_under_test(None)
```


## Framework Selection

- Ask for the preferred framework when it is not obvious from the project.
- Common frameworks: JavaScript/TypeScript: Jest, Mocha, Vitest; Python: pytest, unittest; Java: JUnit, TestNG; C#: xUnit, NUnit; Go: the `testing` package.

## Mocking and Stubbing

- Mock external dependencies (APIs, databases, file system).
- Stub complex dependencies; use dependency injection where needed.
- Keep mocks local to the test; never let one test's mock leak into another.

{{ workflow.on_complete }}
