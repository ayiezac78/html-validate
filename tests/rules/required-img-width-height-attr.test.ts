import { HtmlValidate } from "html-validate";
import { describe, expect, it } from "vitest";
import RequiredWidthHeightRule from "../../src/rules/required-img-width-height-attr";
import "html-validate/vitest";

const htmlvalidate = new HtmlValidate({
	root: true,
	extends: [],
	plugins: [
		{
			rules: {
				"required-img-width-height-attr": RequiredWidthHeightRule,
			},
		},
	],
	rules: {
		"required-img-width-height-attr": "error",
	},
});

describe("RequiredWidthHeightRule", () => {
	it("should not report error when width and height attribute in img tag is filled with modern format", () => {
		const html = `
      <img src="test.webp" alt="Test" width="100" height="100">
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeValid();
	});

	it("should report error when width and height attribute in img tag is missing", () => {
		const html = `
      <img src="test.webp" alt="Test">
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"required-img-width-height-attr",
			"<img> element must have both 'width' and 'height' attributes.",
		);
	});

	it("should report error when width attr is present but height attribute in img tag is missing", () => {
		const html = `
      <img src="test.webp" alt="Test" width="100">
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"required-img-width-height-attr",
			"<img> element is missing the 'height' attribute.",
		);
	});

	it("should report error when height attr is present but width attribute in img tag is missing", () => {
		const html = `
      <img src="test.webp" alt="Test" height="100">
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"required-img-width-height-attr",
			"<img> element is missing the 'width' attribute.",
		);
	});

	it("should report error when using legacy JPG format", () => {
		const html = `
      <img src="test.jpg" alt="Test" height="100" width="100">
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"required-img-width-height-attr",
			"Use modern image formats like WebP or AVIF instead of PNG/JPG/JPEG for better performance.",
		);
	});

	it("should report error when using legacy JPEG format", () => {
		const html = `
      <img src="test.jpeg" alt="Test" height="100" width="100">
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"required-img-width-height-attr",
			"Use modern image formats like WebP or AVIF instead of PNG/JPG/JPEG for better performance.",
		);
	});

	it("should report error when using legacy PNG format", () => {
		const html = `
      <img src="test.png" alt="Test" height="100" width="100">
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"required-img-width-height-attr",
			"Use modern image formats like WebP or AVIF instead of PNG/JPG/JPEG for better performance.",
		);
	});

	it("should not report error when using modern WebP format", () => {
		const html = `
      <img src="test.webp" alt="Test" height="100" width="100">
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeValid();
	});

	it("should not report error when using modern AVIF format", () => {
		const html = `
      <img src="test.avif" alt="Test" height="100" width="100">
    `;

		const report = htmlvalidate.validateString(html);

		expect(report).toBeValid();
	});
});
