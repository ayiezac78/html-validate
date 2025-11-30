#!/usr/bin/env python3
"""
Comprehensive tests for GitHub Actions Release Workflow
Tests the structure, permissions, and configuration of .github/workflows/release.yml
"""

import yaml
import sys
from pathlib import Path

class WorkflowTestRunner:
    def __init__(self):
        """
        Initialize a WorkflowTestRunner instance and set up counters and storage for test results.
        
        Attributes:
            tests_passed (int): Number of tests that have passed, initialized to 0.
            tests_failed (int): Number of tests that have failed, initialized to 0.
            failures (list[str]): Collected failure messages, initialized as an empty list.
        """
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []

    def assert_equal(self, actual, expected, test_name):
        """
        Check that two values are equal and record the outcome on the runner.
        
        Increments the runner's pass or fail counters, prints a brief pass/fail message, and on failure appends a formatted failure message to `self.failures`.
        
        Parameters:
            actual: The observed value to compare.
            expected: The expected value to compare against.
            test_name (str): A short description of the assertion used in printed and recorded messages.
        
        Returns:
            bool: `True` if `actual == expected`, `False` otherwise.
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

    def assert_in(self, item, container, test_name):
        """
        Check whether `item` is present in `container` and record the assertion result on the runner.
        
        If the check succeeds, increments `tests_passed`; if it fails, increments `tests_failed` and appends a message to `failures`. Also prints a brief pass/fail message.
        
        Parameters:
            item: The value to look for in `container`.
            container: A collection or mapping to search for `item`.
            test_name (str): A short description used in printed and recorded messages.
        
        Returns:
            bool: `True` if `item` is in `container`, `False` otherwise.
        """
        if item in container:
            self.tests_passed += 1
            print(f"✓ PASS: {test_name}")
            return True
        else:
            self.tests_failed += 1
            error_msg = f"✗ FAIL: {test_name}\n  Expected '{item}' to be in {container}"
            print(error_msg)
            self.failures.append(error_msg)
            return False

    def assert_true(self, condition, test_name):
        """
        Check that a condition is true and record the result in the test runner.
        
        Parameters:
            condition: The boolean expression to evaluate.
            test_name (str): A descriptive name used in pass/fail output.
        
        Returns:
            True if `condition` is true, False otherwise.
        
        Notes:
            On success increments `tests_passed` and prints a pass line. On failure increments `tests_failed`, appends a failure message to `failures`, and prints a fail line.
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

    def assert_isinstance(self, obj, cls, test_name):
        """
        Check whether `obj` is an instance of `cls` and record the result with the runner.
        
        If the check passes, increments the runner's passed count and prints a passing message.
        If the check fails, increments the runner's failed count, prints a failure message, and appends a failure description to the runner's failures list.
        
        Parameters:
            obj: The object to test.
            cls: A type or tuple of types to check against.
            test_name (str): A short description used in printed pass/fail messages.
        
        Returns:
            bool: `True` if `obj` is an instance of `cls`, `false` otherwise.
        """
        if isinstance(obj, cls):
            self.tests_passed += 1
            print(f"✓ PASS: {test_name}")
            return True
        else:
            self.tests_failed += 1
            error_msg = f"✗ FAIL: {test_name}\n  Expected type {cls}, got {type(obj)}"
            print(error_msg)
            self.failures.append(error_msg)
            return False

    def print_summary(self):
        """
        Prints a formatted test report to standard output and returns a process-style exit code.
        
        The report includes counts of passed and failed tests and lists failure messages when present.
        
        Returns:
            int: 0 if all tests passed, 1 if one or more tests failed.
        """
        total = self.tests_passed + self.tests_failed
        print("\n" + "="*70)
        print(f"TEST SUMMARY: {self.tests_passed}/{total} tests passed")
        if self.tests_failed > 0:
            print(f"\n{self.tests_failed} tests FAILED:")
            for failure in self.failures:
                print(f"\n{failure}")
            return 1
        else:
            print("\n🎉 All tests passed!")
            return 0


