import { type HtmlElement, HtmlValidate } from "html-validate";
import { describe, expect, it } from "vitest";
import NoBrBetweenElementsRule from "../../src/rules/no-block-level-br";
import "html-validate/vitest";

const htmlvalidate = new HtmlValidate({
	root: true,
	extends: [],
	plugins: [
		{
			rules: {
				"no-br-between-elements": NoBrBetweenElementsRule,
			},
		},
	],
	rules: {
		"no-br-between-elements": "error",
	},
});

describe("no-br-between-elements", () => {
	it("should handle null parent in getPrevMeaningful", () => {
		const rule = new NoBrBetweenElementsRule();

		// Create a mock node with no parent
		const mockNode = {
			parent: null,
			nodeType: 1,
			tagName: "br",
		} as HtmlElement;

		// Access the private method (TypeScript will complain, but it works at runtime)
		const result = rule.getPrevMeaningful(mockNode);

		expect(result).toBeNull();
	});

	it("should handle null parent in getNextMeaningful", () => {
		const rule = new NoBrBetweenElementsRule();

		// Create a mock node with no parent
		const mockNode = {
			parent: null,
			nodeType: 1,
			tagName: "br",
		} as HtmlElement;

		// Access the private method
		const result = rule.getNextMeaningful(mockNode);

		expect(result).toBeNull();
	});

	it("should handle <br> as first child in parent", () => {
		// Tests getPrevMeaningful when there's no previous sibling
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <div><br><span>Content</span></div>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
	});

	it("should handle <br> as last child in parent", () => {
		// Tests getNextMeaningful when there's no next sibling
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <div><span>Content</span><br></div>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
	});

	it("should handle <br> with only whitespace siblings", () => {
		// Tests when siblings exist but are only whitespace text nodes
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <div>
            <br>
          </div>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
	});

	it("should not report error when <br> is used within text content", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <p>This is some text<br>with a line break in it.</p>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <br> is between text nodes", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <div>First line<br>Second line</div>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <br> has text before it", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Some text before<br></p>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <br> has text after it", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <p><br>Some text after</p>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when <br> is stacked (multiple <br> tags)", async () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <div><br><br></div>
        </body>
      </html>
    `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		// Both br tags will report errors since they're stacked
		expect(report.results[0].messages).toHaveLength(2);
		expect(report.results[0].messages[0].ruleId).toBe("no-br-between-elements");
		expect(report.results[0].messages[0].message).toBe(
			"<br> must be used for line breaks within text content, not for vertical spacing. Avoid stacking <br> tags and using them between block elements.",
		);
	});

	it("should report error when <br> is between block elements", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <div>Content</div>
          <br>
          <div>More content</div>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-br-between-elements",
			"<br> must be used for line breaks within text content, not for vertical spacing. Avoid stacking <br> tags and using them between block elements.",
		);
	});

	it("should report error when <br> is used alone in a container", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <div><br></div>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-br-between-elements",
			"<br> must be used for line breaks within text content, not for vertical spacing. Avoid stacking <br> tags and using them between block elements.",
		);
	});

	it("should report error when multiple <br> tags are stacked with text", async () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Text<br><br>More text</p>
        </body>
      </html>
    `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		// Both br tags will report errors since they're stacked
		expect(report.results[0].messages).toHaveLength(2);
		expect(report.results[0].messages[0].ruleId).toBe("no-br-between-elements");
		expect(report.results[0].messages[1].ruleId).toBe("no-br-between-elements");
	});

	it("should report error when <br> is between inline elements without text", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <span><strong>Bold</strong><br><em>Italic</em></span>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-br-between-elements",
			"<br> must be used for line breaks within text content, not for vertical spacing. Avoid stacking <br> tags and using them between block elements.",
		);
	});

	it("should not report error when <br> separates text and inline element", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Some text<br><strong>Bold text</strong></p>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error for three stacked <br> tags", async () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <div>Content<br><br><br>More content</div>
        </body>
      </html>
    `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		// All three br tags should report errors since they're stacked
		expect(report.results[0].messages).toHaveLength(3);
		expect(report.results[0].messages[0].ruleId).toBe("no-br-between-elements");
		expect(report.results[0].messages[1].ruleId).toBe("no-br-between-elements");
		expect(report.results[0].messages[2].ruleId).toBe("no-br-between-elements");
	});

	it("should report error when <br> is at start of container with only elements after", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <div><br><span>Content</span></div>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-br-between-elements",
			"<br> must be used for line breaks within text content, not for vertical spacing. Avoid stacking <br> tags and using them between block elements.",
		);
	});

	it("should report error when <br> is at end of container with only elements before", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <body>
          <div><span>Content</span><br></div>
        </body>
      </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-br-between-elements",
			"<br> must be used for line breaks within text content, not for vertical spacing. Avoid stacking <br> tags and using them between block elements.",
		);
	});
});
