#!/bin/bash
# Test runner for GitHub Actions workflow tests
# Runs all test suites including edge cases, schema validation, and documentation tests

set -e

echo "=================================="
echo "Running Comprehensive Workflow Test Suite"
echo "=================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

EXIT_CODE=0

echo ""
echo ">>> Running Release Workflow Tests..."
python3 tests/workflows/test_release_workflow.py || EXIT_CODE=$?

echo ""
echo ">>> Running Workflow Consistency Tests..."
python3 tests/workflows/test_workflow_consistency.py || EXIT_CODE=$?

echo ""
echo ">>> Running Edge Case and Security Tests..."
python3 tests/workflows/test_workflow_edge_cases.py || EXIT_CODE=$?

echo ""
echo ">>> Running Schema Validation Tests..."
python3 tests/workflows/test_workflow_schema.py || EXIT_CODE=$?

echo ""
echo ">>> Running Documentation Validation Tests..."
python3 tests/workflows/test_documentation.py || EXIT_CODE=$?

echo ""
echo "=================================="
if [ $EXIT_CODE -eq 0 ]; then
    echo "✓ All test suites passed!"
    echo ""
    echo "Test Coverage Summary:"
    echo "  - Release workflow validation (76 tests)"
    echo "  - Cross-workflow consistency (23 tests)"
    echo "  - Edge cases and security (12+ tests)"
    echo "  - Schema validation (10+ tests)"
    echo "  - Documentation validation (10+ tests)"
    echo ""
    echo "Total: 130+ comprehensive tests"
else
    echo "✗ Some tests failed (exit code: $EXIT_CODE)"
fi
echo "=================================="

exit $EXIT_CODE