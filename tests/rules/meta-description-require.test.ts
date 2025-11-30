import { describe, test, expect } from "bun:test";
import { validateHtml, expectError, expectValid } from "../test-utils";

const RULE_ID = "html-sentinel-shepherd/meta-description-require";

describe("meta-description-require", () => {
  const rules = { [RULE_ID]: "error" };

  describe("valid cases", () => {
    test("should pass with optimal description length (70-160 chars)", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description" content="This is a test description that is long enough to be valid and within the recommended range for SEO purposes.">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with exactly 70 characters", async () => {
      const content = "a".repeat(70);
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description" content="${content}">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with exactly 160 characters", async () => {
      const content = "a".repeat(160);
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description" content="${content}">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with description containing special characters", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description" content="Test with special chars: !@#$%^&*()_+-=[]{}|;:',.<>?/~ and unicode: 你好 привет 🎉 - exactly 115 chars">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });
  });

  describe("error cases - missing meta description", () => {
    test("should fail when meta description is not present", async () => {
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

    test("should fail when head has other meta tags but no description", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width">
            <title>Test</title>
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "must be present inside <head>");
    });
  });

  describe("error cases - empty content", () => {
    test("should fail when content attribute is missing", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "content attribute must not be empty");
    });

    test("should fail when content attribute is empty string", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description" content="">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "content attribute must not be empty");
    });

    test("should fail when content is only whitespace", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description" content="     ">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "content attribute must not be empty");
    });
  });

  describe("error cases - length validation", () => {
    test("should fail when content is too short (< 70 chars)", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description" content="Too short">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "70-160 characters");
    });

    test("should fail when content is 69 characters", async () => {
      const content = "a".repeat(69);
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description" content="${content}">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "70-160 characters");
    });

    test("should fail when content is too long (> 160 chars)", async () => {
      const content = "a".repeat(161);
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description" content="${content}">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "70-160 characters");
    });

    test("should fail with significantly long content", async () => {
      const content = "a".repeat(300);
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description" content="${content}">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, "70-160 characters");
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
      expect(report).toBeDefined();
    });

    test("should handle multiple meta description tags (first one validated)", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="description" content="This is a valid description that meets all the requirements and is within the character limit.">
            <meta name="description" content="short">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should only validate meta with name='description'", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:description" content="short">
            <meta name="description" content="This is a valid description that meets all the requirements and is within the character limit.">
          </head>
          <body></body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });
  });
});