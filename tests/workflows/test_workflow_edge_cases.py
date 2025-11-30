#!/usr/bin/env python3
"""
Comprehensive edge case and negative testing for GitHub Actions workflows
Tests failure scenarios, malformed inputs, and security vulnerabilities
"""

import yaml
import sys
import re
from pathlib import Path


class EdgeCaseTestRunner:
    def __init__(self):
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []

    def assert_true(self, condition, test_name):
        if condition:
            self.tests_passed += 1
            print(f"✓ PASS: {test_name}")
            return True
        else:
            self.tests_failed += 1
            error_msg = f"✗ FAIL: {test_name}"
            print(error_msg)
            self.failures.append(error_msg)
            return False

    def assert_false(self, condition, test_name):
        return self.assert_true(not condition, test_name)

    def print_summary(self):
        total = self.tests_passed + self.tests_failed
        print("\n" + "="*70)
        print(f"EDGE CASE TEST SUMMARY: {self.tests_passed}/{total} tests passed")
        if self.tests_failed > 0:
            print(f"\n{self.tests_failed} tests FAILED:")
            for failure in self.failures:
                print(f"  {failure}")
            return 1
        else:
            print("\n🎉 All edge case tests passed!")
            return 0


def load_workflows():
    ci_path = Path('.github/workflows/ci.yml')
    release_path = Path('.github/workflows/release.yml')
    
    with open(ci_path, 'r') as f:
        ci_workflow = yaml.safe_load(f)
    
    with open(release_path, 'r') as f:
        release_workflow = yaml.safe_load(f)
    
    return ci_workflow, release_workflow


def test_no_sudo_commands(runner, ci_workflow, release_workflow):
    """Test that workflows don't use sudo commands (security risk)"""
    print("\n--- Testing No Sudo Commands ---")
    
    def check_no_sudo(workflow, workflow_name):
        for job_name, job_config in workflow.get('jobs', {}).items():
            for step in job_config.get('steps', []):
                if 'run' in step:
                    run_cmd = step['run'].lower()
                    runner.assert_false('sudo' in run_cmd,
                        f"{workflow_name} job '{job_name}' does not use sudo")
    
    check_no_sudo(ci_workflow, 'CI')
    check_no_sudo(release_workflow, 'Release')


def test_no_curl_piped_to_shell(runner, ci_workflow, release_workflow):
    """Test that workflows don't pipe curl/wget output to shell"""
    print("\n--- Testing No Curl Pipe to Shell ---")
    
    patterns = [r'curl.*\|.*sh', r'curl.*\|.*bash', r'wget.*\|.*sh']
    
    def check_no_pipes(workflow, workflow_name):
        for job_name, job_config in workflow.get('jobs', {}).items():
            for step in job_config.get('steps', []):
                if 'run' in step:
                    for pattern in patterns:
                        runner.assert_false(
                            re.search(pattern, step['run'], re.I) is not None,
                            f"{workflow_name} job '{job_name}' no curl pipe to shell"
                        )
    
    check_no_pipes(ci_workflow, 'CI')
    check_no_pipes(release_workflow, 'Release')


def test_no_wildcard_branch_triggers(runner, ci_workflow, release_workflow):
    """Test no overly broad branch triggers"""
    print("\n--- Testing No Wildcard Branch Triggers ---")
    
    def check_branches(workflow, workflow_name):
        on_config = workflow.get('on', workflow.get(True, {}))
        if 'push' in on_config and isinstance(on_config['push'], dict):
            branches = on_config['push'].get('branches', [])
            for branch in branches:
                runner.assert_false(branch in ('*', '**'),
                    f"{workflow_name} no wildcard branch triggers")
    
    check_branches(ci_workflow, 'CI')
    check_branches(release_workflow, 'Release')


def test_secrets_not_logged(runner, ci_workflow, release_workflow):
    """Test that secrets are not echoed or logged"""
    print("\n--- Testing Secrets Not Logged ---")
    
    def check_secret_logging(workflow, workflow_name):
        for job_name, job_config in workflow.get('jobs', {}).items():
            for step in job_config.get('steps', []):
                if 'run' in step:
                    run_cmd = step['run'].lower()
                    runner.assert_false(
                        'echo' in run_cmd and 'secret' in run_cmd,
                        f"{workflow_name} job '{job_name}' doesn't echo secrets"
                    )
    
    check_secret_logging(ci_workflow, 'CI')
    check_secret_logging(release_workflow, 'Release')


def test_no_hardcoded_tokens(runner, ci_workflow, release_workflow):
    """Test no hardcoded tokens in workflows"""
    print("\n--- Testing No Hardcoded Tokens ---")
    
    token_patterns = [
        r'ghp_[a-zA-Z0-9]{36}',
        r'gho_[a-zA-Z0-9]{36}',
        r'npm_[a-zA-Z0-9]{36}',
    ]
    
    def check_tokens(workflow, workflow_name):
        workflow_str = yaml.dump(workflow)
        for pattern in token_patterns:
            matches = re.findall(pattern, workflow_str)
            runner.assert_true(len(matches) == 0,
                f"{workflow_name} no hardcoded tokens")
    
    check_tokens(ci_workflow, 'CI')
    check_tokens(release_workflow, 'Release')


def test_environment_variable_naming(runner, ci_workflow, release_workflow):
    """Test env vars follow UPPER_CASE convention"""
    print("\n--- Testing Environment Variable Naming ---")
    
    def check_naming(workflow, workflow_name):
        env_vars = workflow.get('env', {})
        for var_name in env_vars.keys():
            runner.assert_true(
                var_name.isupper() or var_name.replace('_', '').isupper(),
                f"{workflow_name} env var '{var_name}' is UPPER_CASE"
            )
    
    check_naming(ci_workflow, 'CI')
    check_naming(release_workflow, 'Release')


def run_all_tests():
    """Run all edge case tests"""
    runner = EdgeCaseTestRunner()
    
    try:
        print("="*70)
        print("GitHub Actions Workflow Edge Case Test Suite")
        print("="*70)
        
        ci_workflow, release_workflow = load_workflows()
        
        test_no_sudo_commands(runner, ci_workflow, release_workflow)
        test_no_curl_piped_to_shell(runner, ci_workflow, release_workflow)
        test_no_wildcard_branch_triggers(runner, ci_workflow, release_workflow)
        test_secrets_not_logged(runner, ci_workflow, release_workflow)
        test_no_hardcoded_tokens(runner, ci_workflow, release_workflow)
        test_environment_variable_naming(runner, ci_workflow, release_workflow)
        
        return runner.print_summary()
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(run_all_tests())