def load_workflow():
    """
    Load and parse the release workflow YAML from .github/workflows/release.yml.
    
    Parses the workflow file into Python native structures while preserving the special handling for the top-level `on` trigger key.
    
    Returns:
        dict: The parsed workflow YAML as a Python mapping.
    """
    workflow_path = Path('.github/workflows/release.yml')
    
    # Load with custom loader to preserve 'on' keyword
    class PreserveOnLoader(yaml.SafeLoader):
        pass
    
    # Override the default behavior for 'on'
    def on_constructor(loader, node):
        """
        Treat the provided YAML mapping node as a standard mapping and return its constructed mapping.
        
        Parameters:
            loader (yaml.Loader): The YAML loader instance performing construction.
            node (yaml.Node): The YAML mapping node to construct.
        
        Returns:
            dict: A Python mapping representing the constructed contents of `node`.
        """
        return loader.construct_mapping(node)
    
    PreserveOnLoader.add_constructor('tag:yaml.org,2002:bool', 
                                     lambda loader, node: loader.construct_scalar(node))
    
    with open(workflow_path, 'r') as f:
        content = f.read()
        # Use safe_load which handles 'on' correctly in recent PyYAML versions
        return yaml.safe_load(content)


def test_workflow_structure(runner, workflow):
    """
    Verify the release workflow contains required top-level sections.
    
    Asserts that the workflow's name is 'Release' and that top-level keys for triggers, jobs, and env are present. Note: some YAML loaders may represent the trigger configuration using the key 'on' or the boolean True.
    
    Parameters:
        runner (WorkflowTestRunner): Test runner used to record assertions and results.
        workflow (dict): Parsed workflow YAML as a dictionary.
    """
    print("\n--- Testing Workflow Structure ---")
    
    runner.assert_equal(workflow['name'], 'Release', 
                       "Workflow name is 'Release'")
    
    # Check for 'on' key (which might be True boolean in older YAML parsers)
    has_on = 'on' in workflow or True in workflow
    runner.assert_true(has_on,
                      "Workflow has trigger configuration")
    
    runner.assert_true('jobs' in workflow,
                      "Workflow has 'jobs' section")
    
    runner.assert_true('env' in workflow,
                      "Workflow has 'env' section")


def test_workflow_triggers(runner, workflow):
    """
    Verify the workflow's trigger configuration for release, push (tag pattern), and manual dispatch.
    
    Checks that the workflow contains a trigger mapping (under 'on' or the boolean True, to accommodate a PyYAML parsing quirk), and that:
    - a 'release' trigger exists with types including 'published' when present,
    - a 'push' trigger exists with a tags filter that includes the semver pattern 'v*.*.*',
    - a 'workflow_dispatch' manual trigger exists.
    
    Parameters:
        runner (WorkflowTestRunner): Test runner used to record assertions and failures.
        workflow (dict): Parsed GitHub Actions workflow dictionary to validate.
    """
    print("\n--- Testing Workflow Triggers ---")
    
    # Handle both 'on' and True as keys (PyYAML quirk)
    on_config = workflow.get('on', workflow.get(True, {}))
    
    runner.assert_isinstance(on_config, dict,
                            "Workflow trigger configuration is a dictionary")
    
    if not isinstance(on_config, dict):
        return
    
    runner.assert_true('release' in on_config,
                      "Workflow triggers on 'release' events")
    
    if 'release' in on_config:
        runner.assert_equal(on_config['release']['types'], ['published'],
                           "Release trigger types include 'published'")
    
    runner.assert_true('push' in on_config,
                      "Workflow triggers on 'push' events")
    
    if 'push' in on_config:
        runner.assert_true('tags' in on_config['push'],
                          "Push trigger has tags filter")
        runner.assert_in('v*.*.*', on_config['push']['tags'],
                        "Tags filter includes semver pattern 'v*.*.*'")
    
    runner.assert_true('workflow_dispatch' in on_config,
                      "Workflow has manual trigger (workflow_dispatch)")


