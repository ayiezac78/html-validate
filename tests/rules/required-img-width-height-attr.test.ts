import { describe, test, expect } from "bun:test";
import { validateHtml, expectError, expectValid } from "../test-utils";

const RULE_ID = "html-sentinel-shepherd/required-img-width-height-attr";

describe("required-img-width-height-attr", () => {
  const rules = { [RULE_ID]: "error" };

  describe("valid cases", () => {
    test("should pass when img has both width and height", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="image.jpg" alt="Description" width="800" height="600">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with numeric width and height values", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="photo.jpg" alt="Photo" width="1920" height="1080">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with small dimensions", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="icon.png" alt="Icon" width="16" height="16">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with large dimensions", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="banner.jpg" alt="Banner" width="3840" height="2160">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with width and height in different order", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img height="600" src="image.jpg" width="800" alt="Test">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with multiple imgs having dimensions", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="image1.jpg" alt="First" width="800" height="600">
            <img src="image2.jpg" alt="Second" width="1024" height="768">
            <img src="image3.jpg" alt="Third" width="640" height="480">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with img having other attributes", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img 
              src="image.jpg" 
              alt="Description" 
              width="800" 
              height="600"
              loading="lazy"
              decoding="async"
              class="responsive"
              id="main-image"
            >
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should pass with non-square aspect ratio", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="wide.jpg" alt="Wide image" width="1600" height="900">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should not validate non-img elements", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div>Not an image</div>
            <video src="video.mp4"></video>
            <canvas></canvas>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });
  });

  describe("error cases - missing both attributes", () => {
    test("should fail when img has neither width nor height", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="image.jpg" alt="Description">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /both.*width.*height/i);
    });

    test("should fail with only src and alt attributes", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="photo.jpg" alt="Photo">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /both.*width.*height/i);
    });

    test("should fail with img having many other attributes but no dimensions", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img 
              src="image.jpg" 
              alt="Description"
              loading="lazy"
              decoding="async"
              class="responsive"
              id="image"
            >
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /both.*width.*height/i);
    });
  });

  describe("error cases - missing width only", () => {
    test("should fail when img has height but no width", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="image.jpg" alt="Description" height="600">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /missing.*width/i);
    });

    test("should fail with only height attribute present", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="photo.jpg" alt="Photo" height="1080">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /missing.*width/i);
    });

    test("should fail with height and other attributes but no width", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img 
              src="image.jpg" 
              alt="Description" 
              height="600"
              loading="lazy"
            >
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /missing.*width/i);
    });
  });

  describe("error cases - missing height only", () => {
    test("should fail when img has width but no height", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="image.jpg" alt="Description" width="800">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /missing.*height/i);
    });

    test("should fail with only width attribute present", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="photo.jpg" alt="Photo" width="1920">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /missing.*height/i);
    });

    test("should fail with width and other attributes but no height", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img 
              src="image.jpg" 
              alt="Description" 
              width="800"
              class="responsive"
            >
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /missing.*height/i);
    });
  });

  describe("edge cases", () => {
    test("should validate all imgs in document", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="image1.jpg" alt="Valid" width="800" height="600">
            <img src="image2.jpg" alt="Invalid">
            <img src="image3.jpg" alt="Also invalid" width="800">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expect(report.valid).toBe(false);
      // Should have at least 2 errors (one for each invalid img)
      expect(report.errorCount).toBeGreaterThanOrEqual(2);
    });

    test("should handle img in different contexts", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div>
              <p>
                <img src="inline.jpg" alt="Inline" width="100" height="100">
              </p>
            </div>
            <figure>
              <img src="figure.jpg" alt="In figure" width="800" height="600">
            </figure>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should handle img with srcset", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img 
              src="image.jpg" 
              srcset="image-2x.jpg 2x, image-3x.jpg 3x"
              alt="Description" 
              width="800" 
              height="600"
            >
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should handle img inside picture element", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <picture>
              <source srcset="image.webp" type="image/webp">
              <img src="image.jpg" alt="Description" width="800" height="600">
            </picture>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should fail for img inside picture without dimensions", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <picture>
              <source srcset="image.webp" type="image/webp">
              <img src="image.jpg" alt="Description">
            </picture>
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectError(report, /both.*width.*height/i);
    });

    test("should handle zero dimensions", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="tracking.gif" alt="" width="0" height="0">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });

    test("should handle img with width and height of 1", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="pixel.gif" alt="" width="1" height="1">
          </body>
        </html>
      `;
      const report = await validateHtml(html, rules);
      expectValid(report);
    });
  });
});