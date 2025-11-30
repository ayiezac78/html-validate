import { describe, test, expect } from "bun:test";
import { validateHtml, expectError, expectValid } from "../test-utils";

const RULE_ID = "html-sentinel-shepherd/no-use-event-handler-attr";

describe("no-use-event-handler-attr", () => {
  const rules = { [RULE_ID]: "error" };

  describe("valid cases - no event handlers", () => {
    test("should pass when no event handler attributes are used", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <button id="myButton">Click me</button>
            <a href="/page">Link</a>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with data attributes", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div data-action="click" data-handler="myHandler">Content</div>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with aria attributes", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <button aria-label="Close" aria-pressed="false">X</button>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });
  });

  describe("error cases - common event handlers", () => {
    test("should fail with onclick attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <button onclick="alert('Hello')">Click</button>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onclick/i);
    });

    test("should fail with onload attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body onload="init()">
            <p>Content</p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onload/i);
    });

    test("should fail with onchange attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <input type="text" onchange="handleChange()">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onchange/i);
    });

    test("should fail with onsubmit attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <form onsubmit="return validate()">
              <input type="submit">
            </form>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onsubmit/i);
    });

    test("should fail with onmouseover attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div onmouseover="highlight(this)">Hover me</div>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onmouseover/i);
    });

    test("should fail with onmouseout attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div onmouseout="unhighlight(this)">Hover me</div>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onmouseout/i);
    });

    test("should fail with onkeydown attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <input type="text" onkeydown="handleKey(event)">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onkeydown/i);
    });

    test("should fail with onkeyup attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <input type="text" onkeyup="validate()">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onkeyup/i);
    });

    test("should fail with onfocus attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <input type="text" onfocus="showHelp()">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onfocus/i);
    });

    test("should fail with onblur attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <input type="text" onblur="hideHelp()">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onblur/i);
    });
  });

  describe("error cases - form events", () => {
    test("should fail with oninput attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <input type="text" oninput="liveValidate()">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /oninput/i);
    });

    test("should fail with onreset attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <form onreset="clearData()">
              <input type="reset">
            </form>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onreset/i);
    });
  });

  describe("error cases - mouse events", () => {
    test("should fail with ondblclick attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div ondblclick="edit()">Double click to edit</div>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /ondblclick/i);
    });

    test("should fail with onmousedown attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <button onmousedown="startDrag()">Drag</button>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onmousedown/i);
    });

    test("should fail with onmouseup attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <button onmouseup="endDrag()">Drag</button>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onmouseup/i);
    });

    test("should fail with onmousemove attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div onmousemove="track(event)">Track mouse</div>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onmousemove/i);
    });
  });

  describe("error cases - window/document events", () => {
    test("should fail with onerror attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="invalid.jpg" onerror="handleError()">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onerror/i);
    });

    test("should fail with onresize attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body onresize="handleResize()">
            <p>Content</p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onresize/i);
    });

    test("should fail with onscroll attribute", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body onscroll="trackScroll()">
            <p>Content</p>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onscroll/i);
    });
  });

  describe("edge cases - multiple handlers", () => {
    test("should fail when element has multiple event handlers", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <button onclick="foo()" onmouseover="bar()">Button</button>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expect(report.valid).toBe(false);
      // Should report both errors
      expect(report.errorCount).toBeGreaterThanOrEqual(2);
    });

    test("should fail for all elements with handlers in document", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <button onclick="foo()">Button 1</button>
            <button onclick="bar()">Button 2</button>
            <input type="text" onchange="baz()">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expect(report.valid).toBe(false);
      expect(report.errorCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe("edge cases - case sensitivity", () => {
    test("should handle lowercase event handlers", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <button onclick="test()">Click</button>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /onclick/i);
    });
  });
});