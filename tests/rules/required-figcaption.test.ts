import { describe, test, expect } from "bun:test";
import { validateHtml, expectError, expectValid } from "../test-utils";

const RULE_ID = "html-sentinel-shepherd/required-figcaption";

describe("required-figcaption", () => {
  const rules = { [RULE_ID]: "error" };

  describe("valid cases", () => {
    test("should pass when figure has both img and figcaption", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <img src="image.jpg" alt="Description">
              <figcaption>Image caption</figcaption>
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass when figcaption comes before img", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <figcaption>Image caption</figcaption>
              <img src="image.jpg" alt="Description">
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with multiple images in figure", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <img src="image1.jpg" alt="First">
              <img src="image2.jpg" alt="Second">
              <figcaption>Multiple images caption</figcaption>
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with complex figcaption content", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <img src="chart.jpg" alt="Sales chart">
              <figcaption>
                <strong>Figure 1:</strong> Sales data from 2020-2023
                <em>(Source: Company Reports)</em>
              </figcaption>
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with picture element inside figure", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <picture>
                <source srcset="image.webp" type="image/webp">
                <img src="image.jpg" alt="Description">
              </picture>
              <figcaption>Image caption</figcaption>
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass when no figure element is present", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="image.jpg" alt="Standalone image">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });
  });

  describe("error cases - missing figcaption", () => {
    test("should fail when figure has img but no figcaption", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <img src="image.jpg" alt="Description">
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /figcaption.*required/i);
    });

    test("should fail when figure has only img without figcaption", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <img src="photo.jpg" alt="Photo" width="800" height="600">
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /figcaption.*required/i);
    });

    test("should fail when figure has multiple imgs but no figcaption", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <img src="image1.jpg" alt="First">
              <img src="image2.jpg" alt="Second">
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /figcaption.*required/i);
    });

    test("should fail when figure has picture but no figcaption", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <picture>
                <source srcset="image.webp" type="image/webp">
                <img src="image.jpg" alt="Description">
              </picture>
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /figcaption.*required/i);
    });
  });

  describe("error cases - missing img", () => {
    test("should fail when figure has figcaption but no img", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <figcaption>Caption without image</figcaption>
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /img.*required/i);
    });

    test("should fail when figure has only text content", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              Some text content
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /img.*required/i);
    });

    test("should fail when figure has video but no img", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <video src="video.mp4"></video>
              <figcaption>Video caption</figcaption>
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /img.*required/i);
    });

    test("should fail when figure has svg but no img", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <svg width="100" height="100">
                <circle cx="50" cy="50" r="40" />
              </svg>
              <figcaption>SVG caption</figcaption>
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /img.*required/i);
    });
  });

  describe("error cases - missing both", () => {
    test("should fail when figure is empty", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure></figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expect(report.valid).toBe(false);
      // Should report both missing img and figcaption
      expect(report.errorCount).toBeGreaterThanOrEqual(2);
    });

    test("should fail when figure has only whitespace", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expect(report.valid).toBe(false);
      expect(report.errorCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe("edge cases", () => {
    test("should handle multiple figure elements", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <img src="image1.jpg" alt="First">
              <figcaption>First caption</figcaption>
            </figure>
            <figure>
              <img src="image2.jpg" alt="Second">
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expect(report.valid).toBe(false);
      // Only second figure should fail
      expect(report.errorCount).toBeGreaterThanOrEqual(1);
    });

    test("should handle nested figure elements", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <img src="outer.jpg" alt="Outer">
              <figure>
                <img src="inner.jpg" alt="Inner">
                <figcaption>Inner caption</figcaption>
              </figure>
              <figcaption>Outer caption</figcaption>
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should handle figcaption with nested elements", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <img src="image.jpg" alt="Description">
              <figcaption>
                <p>Caption paragraph</p>
                <cite>Source information</cite>
              </figcaption>
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should handle img with complex attributes", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <img 
                src="image.jpg" 
                alt="Description" 
                width="800" 
                height="600"
                loading="lazy"
                decoding="async"
                srcset="image-2x.jpg 2x"
              >
              <figcaption>Caption</figcaption>
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should handle empty figcaption", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <figure>
              <img src="image.jpg" alt="Description">
              <figcaption></figcaption>
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });
  });
});