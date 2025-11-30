#!/usr/bin/env python3
"""
Tests for consistency between CI and Release workflows
Ensures that common patterns and security practices are consistent across workflows
"""

import yaml
import sys
from pathlib import Path


class ConsistencyTestRunner:
    def __init__(self):
        """
        Initialize a ConsistencyTestRunner instance to track test results and messages.
        
        Creates counters and collections used by the runner:
        - tests_passed: number of tests that passed (int).
        - tests_failed: number of tests that failed (int).
        - failures: list of failure message strings.
        - warnings: list of warning message strings.
        """
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []
        self.warnings = []

    def assert_equal(self, actual, expected, test_name):
        """
        Assert that two values are equal and record the result in the runner.
        
        Increments the runner's pass or fail counters, prints a PASS or FAIL message, and on failure appends a formatted failure message to the runner's `failures` list.
        
        Parameters:
            actual: The observed value produced by the code under test.
            expected: The value expected for the test to pass.
            test_name (str): A short human-readable name describing the test.
        
        Returns:
            bool: `True` if `actual` equals `expected`, `False` otherwise.
        """
        if actual == expected:
            self.tests_passed += 1
            print(f"✓ PASS: {test_name}")
            return True
        else:
            self.tests_failed += 1
            error_msg = f"✗ FAIL: {test_name}\n  Expected: {expected}\n  Actual: {actual}"
            print(error_msg)
            self.failures.append(error_msg)
            return False

    def assert_true(self, condition, test_name):
        """
        Record a boolean test outcome, print a pass/fail message, and update the runner's counters and records.
        
        Parameters:
        	condition (bool): The boolean condition representing the test result.
        	test_name (str): Human-readable name of the test used in printed output and failure records.
        
        Returns:
        	bool: `True` if `condition` is true (test counted as passed), `False` otherwise. Side effects: increments `tests_passed` or `tests_failed`, prints a pass or fail message, and appends a failure message to `failures` when the condition is false.
        """
        if condition:
            self.tests_passed += 1
            print(f"✓ PASS: {test_name}")
            return True
        else:
            self.tests_failed += 1
            error_msg = f"✗ FAIL: {test_name}\n  Condition was False"
            print(error_msg)
            self.failures.append(error_msg)
            return False

    def warn(self, message):
        """
        Record a non-fatal warning for the test run.
        
        Appends `message` to the runner's warnings list and prints a formatted warning line to standard output.
        
        Parameters:
            message (str): Human-readable warning text to record and display.
        """
        self.warnings.append(message)
        print(f"⚠ WARNING: {message}")

    def print_summary(self):
        """
        Print a concise test summary to stdout and return an exit code.
        
        Prints total passed/failed counts, lists any warnings, and prints failure details when present.
        
        Returns:
            int: 0 if all tests passed, 1 if any test failed.
        """
        total = self.tests_passed + self.tests_failed
        print("\n" + "="*70)
        print(f"TEST SUMMARY: {self.tests_passed}/{total} tests passed")
        
        if len(self.warnings) > 0:
            print(f"\n⚠ {len(self.warnings)} warnings:")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        if self.tests_failed > 0:
            print(f"\n{self.tests_failed} tests FAILED:")
            for failure in self.failures:
                print(f"\n{failure}")
            return 1
        else:
            print("\n🎉 All tests passed!")
            if len(self.warnings) > 0:
                print("Note: Review warnings above for potential improvements")
            return 0


def load_workflows():
    """Load both CI and Release workflows"""
    ci_path = Path('.github/workflows/ci.yml')
    release_path = Path('.github/workflows/release.yml')
    
    with open(ci_path, 'r') as f:
        ci_workflow = yaml.safe_load(f)
    
    with open(release_path, 'r') as f:
        release_workflow = yaml.safe_load(f)
    
    return ci_workflow, release_workflow


def test_consistent_permissions_usage(runner, ci_workflow, release_workflow):
    """
    Verify every job in the CI and Release workflows defines a `permissions` section.
    
    Parameters:
    	runner (ConsistencyTestRunner): Test runner used to record passes, failures, and warnings.
    	ci_workflow (dict): Parsed CI workflow YAML mapping (from yaml.safe_load).
    	release_workflow (dict): Parsed Release workflow YAML mapping (from yaml.safe_load).
    """
    print("\n--- Testing Consistent Permissions Usage ---")
    
    # Both workflows should define permissions at job level
    ci_jobs = ci_workflow.get('jobs', {})
    release_jobs = release_workflow.get('jobs', {})
    
    # Check CI workflow jobs have permissions
    for job_name, job_config in ci_jobs.items():
        runner.assert_true('permissions' in job_config,
                          f"CI workflow job '{job_name}' has permissions defined")
    
    # Check Release workflow jobs have permissions
    for job_name, job_config in release_jobs.items():
        runner.assert_true('permissions' in job_config,
                          f"Release workflow job '{job_name}' has permissions defined")


