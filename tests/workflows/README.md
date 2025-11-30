# GitHub Actions Workflow Tests

This directory contains comprehensive tests for the GitHub Actions workflows in this repository.

## Test Files

### Core Test Suites

#### `test_release_workflow.py` (76 tests)
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

**Key Focus**: Validates the addition of `permissions: contents: read` to the build job.

#### `test_workflow_consistency.py` (23 tests)
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

#### `test_workflow_edge_cases.py` (12+ tests)
Edge case and security vulnerability testing:
- **Security risks**:
  - No sudo commands
  - No curl/wget piped to shell
  - No wildcard branch triggers
- **Secret safety**:
  - Secrets not logged or echoed
  - No hardcoded tokens (GitHub PAT, NPM, etc.)
- **Best practices**:
  - Environment variable naming conventions
  - Proper command usage

#### `test_workflow_schema.py` (10+ tests)
Schema validation against GitHub Actions requirements:
- **Valid trigger events**: Ensures only supported events are used
- **Valid runner labels**: Validates runner OS specifications
- **Valid permission scopes**: Checks permission names and levels
- **Unique step identifiers**: Ensures no duplicate step IDs
- **Valid job dependencies**: Verifies 'needs' references exist

#### `test_documentation.py` (10+ tests)
Documentation quality and completeness validation:
- **README validation**: Checks existence and content quality
- **Implementation notes**: Validates detailed documentation
- **Python docstrings**: Ensures all test files are documented
- **Requirements file**: Validates dependencies are listed
- **Shell script documentation**: Checks for proper comments

## Running the Tests

### Run all tests:
```bash
cd /path/to/repo
bash tests/workflows/run_all_tests.sh
```

### Run individual test suites:
```bash
# Core functionality
python3 tests/workflows/test_release_workflow.py

# Consistency checks
python3 tests/workflows/test_workflow_consistency.py

# Edge cases and security
python3 tests/workflows/test_workflow_edge_cases.py

# Schema validation
python3 tests/workflows/test_workflow_schema.py

# Documentation validation
python3 tests/workflows/test_documentation.py
```

## Test Coverage

**Total: 130+ comprehensive tests** covering:

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
- ✅ Edge cases and failure scenarios
- ✅ Security vulnerability detection
- ✅ Schema compliance
- ✅ Documentation quality

## Key Changes Tested

The tests specifically validate the recent changes to `release.yml`:
- Addition of `permissions: contents: read` to the build job (lines 17-18)
- Ensures principle of least privilege is followed
- Validates that permissions are consistently applied across all jobs

## Dependencies

- Python 3.x
- PyYAML (`pip install pyyaml`)

Install dependencies:
```bash
pip install -r tests/workflows/requirements.txt
```

## CI Integration

These tests can be integrated into the CI pipeline by adding a test job to `.github/workflows/ci.yml`:

```yaml
  test-workflows:
    name: Test Workflows
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.x'
      - name: Install dependencies
        run: pip install -r tests/workflows/requirements.txt
      - name: Run workflow tests
        run: bash tests/workflows/run_all_tests.sh
```

## Documentation

For detailed information about the test suite:

- **[COMPREHENSIVE_TEST_COVERAGE.md](COMPREHENSIVE_TEST_COVERAGE.md)** - Detailed breakdown of all test categories and coverage
- **[IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md)** - Implementation details and rationale
- **[TEST_SUMMARY.md](TEST_SUMMARY.md)** - Test execution results and statistics

## Test Philosophy

This test suite follows a **bias for action** approach:

1. **Comprehensive Coverage**: Goes beyond basic functionality to test edge cases and negative scenarios
2. **Security First**: Multiple layers of security validation
3. **Living Documentation**: Tests serve as executable documentation
4. **Fast Feedback**: Local validation without waiting for GitHub Actions
5. **Regression Prevention**: Catches configuration drift and accidental changes

## Contributing

When adding or modifying workflows:
1. Update the corresponding test file
2. Add new test cases for new functionality
3. Run all tests to ensure nothing breaks
4. Follow the existing test patterns and naming conventions
5. Update documentation to reflect changes

## Success Criteria

All 130+ tests should pass, indicating:
- ✅ Workflows are syntactically valid
- ✅ Security best practices are followed
- ✅ Configurations are consistent
- ✅ Documentation is complete
- ✅ No known vulnerabilities exist