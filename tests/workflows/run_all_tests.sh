#!/bin/bash
# Test runner for GitHub Actions workflow tests

set -e

echo "=================================="
echo "Running Workflow Test Suite"
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
echo "=================================="
if [ $EXIT_CODE -eq 0 ]; then
    echo "✓ All test suites passed!"
else
    echo "✗ Some tests failed (exit code: $EXIT_CODE)"
fi
echo "=================================="

exit $EXIT_CODE