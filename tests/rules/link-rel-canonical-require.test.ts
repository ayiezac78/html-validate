import { describe, test, expect } from "bun:test";
import { validateHtml, expectError, expectValid } from "../test-utils";

const RULE_ID = "html-sentinel-shepherd/link-rel-canonical-require";

describe("link-rel-canonical-require", () => {
  const rules = { [RULE_ID]: "error" };

  describe("valid cases", () => {
    test("should pass when canonical link is present with href", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="canonical" href="https://example.com/page">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with relative canonical href", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="canonical" href="/page">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with full URL canonical href", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="canonical" href="https://example.com/path/to/page?query=value#fragment">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });
  });

  describe("error cases - missing canonical link", () => {
    test("should fail when no canonical link is present", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test</title>
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "must be present inside <head>");
    });

    test("should fail when head tag exists but no canonical", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Test Page</title>
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "must be present inside <head>");
    });
  });

  describe("error cases - empty href", () => {
    test("should fail when canonical link has no href attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="canonical">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "non-empty href attribute");
    });

    test("should fail when canonical link has empty href", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="canonical" href="">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "non-empty href attribute");
    });

    test("should fail when canonical link has whitespace-only href", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="canonical" href="   ">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "non-empty href attribute");
    });

    test("should fail when canonical link has tab/newline href", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="canonical" href="
            ">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "non-empty href attribute");
    });
  });

  describe("edge cases", () => {
    test("should handle document without head tag", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      // Should not throw, just skip validation when no head
      expect(report).toBeDefined();
    });

    test("should handle multiple canonical links (first one checked)", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="canonical" href="https://example.com/page1">
            <link rel="canonical" href="https://example.com/page2">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should handle canonical with other link types", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="style.css">
            <link rel="canonical" href="https://example.com/page">
            <link rel="icon" href="favicon.ico">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });
  });
});