def test_environment_variables(runner, workflow):
    """
    Verify that the workflow's top-level environment sets HUSKY to 0.
    
    Asserts that the workflow's `env` mapping contains the key `HUSKY` with the value 0.
    """
    print("\n--- Testing Environment Variables ---")
    
    env = workflow.get('env', {})
    
    runner.assert_equal(env.get('HUSKY'), 0,
                       "HUSKY environment variable is set to 0")


def test_build_job_configuration(runner, workflow):
    """
    Verify the 'build' job in the workflow contains required configuration and permissions.
    
    Checks that:
    - a 'build' job exists under `jobs`;
    - the job's `runs-on` is 'ubuntu-latest';
    - a `permissions` mapping is present and is a dictionary with `contents` equal to 'read' (if present);
    - the job defines `steps`.
    
    Parameters:
        runner: WorkflowTestRunner instance used to record test assertions.
        workflow (dict): Parsed workflow YAML as a Python dictionary.
    """
    print("\n--- Testing Build Job Configuration ---")
    
    jobs = workflow['jobs']
    runner.assert_true('build' in jobs,
                      "Workflow has 'build' job")
    
    build_job = jobs['build']
    
    runner.assert_equal(build_job['runs-on'], 'ubuntu-latest',
                       "Build job runs on ubuntu-latest")
    
    # Test permissions (the key change in this PR)
    runner.assert_true('permissions' in build_job,
                      "Build job has permissions defined")
    
    if 'permissions' in build_job:
        permissions = build_job['permissions']
        runner.assert_isinstance(permissions, dict,
                                "Build job permissions is a dictionary")
        runner.assert_equal(permissions.get('contents'), 'read',
                           "Build job has 'contents: read' permission")
    
    runner.assert_true('steps' in build_job,
                      "Build job has steps defined")


def test_build_job_steps(runner, workflow):
    """
    Validate the steps of the `build` job in the release workflow.
    
    Performs a set of assertions that the build job:
    - defines `steps` as a list with at least three entries,
    - begins with `actions/checkout@v5`,
    - includes a `oven-sh/setup-bun@v2` step with a `with` block and `bun-version` set to "latest",
    - runs the commands `bun ci` and `bun run build`,
    - uploads build artifacts using `actions/upload-artifact` with `name` "build-output" and `path` "./dist".
    
    Parameters:
        runner (WorkflowTestRunner): Test runner used to record assertions and failures.
        workflow (dict): Parsed workflow YAML as a dictionary representing the release workflow.
    
    """
    print("\n--- Testing Build Job Steps ---")
    
    build_job = workflow['jobs']['build']
    steps = build_job['steps']
    
    runner.assert_isinstance(steps, list,
                            "Build job steps is a list")
    
    runner.assert_true(len(steps) >= 3,
                      f"Build job has at least 3 steps (found {len(steps)})")
    
    # Check for checkout action
    checkout_step = steps[0]
    runner.assert_equal(checkout_step.get('uses'), 'actions/checkout@v5',
                       "First step uses actions/checkout@v5")
    
    # Check for setup-bun action
    setup_bun_found = False
    for step in steps:
        if 'uses' in step and 'oven-sh/setup-bun' in step['uses']:
            setup_bun_found = True
            runner.assert_equal(step['uses'], 'oven-sh/setup-bun@v2',
                               "Setup bun step uses v2")
            runner.assert_true('with' in step,
                              "Setup bun step has 'with' configuration")
            if 'with' in step:
                runner.assert_equal(step['with'].get('bun-version'), 'latest',
                                   "Bun version is set to 'latest'")
            break
    
    runner.assert_true(setup_bun_found,
                      "Build job contains setup-bun step")
    
    # Check for build commands
    run_commands = [step.get('run', '') for step in steps if 'run' in step]
    runner.assert_in('bun ci', run_commands,
                    "Build job runs 'bun ci'")
    runner.assert_in('bun run build', run_commands,
                    "Build job runs 'bun run build'")
    
    # Check for artifact upload
    artifact_upload_found = False
    for step in steps:
        if 'uses' in step and 'actions/upload-artifact' in step['uses']:
            artifact_upload_found = True
            runner.assert_equal(step.get('name'), 'Upload build artifacts',
                               "Artifact upload step has descriptive name")
            runner.assert_true('with' in step,
                              "Artifact upload has 'with' configuration")
            if 'with' in step:
                runner.assert_equal(step['with'].get('name'), 'build-output',
                                   "Artifact name is 'build-output'")
                runner.assert_equal(step['with'].get('path'), './dist',
                                   "Artifact path is './dist'")
            break
    
    runner.assert_true(artifact_upload_found,
                      "Build job uploads artifacts")


