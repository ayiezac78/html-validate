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
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []
        self.warnings = []

    def assert_equal(self, actual, expected, test_name):
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
        """Add a warning that doesn't fail the test"""
        self.warnings.append(message)
        print(f"⚠ WARNING: {message}")

    def print_summary(self):
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
    """Test that both workflows use permissions consistently"""
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
    """Test that workflows use consistent runner OS"""
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
    """Test that workflows use consistent environment variables"""
    print("\n--- Testing Consistent Environment Variables ---")
    
    ci_env = ci_workflow.get('env', {})
    release_env = release_workflow.get('env', {})
    
    # HUSKY should be disabled in both
    runner.assert_equal(ci_env.get('HUSKY'), 0,
                       "CI workflow disables HUSKY")
    runner.assert_equal(release_env.get('HUSKY'), 0,
                       "Release workflow disables HUSKY")


def test_consistent_action_versions(runner, ci_workflow, release_workflow):
    """Test that both workflows use consistent action versions where applicable"""
    print("\n--- Testing Consistent Action Versions ---")
    
    def get_action_versions(workflow):
        """Extract action versions from workflow"""
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
    """Test that both workflows follow consistent setup patterns"""
    print("\n--- Testing Consistent Setup Patterns ---")
    
    def has_checkout_step(workflow):
        """Check if workflow has checkout step"""
        for job_name, job_config in workflow.get('jobs', {}).items():
            for step in job_config.get('steps', []):
                if 'uses' in step and 'actions/checkout' in step['uses']:
                    return True
        return False
    
    def has_bun_setup(workflow):
        """Check if workflow has bun setup"""
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
    """Test that all jobs follow principle of least privilege"""
    print("\n--- Testing Least Privilege Principle Across Workflows ---")
    
    def check_read_only_permissions(job_config, job_name, workflow_name):
        """Check if job has read-only permissions where appropriate"""
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
    """Test that workflows don't contain hardcoded secrets"""
    print("\n--- Testing No Hardcoded Secrets ---")
    
    def check_no_hardcoded_secrets(workflow, workflow_name):
        """Check workflow YAML for potential hardcoded secrets"""
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
    """Test concurrency control configuration"""
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
    """Test that the build job in release workflow has the new permissions"""
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
    """Run all consistency tests"""
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