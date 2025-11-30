# Test Suite for html-sentinel-shepherd

This directory contains comprehensive unit tests for the html-sentinel-shepherd plugin.

## Running Tests

To run all tests:
```bash
bun test
```

To run a specific test file:
```bash
bun test tests/rules/link-rel-canonical-require.test.ts
```

## Test Coverage

The test suite covers all 6 custom rules plus plugin configuration and integration.

### Rules Tested
- link-rel-canonical-require
- meta-description-require  
- no-block-level-br
- no-use-event-handler-attr
- required-figcaption
- required-img-width-height-attr

Each rule has comprehensive tests for valid cases, error cases, and edge cases.