def test_publish_job_configuration(runner, workflow):
    """
    Verify the publish job's configuration in the parsed workflow.
    
    Checks that the workflow contains a 'publish' job which:
    - runs on 'ubuntu-latest'
    - declares a 'needs' dependency that references 'build' (string or list)
    - defines a 'permissions' mapping with 'contents' set to 'write' and 'packages' set to 'write'
    
    Parameters:
        runner: Test runner instance used to record assertions (optional for most callers).
        workflow (dict): Parsed YAML workflow dictionary returned by load_workflow().
    """
    print("\n--- Testing Publish Job Configuration ---")
    
    jobs = workflow['jobs']
    runner.assert_true('publish' in jobs,
                      "Workflow has 'publish' job")
    
    publish_job = jobs['publish']
    
    runner.assert_equal(publish_job['runs-on'], 'ubuntu-latest',
                       "Publish job runs on ubuntu-latest")
    
    runner.assert_true('needs' in publish_job,
                      "Publish job has 'needs' dependency")
    
    if 'needs' in publish_job:
        needs = publish_job['needs']
        if isinstance(needs, str):
            runner.assert_equal(needs, 'build',
                               "Publish job depends on 'build' job")
        elif isinstance(needs, list):
            runner.assert_in('build', needs,
                            "Publish job depends on 'build' job")
    
    # Test permissions
    runner.assert_true('permissions' in publish_job,
                      "Publish job has permissions defined")
    
    if 'permissions' in publish_job:
        permissions = publish_job['permissions']
        runner.assert_isinstance(permissions, dict,
                                "Publish job permissions is a dictionary")
        runner.assert_equal(permissions.get('contents'), 'write',
                           "Publish job has 'contents: write' permission")
        runner.assert_equal(permissions.get('packages'), 'write',
                           "Publish job has 'packages: write' permission")