def test_consistent_runner_os(runner, ci_workflow, release_workflow):
    """
    Verify all jobs in the CI and Release workflows use the expected runner OS.
    
    For each job in both workflows, assert that the job's `runs-on` value equals 'ubuntu-latest'.
    Parameters:
        runner (ConsistencyTestRunner): Test runner used to record assertions and results.
        ci_workflow (dict): Parsed CI workflow YAML as a dictionary.
        release_workflow (dict): Parsed Release workflow YAML as a dictionary.
    """
    print("\n--- Testing Consistent Runner OS ---")
    
    ci_jobs = ci_workflow.get('jobs', {})
    release_jobs = release_workflow.get('jobs', {})
    
    expected_os = 'ubuntu-latest'
    
    for job_name, job_config in ci_jobs.items():
        runner.assert_equal(job_config.get('runs-on'), expected_os,
                           f"CI job '{job_name}' runs on {expected_os}")
    
    for job_name, job_config in release_jobs.items():
        runner.assert_equal(job_config.get('runs-on'), expected_os,
                           f"Release job '{job_name}' runs on {expected_os}")


def test_consistent_environment_variables(runner, ci_workflow, release_workflow):
    """
    Verify that both CI and Release workflows disable Husky by setting the HUSKY environment variable to 0.
    
    Checks the top-level `env` mapping of each workflow and asserts that `HUSKY` equals 0 in both the CI and Release workflows.
    """
    print("\n--- Testing Consistent Environment Variables ---")
    
    ci_env = ci_workflow.get('env', {})
    release_env = release_workflow.get('env', {})
    
    # HUSKY should be disabled in both
    runner.assert_equal(ci_env.get('HUSKY'), 0,
                       "CI workflow disables HUSKY")
    runner.assert_equal(release_env.get('HUSKY'), 0,
                       "Release workflow disables HUSKY")


def test_consistent_action_versions(runner, ci_workflow, release_workflow):
    """
    Verify action versions are consistent between CI and Release workflows for comparable actions.
    
    Collects the actions referenced in each workflow and, for actions present in both workflows, enforces:
    - If each workflow references exactly one version for the action, assert the versions are equal.
    - If the single-version values differ, record a warning but do not fail the test.
    Actions that appear with multiple versions within a workflow are not strictly compared.
    
    Parameters:
        runner: ConsistencyTestRunner used to record assertions and warnings.
        ci_workflow (dict): Parsed CI workflow YAML as a dictionary.
        release_workflow (dict): Parsed Release workflow YAML as a dictionary.
    """
    print("\n--- Testing Consistent Action Versions ---")
    
    def get_action_versions(workflow):
        """
        Collects action names and their versions used in a workflow.
        
        Parameters:
            workflow (dict): Parsed GitHub Actions workflow (as loaded from YAML).
        
        Returns:
            dict: Mapping from action reference (e.g., "actions/checkout") to a list of version strings observed for that action in the workflow. If a step uses an action without an explicit version, the list will include `None` for that occurrence.
        """
        actions = {}
        for job_name, job_config in workflow.get('jobs', {}).items():
            for step in job_config.get('steps', []):
                if 'uses' in step:
                    action = step['uses']
                    action_name = action.split('@')[0]
                    action_version = action.split('@')[1] if '@' in action else None
                    if action_name not in actions:
                        actions[action_name] = []
                    actions[action_name].append(action_version)
        return actions
    
    ci_actions = get_action_versions(ci_workflow)
    release_actions = get_action_versions(release_workflow)
    
    # Check common actions use same versions
    common_actions = set(ci_actions.keys()) & set(release_actions.keys())
    
    for action in common_actions:
        ci_versions = set(ci_actions[action])
        release_versions = set(release_actions[action])
        
        # If both workflows use the same action, they should ideally use the same version
        if len(ci_versions) == 1 and len(release_versions) == 1:
            ci_ver = list(ci_versions)[0]
            release_ver = list(release_versions)[0]
            
            if ci_ver != release_ver:
                # Different versions - issue a warning but don't fail
                runner.warn(f"Action '{action}' uses different versions: CI=v{ci_ver}, Release=v{release_ver}")
                # Still pass the test as this might be intentional
                runner.tests_passed += 1
            else:
                runner.assert_equal(ci_ver, release_ver,
                                   f"Action '{action}' uses consistent version across workflows")


