import { HtmlValidate } from "html-validate";
import { describe, expect, it } from "vitest";
import RequiredFigcaptionRule from "../../src/rules/required-figcaption";
import "html-validate/vitest";

const htmlvalidate = new HtmlValidate({
	root: true,
	extends: [],
	plugins: [
		{
			rules: {
				"required-figcaption": RequiredFigcaptionRule,
			},
		},
	],
	rules: {
		"required-figcaption": "error",
	},
});

describe("required-figcaption", () => {
	it("should not report error when using figure with figcaption", () => {
		const html = `
      <figure class="img-caption">
        <img src="test.jpg" alt="Test">
        <figcaption>Photo credit</figcaption>
      </figure>
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeValid();
	});

	it("should report error when img tag is missing", () => {
		const html = `
      <figure class="img-caption">
        <figcaption>Photo credit</figcaption>
      </figure>
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"required-figcaption",
			"The <img> element is required for <figure> elements.",
		);
	});

	it("should report error when div contains both img and cite", () => {
		const html = `
      <div class="img-caption">
        <img src="test.jpg" alt="Test">
        <cite>Photo credit</cite>
      </div>
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"required-figcaption",
			"Consider using <figure> with <figcaption> instead of <div> with <img> and <cite> for better semantic HTML.",
		);
	});

	it("should report error when figcaption is missing", () => {
		const html = `
      <figure class="img-caption">
        <img src="test.jpg" alt="Test">
        <cite>Photo credit</cite>
      </figure>
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"required-figcaption",
			"Use <figcaption> instead of <cite> for image captions within <figure> elements.",
		);
	});

	it("should not report error when div contains only img", () => {
		const html = `
      <div class="img-caption">
        <img src="test.jpg" alt="Test">
      </div>
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeValid();
	});

	it("should report error when figcaption is missing", () => {
		const html = `
	    <figure class="img-caption">
	      <img src="test.jpg" alt="Test">
	    </figure>
	  `;

		const report = htmlvalidate.validateString(html);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"required-figcaption",
			"The <figcaption> element is required for <figure> elements.",
		);
	});
});
