#!/usr/bin/env python3
"""
Schema validation tests for GitHub Actions workflows
"""

import yaml
import sys
from pathlib import Path
from typing import Set


class SchemaTestRunner:
    def __init__(self):
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []

    def assert_true(self, condition, test_name):
        if condition:
            self.tests_passed += 1
            print(f"✓ PASS: {test_name}")
        else:
            self.tests_failed += 1
            print(f"✗ FAIL: {test_name}")
            self.failures.append(test_name)
        return condition

    def assert_in(self, item, container, test_name):
        return self.assert_true(item in container, test_name)

    def print_summary(self):
        total = self.tests_passed + self.tests_failed
        print("\n" + "="*70)
        print(f"SCHEMA TEST SUMMARY: {self.tests_passed}/{total} tests passed")
        if self.tests_failed > 0:
            print(f"\n{self.tests_failed} tests FAILED")
            return 1
        print("\n🎉 All schema tests passed!")
        return 0


def load_workflows():
    ci = yaml.safe_load(open('.github/workflows/ci.yml'))
    release = yaml.safe_load(open('.github/workflows/release.yml'))
    return ci, release


def test_valid_trigger_events(runner, ci, release):
    """Test workflows use valid trigger events"""
    print("\n--- Testing Valid Trigger Events ---")
    
    valid_events = {
        'push', 'pull_request', 'release', 'workflow_dispatch',
        'schedule', 'repository_dispatch', 'workflow_call'
    }
    
    for workflow, name in [(ci, 'CI'), (release, 'Release')]:
        on_config = workflow.get('on', workflow.get(True, {}))
        if isinstance(on_config, dict):
            for event in on_config.keys():
                runner.assert_in(event, valid_events,
                    f"{name} uses valid event '{event}'")


def test_valid_runner_labels(runner, ci, release):
    """Test jobs use valid runner labels"""
    print("\n--- Testing Valid Runner Labels ---")
    
    valid_runners = {'ubuntu-latest', 'ubuntu-22.04', 'ubuntu-20.04'}
    
    for workflow, name in [(ci, 'CI'), (release, 'Release')]:
        for job_name, job_config in workflow.get('jobs', {}).items():
            runs_on = job_config.get('runs-on')
            if isinstance(runs_on, str):
                runner.assert_in(runs_on, valid_runners,
                    f"{name} job '{job_name}' uses valid runner")


def test_valid_permission_scopes(runner, ci, release):
    """Test permission scopes are valid"""
    print("\n--- Testing Valid Permission Scopes ---")
    
    valid_scopes = {'contents', 'packages', 'pull-requests', 'issues'}
    valid_levels = {'read', 'write', 'none'}
    
    for workflow, name in [(ci, 'CI'), (release, 'Release')]:
        for job_name, job_config in workflow.get('jobs', {}).items():
            if 'permissions' in job_config:
                perms = job_config['permissions']
                if isinstance(perms, dict):
                    for scope, level in perms.items():
                        runner.assert_in(level, valid_levels,
                            f"{name} job '{job_name}' permission level valid")


def test_step_identifiers_unique(runner, ci, release):
    """Test step IDs are unique within jobs"""
    print("\n--- Testing Unique Step IDs ---")
    
    for workflow, name in [(ci, 'CI'), (release, 'Release')]:
        for job_name, job_config in workflow.get('jobs', {}).items():
            step_ids: Set[str] = set()
            for step in job_config.get('steps', []):
                if 'id' in step:
                    step_id = step['id']
                    runner.assert_true(step_id not in step_ids,
                        f"{name} job '{job_name}' step ID '{step_id}' unique")
                    step_ids.add(step_id)


def test_needs_references_valid(runner, ci, release):
    """Test 'needs' references point to existing jobs"""
    print("\n--- Testing Valid Needs References ---")
    
    for workflow, name in [(ci, 'CI'), (release, 'Release')]:
        job_names = set(workflow.get('jobs', {}).keys())
        for job_name, job_config in workflow.get('jobs', {}).items():
            if 'needs' in job_config:
                needs = job_config['needs']
                if isinstance(needs, str):
                    runner.assert_in(needs, job_names,
                        f"{name} job '{job_name}' needs valid job")
                elif isinstance(needs, list):
                    for needed in needs:
                        runner.assert_in(needed, job_names,
                            f"{name} job '{job_name}' needs valid job")


def run_all_tests():
    """Run all schema tests"""
    runner = SchemaTestRunner()
    
    try:
        print("="*70)
        print("GitHub Actions Workflow Schema Validation Suite")
        print("="*70)
        
        ci, release = load_workflows()
        
        test_valid_trigger_events(runner, ci, release)
        test_valid_runner_labels(runner, ci, release)
        test_valid_permission_scopes(runner, ci, release)
        test_step_identifiers_unique(runner, ci, release)
        test_needs_references_valid(runner, ci, release)
        
        return runner.print_summary()
        
    except Exception as e:
        print(f"ERROR: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(run_all_tests())