# GitHub Actions Workflow Tests

This directory contains comprehensive tests for the GitHub Actions workflows in this repository.

## Test Files

### `test_release_workflow.py`
Comprehensive unit tests for `.github/workflows/release.yml`:
- **Structure validation**: Verifies workflow name, triggers, and job configuration
- **Trigger tests**: Validates release events, tag patterns, and manual dispatch
- **Environment variables**: Ensures proper configuration (e.g., HUSKY=0)
- **Build job tests**: 
  - Validates permissions (contents: read)
  - Tests checkout, setup, and build steps
  - Verifies artifact upload configuration
- **Publish job tests**:
  - Validates permissions (contents: write, packages: write)
  - Tests job dependencies
  - Verifies artifact download
  - Tests npm publish configuration
- **Security tests**:
  - Principle of least privilege
  - Action version pinning
  - Secret handling
  - Job isolation

### `test_workflow_consistency.py`
Tests for consistency between CI and Release workflows:
- **Permissions consistency**: Ensures both workflows properly define permissions
- **Runner OS consistency**: Validates use of ubuntu-latest across workflows
- **Environment variables**: Checks consistency of env vars like HUSKY
- **Action versions**: Ensures common actions use consistent versions
- **Setup patterns**: Validates checkout and bun setup across workflows
- **Security patterns**: 
  - Least privilege principle
  - No hardcoded secrets
  - Concurrency control

## Running the Tests

### Run all tests:
```bash
cd /path/to/repo
bash tests/workflows/run_all_tests.sh
```

### Run individual test suites:
```bash
# Release workflow tests
python3 tests/workflows/test_release_workflow.py

# Consistency tests
python3 tests/workflows/test_workflow_consistency.py
```

## Test Coverage

These tests cover:
- ✅ YAML syntax and structure validation
- ✅ Workflow trigger configuration
- ✅ Job configuration and dependencies
- ✅ Permissions and security best practices
- ✅ Action version pinning
- ✅ Secret handling
- ✅ Build and publish pipeline validation
- ✅ Cross-workflow consistency
- ✅ Environment variable configuration
- ✅ Artifact handling (upload/download)

## Key Changes Tested

The tests specifically validate the recent changes to `release.yml`:
- Addition of `permissions: contents: read` to the build job (lines 17-18)
- Ensures principle of least privilege is followed
- Validates that permissions are consistently applied across all jobs

## Dependencies

- Python 3.x
- PyYAML (`pip install pyyaml`)

## CI Integration

These tests can be integrated into the CI pipeline by adding a test job to `.github/workflows/ci.yml`:

```yaml
  test-workflows:
    name: Test Workflows
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.x'
      - name: Install dependencies
        run: pip install pyyaml
      - name: Run workflow tests
        run: bash tests/workflows/run_all_tests.sh
```

## Contributing

When adding or modifying workflows:
1. Update the corresponding test file
2. Add new test cases for new functionality
3. Run all tests to ensure nothing breaks
4. Follow the existing test patterns and naming conventions