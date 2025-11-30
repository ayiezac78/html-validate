# Testing Documentation

## Test Suite Overview

This project includes a comprehensive test suite covering all custom html-validate rules and plugin functionality.

### Test Statistics
- **Total Lines of Test Code**: 2,079 lines
- **Test Files**: 8 files
- **Rules Tested**: 6 custom rules
- **Test Categories**: Valid cases, error cases, and edge cases

## Running Tests

### Run all tests
```bash
bun test
```

### Run specific test file
```bash
bun test tests/rules/link-rel-canonical-require.test.ts
```

### Run tests in watch mode
```bash
bun test --watch
```

## Test Coverage by Rule

All 6 custom rules have comprehensive test coverage including:
- Valid cases (proper usage)
- Error cases (violations)
- Edge cases (boundary conditions)

### Rules Tested
1. link-rel-canonical-require (187 lines)
2. meta-description-require (248 lines)
3. no-block-level-br (303 lines)
4. no-use-event-handler-attr (357 lines)
5. required-figcaption (377 lines)
6. required-img-width-height-attr (396 lines)

## Benefits

- Regression Prevention
- Living Documentation
- Refactoring Confidence
- CI/CD Ready