def test_publish_job_steps(runner, workflow):
    """
    Verify the publish job's step sequence and required step configurations.
    
    This test asserts that the publish job defines a list of steps with at least four entries, downloads build artifacts with the expected name and path, and contains a publish step that runs the npm publish command via `bunx` with the `--access public` flag and exposes the `NPM_TOKEN` environment variable.
    
    Parameters:
        runner: WorkflowTestRunner used to record assertions and test results.
        workflow (dict): Parsed workflow YAML as a dictionary; the function inspects workflow['jobs']['publish'] for validation.
    """
    print("\n--- Testing Publish Job Steps ---")
    
    publish_job = workflow['jobs']['publish']
    steps = publish_job['steps']
    
    runner.assert_isinstance(steps, list,
                            "Publish job steps is a list")
    
    runner.assert_true(len(steps) >= 4,
                      f"Publish job has at least 4 steps (found {len(steps)})")
    
    # Check for artifact download
    artifact_download_found = False
    for step in steps:
        if 'uses' in step and 'actions/download-artifact' in step['uses']:
            artifact_download_found = True
            runner.assert_equal(step.get('name'), 'Download build artifacts',
                               "Artifact download step has descriptive name")
            runner.assert_true('with' in step,
                              "Artifact download has 'with' configuration")
            if 'with' in step:
                runner.assert_equal(step['with'].get('name'), 'build-output',
                                   "Downloaded artifact name is 'build-output'")
                runner.assert_equal(step['with'].get('path'), './dist',
                                   "Downloaded artifact path is './dist'")
            break
    
    runner.assert_true(artifact_download_found,
                      "Publish job downloads artifacts")
    
    # Check for npm publish step
    publish_step_found = False
    for step in steps:
        if 'run' in step and 'npm publish' in step['run']:
            publish_step_found = True
            runner.assert_equal(step.get('name'), 'Publish to npm',
                               "Publish step has descriptive name")
            runner.assert_true('bunx npm publish --access public' in step['run'],
                              "Publish command uses 'bunx npm publish --access public'")
            runner.assert_true('env' in step,
                              "Publish step has environment variables")
            if 'env' in step:
                runner.assert_true('NPM_TOKEN' in step['env'],
                                  "Publish step uses NPM_TOKEN secret")
            break
    
    runner.assert_true(publish_step_found,
                      "Publish job publishes to npm")


def test_permissions_principle_of_least_privilege(runner, workflow):
    """
    Verify workflow jobs' permissions adhere to the principle of least privilege.
    
    Checks (when a job's `permissions` key is present):
    - For the `build` job: asserts `contents` includes `read` and does not include `write`.
    - For the `publish` job: asserts `contents` equals `write` and `packages` equals `write`.
    
    Parameters:
        runner (WorkflowTestRunner): Test runner used to record assertion results.
        workflow (dict): Parsed workflow YAML as a dictionary.
    """
    print("\n--- Testing Security: Principle of Least Privilege ---")
    
    jobs = workflow['jobs']
    
    # Build job should only have read permissions
    build_job = jobs.get('build', {})
    if 'permissions' in build_job:
        build_perms = build_job['permissions']
        runner.assert_true('read' in str(build_perms.get('contents', '')),
                          "Build job has minimal 'read' permissions")
        runner.assert_true('write' not in str(build_perms.get('contents', '')),
                          "Build job does not have 'write' permissions")
    
    # Publish job needs write permissions
    publish_job = jobs.get('publish', {})
    if 'permissions' in publish_job:
        publish_perms = publish_job['permissions']
        runner.assert_equal(publish_perms.get('contents'), 'write',
                           "Publish job has 'write' permissions for contents")
        runner.assert_equal(publish_perms.get('packages'), 'write',
                           "Publish job has 'write' permissions for packages")


def test_workflow_yaml_validity(runner, workflow):
    """
    Verify the parsed workflow YAML represents a non-empty dictionary that contains required top-level keys and a trigger configuration.
    
    Parameters:
        workflow (dict): Parsed YAML content of the workflow file.
    """
    print("\n--- Testing YAML Validity ---")
    
    runner.assert_isinstance(workflow, dict,
                            "Workflow YAML parses to a dictionary")
    
    runner.assert_true(len(workflow) > 0,
                      "Workflow YAML is not empty")
    
    required_keys = ['name', 'jobs']
    for key in required_keys:
        runner.assert_true(key in workflow,
                          f"Workflow has required key '{key}'")
    
    # Check for trigger config (on or True)
    has_triggers = 'on' in workflow or True in workflow
    runner.assert_true(has_triggers,
                      "Workflow has trigger configuration")