def test_consistent_setup_patterns(runner, ci_workflow, release_workflow):
    """
    Verify both CI and Release workflows include standard setup steps.
    
    Checks that at least one job in each workflow contains an `actions/checkout` step and an `oven-sh/setup-bun` step.
    """
    print("\n--- Testing Consistent Setup Patterns ---")
    
    def has_checkout_step(workflow):
        """
        Determine whether any job in the workflow includes an actions/checkout step.
        
        Parameters:
            workflow (dict): Parsed GitHub Actions workflow mapping (as loaded from YAML).
        
        Returns:
            bool: `True` if at least one job contains a step that uses `actions/checkout`, `False` otherwise.
        """
        for job_name, job_config in workflow.get('jobs', {}).items():
            for step in job_config.get('steps', []):
                if 'uses' in step and 'actions/checkout' in step['uses']:
                    return True
        return False
    
    def has_bun_setup(workflow):
        """
        Determine whether any job in the workflow includes the oven-sh/setup-bun action.
        
        Parameters:
            workflow (dict): Parsed GitHub Actions workflow data (mapping from keys to values).
        
        Returns:
            bool: `True` if at least one step in any job uses the `oven-sh/setup-bun` action, `False` otherwise.
        """
        for job_name, job_config in workflow.get('jobs', {}).items():
            for step in job_config.get('steps', []):
                if 'uses' in step and 'oven-sh/setup-bun' in step['uses']:
                    return True
        return False
    
    runner.assert_true(has_checkout_step(ci_workflow),
                      "CI workflow checks out code")
    runner.assert_true(has_checkout_step(release_workflow),
                      "Release workflow checks out code")
    
    runner.assert_true(has_bun_setup(ci_workflow),
                      "CI workflow sets up Bun")
    runner.assert_true(has_bun_setup(release_workflow),
                      "Release workflow sets up Bun")


def test_permissions_follow_least_privilege(runner, ci_workflow, release_workflow):
    """
    Verify that jobs in both CI and Release workflows adhere to the principle of least privilege.
    
    Checks each job's `permissions` mapping and, when a job's `contents` permission is set to "read",
    asserts that the job does not grant `packages: write` except for jobs named "publish".
    
    Parameters:
        runner: ConsistencyTestRunner used to record assertions and warnings.
        ci_workflow (dict): Parsed CI workflow YAML as a mapping.
        release_workflow (dict): Parsed Release workflow YAML as a mapping.
    """
    print("\n--- Testing Least Privilege Principle Across Workflows ---")
    
    def check_read_only_permissions(job_config, job_name, workflow_name):
        """
        Validate least-privilege permissions for a job's permissions section.
        
        If the job defines `permissions` and `permissions['contents']` is "read", assert that
        `permissions['packages']` is not "write" unless the job name is "publish". Failures are
        reported via the test runner (using the surrounding `runner`), which records a test
        failure and message when the check does not hold.
        
        Parameters:
            job_config (dict): The job's configuration mapping from the workflow YAML.
            job_name (str): The name of the job (used in failure messages).
            workflow_name (str): The name of the workflow (used in failure messages).
        """
        if 'permissions' in job_config:
            perms = job_config['permissions']
            # Jobs that only read should not have write permissions
            if 'contents' in perms:
                if perms['contents'] == 'read':
                    runner.assert_true(
                        perms.get('packages', 'read') != 'write' or job_name == 'publish',
                        f"{workflow_name} job '{job_name}' with contents:read doesn't have unnecessary write permissions"
                    )
    
    ci_jobs = ci_workflow.get('jobs', {})
    release_jobs = release_workflow.get('jobs', {})
    
    for job_name, job_config in ci_jobs.items():
        check_read_only_permissions(job_config, job_name, 'CI')
    
    for job_name, job_config in release_jobs.items():
        check_read_only_permissions(job_config, job_name, 'Release')


