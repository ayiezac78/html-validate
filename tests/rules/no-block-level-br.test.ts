import { describe, test, expect } from "bun:test";
import { validateHtml, expectError, expectValid } from "../test-utils";

const RULE_ID = "html-sentinel-shepherd/no-block-level-br";

describe("no-block-level-br", () => {
  const rules = { [RULE_ID]: "error" };

  describe("valid cases - br within text", () => {
    test("should pass when br is between text content", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <p>This is some text<br>with a line break in the middle</p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass when br is after text", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <p>First line<br></p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass when br is before text", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <p><br>Second line</p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with multiple brs in text content", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <p>Line one<br>Line two<br>Line three</p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass in address element with text", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <address>
              123 Main Street<br>
              Apartment 4B<br>
              New York, NY 10001
            </address>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass in poem formatting", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <p>
              Roses are red,<br>
              Violets are blue,<br>
              Sugar is sweet,<br>
              And so are you.
            </p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });
  });

  describe("error cases - stacked br tags", () => {
    test("should fail when two br tags are adjacent", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <p>Text</p>
            <br><br>
            <p>More text</p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /vertical spacing|stacking/i);
    });

    test("should fail with three stacked br tags", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div>Content</div>
            <br><br><br>
            <div>More content</div>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /vertical spacing|stacking/i);
    });

    test("should fail with many stacked br tags", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <br><br><br><br><br>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /vertical spacing|stacking/i);
    });
  });

  describe("error cases - br between block elements", () => {
    test("should fail when br is between div elements", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div>First div</div>
            <br>
            <div>Second div</div>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /block elements/i);
    });

    test("should fail when br is between paragraphs", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <p>First paragraph</p>
            <br>
            <p>Second paragraph</p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /block elements/i);
    });

    test("should fail when br is between headings", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <h1>Title</h1>
            <br>
            <h2>Subtitle</h2>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /block elements/i);
    });

    test("should fail when br is between section elements", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <section>First section</section>
            <br>
            <section>Second section</section>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /block elements/i);
    });

    test("should fail when br is after block element at end", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div>Content</div>
            <br>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /block elements/i);
    });

    test("should fail when br is before block element at start", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <br>
            <div>Content</div>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /block elements/i);
    });
  });

  describe("edge cases", () => {
    test("should handle br with whitespace around it", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            Some text
            <br>
            More text
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should handle self-closing br syntax", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <p>Text<br/>more text</p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should handle br in inline elements", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <span>Text<br>more text</span>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should handle mixed content with inline elements", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <p>This is <strong>bold text</strong><br>on multiple lines</p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should handle empty elements around br", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <p></p>
            <br>
            <p></p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /block elements/i);
    });
  });
});