def test_job_isolation_and_dependencies(runner, workflow):
    """
    Verify job isolation and required dependencies in the workflow.
    
    Asserts that the `build` job does not declare a `needs` dependency (so it can run first)
    and that the `publish` job declares `needs` (indicating it depends on prior jobs).
    
    Parameters:
        runner (WorkflowTestRunner): Test runner used to record assertions and results.
        workflow (dict): Parsed workflow YAML as a dictionary.
    """
    print("\n--- Testing Job Dependencies and Isolation ---")
    
    jobs = workflow['jobs']
    
    # Build job should not depend on other jobs
    build_job = jobs.get('build', {})
    runner.assert_true('needs' not in build_job,
                      "Build job does not depend on other jobs (runs first)")
    
    # Publish job should depend on build
    publish_job = jobs.get('publish', {})
    runner.assert_true('needs' in publish_job,
                      "Publish job has dependencies")


def test_action_versions_pinning(runner, workflow):
    """Test that actions use pinned versions"""
    print("\n--- Testing Action Version Pinning ---")
    
    jobs = workflow['jobs']
    
    for job_name, job_config in jobs.items():
        if 'steps' not in job_config:
            continue
        
        for i, step in enumerate(job_config['steps']):
            if 'uses' not in step:
                continue
            
            action = step['uses']
            # Check that actions have version tags (not latest or main)
            runner.assert_true('@' in action,
                              f"Job '{job_name}' step {i+1} action '{action}' is pinned with @version")
            
            if '@' in action:
                version = action.split('@')[1]
                runner.assert_true(version not in ['latest', 'main', 'master'],
                                  f"Job '{job_name}' action '{action}' uses specific version (not 'latest', 'main', or 'master')")


def test_secret_handling(runner, workflow):
    """
    Verifies that any environment values referencing secrets use the GitHub Actions secret interpolation syntax.
    
    Scans each job's steps in the provided workflow and, for any environment value that contains the substring 'secrets.', asserts that the value includes the literal '${{' and '}}' wrapper.
    
    Parameters:
        runner (WorkflowTestRunner): Test runner used to report assertions.
        workflow (dict): Parsed workflow YAML as a dictionary.
    """
    print("\n--- Testing Secret Handling ---")
    
    jobs = workflow['jobs']
    
    # Check that secrets are properly referenced
    for job_name, job_config in jobs.items():
        if 'steps' not in job_config:
            continue
        
        for step in job_config['steps']:
            if 'env' in step:
                for env_key, env_value in step['env'].items():
                    if isinstance(env_value, str) and 'secrets.' in env_value:
                        runner.assert_true('${{' in env_value and '}}' in env_value,
                                          f"Job '{job_name}' properly references secret with ${{{{ }}}}")


def run_all_tests():
    """
    Run the full suite of workflow tests and print a summary.
    
    Loads the release workflow, executes all test functions in a fixed sequence, prints per-test output and a summary, and handles common errors (missing file, YAML parse errors, unexpected exceptions).
    
    Returns:
        int: Exit code where `0` indicates all tests passed and non-zero (`1`) indicates one or more failures or an error.
    """
    runner = WorkflowTestRunner()
    
    try:
        print("="*70)
        print("GitHub Actions Release Workflow Test Suite")
        print("="*70)
        
        workflow = load_workflow()
        
        # Run all test suites
        test_workflow_yaml_validity(runner, workflow)
        test_workflow_structure(runner, workflow)
        test_workflow_triggers(runner, workflow)
        test_environment_variables(runner, workflow)
        test_build_job_configuration(runner, workflow)
        test_build_job_steps(runner, workflow)
        test_publish_job_configuration(runner, workflow)
        test_publish_job_steps(runner, workflow)
        test_permissions_principle_of_least_privilege(runner, workflow)
        test_job_isolation_and_dependencies(runner, workflow)
        test_action_versions_pinning(runner, workflow)
        test_secret_handling(runner, workflow)
        
        return runner.print_summary()
        
    except FileNotFoundError:
        print("ERROR: Could not find .github/workflows/release.yml")
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