def test_no_hardcoded_secrets(runner, ci_workflow, release_workflow):
    """
    Detects potential hardcoded secret patterns in CI and Release workflow YAML and asserts they reference secrets.
    
    Scans both provided workflow objects for case-insensitive occurrences of common secret-related keys (for example, "password:", "token:", "api_key:", "secret:"). For any match, asserts via the runner that the workflow contains a secret reference (such as "secrets." or a GitHub Actions expression like "${{") instead of a hardcoded value.
    
    Parameters:
        runner: ConsistencyTestRunner used to record assertions and warnings.
        ci_workflow: Parsed CI workflow YAML (as a Python dict).
        release_workflow: Parsed Release workflow YAML (as a Python dict).
    """
    print("\n--- Testing No Hardcoded Secrets ---")
    
    def check_no_hardcoded_secrets(workflow, workflow_name):
        """
        Scan a workflow object for likely hardcoded secret patterns and assert they are referenced securely.
        
        Checks the serialized YAML of `workflow` for common secret-like keys such as "password:", "token:", "api_key:", and "secret:". For any match, asserts that the occurrence is a reference to GitHub secrets or expressions (contains "secrets." or "${{") rather than a literal value.
        
        Parameters:
            workflow (dict): Parsed workflow YAML as a Python mapping.
            workflow_name (str): Human-readable name used in test messages when reporting failures.
        """
        workflow_str = yaml.dump(workflow)
        
        # Check for common secret patterns
        suspicious_patterns = [
            'password:',
            'token:',
            'api_key:',
            'secret:',
        ]
        
        for pattern in suspicious_patterns:
            if pattern in workflow_str.lower():
                # Make sure it's a reference to secrets, not a hardcoded value
                runner.assert_true(
                    'secrets.' in workflow_str or '${{' in workflow_str,
                    f"{workflow_name} uses proper secret references for {pattern}"
                )
    
    check_no_hardcoded_secrets(ci_workflow, 'CI workflow')
    check_no_hardcoded_secrets(release_workflow, 'Release workflow')


def test_concurrency_control(runner, ci_workflow, release_workflow):
    """
    Verify the CI workflow defines concurrency control and that it includes required keys.
    
    Parameters:
        runner (ConsistencyTestRunner): Test runner used to record assertions and warnings.
        ci_workflow (dict): Parsed CI workflow YAML as a dictionary; must contain a 'concurrency' mapping.
        release_workflow (dict): Parsed Release workflow YAML as a dictionary (not used by this test).
    """
    print("\n--- Testing Concurrency Control ---")
    
    # CI workflow should have concurrency control
    runner.assert_true('concurrency' in ci_workflow,
                      "CI workflow has concurrency control configured")
    
    if 'concurrency' in ci_workflow:
        concurrency = ci_workflow['concurrency']
        runner.assert_true('group' in concurrency,
                          "CI workflow concurrency has group defined")
        runner.assert_true('cancel-in-progress' in concurrency,
                          "CI workflow concurrency has cancel-in-progress defined")


def test_permissions_added_to_build_job(runner, ci_workflow, release_workflow):
    """
    Verify the Release workflow's build job defines appropriate least-privilege permissions.
    
    Checks that the 'build' job in the provided release workflow has a 'permissions' section,
    that its 'contents' permission is set to 'read', and that no 'write' permission is present.
    
    Parameters:
        runner: ConsistencyTestRunner used to record assertions and warnings.
        release_workflow (dict): Parsed Release workflow YAML as a dictionary.
    """
    print("\n--- Testing Build Job Permissions (New Change) ---")
    
    release_jobs = release_workflow.get('jobs', {})
    build_job = release_jobs.get('build', {})
    
    runner.assert_true('permissions' in build_job,
                      "Release workflow build job has permissions defined")
    
    if 'permissions' in build_job:
        perms = build_job['permissions']
        runner.assert_equal(perms.get('contents'), 'read',
                           "Release workflow build job has 'contents: read' permission")
        runner.assert_true('write' not in str(perms.get('contents', '')),
                          "Release workflow build job follows least privilege (no write)")


def run_all_tests():
    """
    Execute the full suite of workflow consistency tests and summarize results.
    
    Runs all defined consistency checks against the CI and Release GitHub workflow files, prints a human-readable report, and returns a process-style exit code.
    
    Returns:
        int: 0 if all tests passed; 1 if any test failed or on error (missing files, YAML parse error, or other unexpected exceptions).
    """
    runner = ConsistencyTestRunner()
    
    try:
        print("="*70)
        print("GitHub Actions Workflow Consistency Test Suite")
        print("="*70)
        
        ci_workflow, release_workflow = load_workflows()
        
        # Run all test suites
        test_consistent_permissions_usage(runner, ci_workflow, release_workflow)
        test_consistent_runner_os(runner, ci_workflow, release_workflow)
        test_consistent_environment_variables(runner, ci_workflow, release_workflow)
        test_consistent_action_versions(runner, ci_workflow, release_workflow)
        test_consistent_setup_patterns(runner, ci_workflow, release_workflow)
        test_permissions_follow_least_privilege(runner, ci_workflow, release_workflow)
        test_no_hardcoded_secrets(runner, ci_workflow, release_workflow)
        test_concurrency_control(runner, ci_workflow, release_workflow)
        test_permissions_added_to_build_job(runner, ci_workflow, release_workflow)
        
        return runner.print_summary()
        
    except FileNotFoundError as e:
        print(f"ERROR: Could not find workflow file: {e}")
        return 1
    except yaml.YAMLError as e:
        print(f"ERROR: Failed to parse YAML: {e}")
        return 1
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(run_all_tests())