#!/usr/bin/env python3
"""
Documentation validation tests
"""

import sys
import re
from pathlib import Path


class DocTestRunner:
    def __init__(self):
        self.tests_passed = 0
        self.tests_failed = 0

    def assert_true(self, condition, test_name):
        if condition:
            self.tests_passed += 1
            print(f"✓ PASS: {test_name}")
        else:
            self.tests_failed += 1
            print(f"✗ FAIL: {test_name}")
        return condition

    def print_summary(self):
        total = self.tests_passed + self.tests_failed
        print("\n" + "="*70)
        print(f"DOCUMENTATION TEST SUMMARY: {self.tests_passed}/{total} tests passed")
        if self.tests_failed > 0:
            return 1
        print("\n🎉 All documentation tests passed!")
        return 0


def test_readme_exists(runner):
    """Test README exists and has content"""
    print("\n--- Testing README Documentation ---")
    
    path = Path('tests/workflows/README.md')
    runner.assert_true(path.exists(), "README.md exists")
    
    if path.exists():
        content = path.read_text()
        runner.assert_true(len(content) > 500, "README has content")
        runner.assert_true('```' in content, "README has code examples")


def test_implementation_notes_exist(runner):
    """Test implementation notes exist"""
    print("\n--- Testing Implementation Notes ---")
    
    path = Path('tests/workflows/IMPLEMENTATION_NOTES.md')
    runner.assert_true(path.exists(), "IMPLEMENTATION_NOTES.md exists")
    
    if path.exists():
        content = path.read_text()
        runner.assert_true(len(content) > 1000, "Notes are detailed")


def test_python_files_have_docstrings(runner):
    """Test Python files have docstrings"""
    print("\n--- Testing Python Docstrings ---")
    
    test_files = [
        'tests/workflows/test_release_workflow.py',
        'tests/workflows/test_workflow_consistency.py',
    ]
    
    for test_file in test_files:
        path = Path(test_file)
        if path.exists():
            content = path.read_text()
            lines = content.split('\n')
            runner.assert_true(lines[0].startswith('#!'),
                f"{test_file} has shebang")
            
            has_docstring = any('"""' in line or "'''" in line 
                              for line in lines[:10])
            runner.assert_true(has_docstring,
                f"{test_file} has module docstring")


def test_requirements_file(runner):
    """Test requirements.txt exists and is valid"""
    print("\n--- Testing Requirements File ---")
    
    path = Path('tests/workflows/requirements.txt')
    runner.assert_true(path.exists(), "requirements.txt exists")
    
    if path.exists():
        content = path.read_text()
        runner.assert_true('PyYAML' in content or 'pyyaml' in content,
            "requirements.txt includes PyYAML")


def test_shell_script_documented(runner):
    """Test shell script has proper comments"""
    print("\n--- Testing Shell Script Documentation ---")
    
    path = Path('tests/workflows/run_all_tests.sh')
    runner.assert_true(path.exists(), "run_all_tests.sh exists")
    
    if path.exists():
        content = path.read_text()
        runner.assert_true(content.startswith('#!/bin/bash'),
            "Shell script has shebang")
        
        comments = [l for l in content.split('\n') if l.strip().startswith('#')]
        runner.assert_true(len(comments) >= 3,
            "Shell script has comments")


def run_all_tests():
    """Run all documentation tests"""
    runner = DocTestRunner()
    
    try:
        print("="*70)
        print("Documentation Validation Test Suite")
        print("="*70)
        
        test_readme_exists(runner)
        test_implementation_notes_exist(runner)
        test_python_files_have_docstrings(runner)
        test_requirements_file(runner)
        test_shell_script_documented(runner)
        
        return runner.print_summary()
        
    except Exception as e:
        print(f"ERROR: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(run_all_tests())