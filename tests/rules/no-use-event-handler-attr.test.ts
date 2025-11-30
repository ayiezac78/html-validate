import { HtmlValidate } from "html-validate";
import { describe, expect, it } from "vitest";
import NoUseEventHandlerAttrRule from "../../src/rules/no-use-event-handler-attr";
import "html-validate/vitest";

const htmlvalidate = new HtmlValidate({
	root: true,
	extends: [],
	plugins: [
		{
			rules: {
				"no-use-event-handler-attr": NoUseEventHandlerAttrRule,
			},
		},
	],
	rules: {
		"no-use-event-handler-attr": "error",
	},
});

describe("NoUseEventHandlerAttrRule", () => {
	it("should pass when no event handler attributes are used", () => {
		const markup = `
      <button id="btn">Click</button>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error for single event handler attribute", () => {
		const markup = `
      <button onclick="alert('hi')"></button>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"no-use-event-handler-attr",
			"The use of the onclick attribute is discouraged. Please use on <script> inside instead.",
		);
	});

	it("should report error for multiple event handler attributes", () => {
		const markup = `
      <button onclick="alert('hi')" onmouseover="console.log('hover')"></button>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
	});

	it("should report error for various event handler types", async () => {
		const markup = `
      <form onsubmit="return false">
        <input onchange="validate()" />
      </form>
    `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report.results[0].messages).toHaveLength(2);
	});

	it("should pass when using data attributes", () => {
		const markup = `
      <button data-onclick="something">Click</button>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});
});
