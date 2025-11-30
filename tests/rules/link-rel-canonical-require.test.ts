import { HtmlValidate } from "html-validate";
import { describe, expect, it } from "vitest";
import LinkRelCanonicalRequire from "../../src/rules/link-rel-canonical-require";
import "html-validate/vitest";

const htmlvalidate = new HtmlValidate({
	root: true,
	extends: [],
	plugins: [
		{
			rules: {
				"link-rel-canonical-require": LinkRelCanonicalRequire,
			},
		},
	],
	rules: {
		"link-rel-canonical-require": "error",
	},
});

describe("link-rel-canonical-require", () => {
	it("should not report error when link rel='canonical' is present in head with non-empty href", () => {
		const markup = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>Test</title>
					<link rel="canonical" href="https://example.com">
				</head>
			</html>
		`;

		expect.assertions(1);
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when link rel='canonical' is not present in head", () => {
		const markup = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>Test</title>
				</head>
			</html>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"link-rel-canonical-require",
			"<link rel='canonical'> must be present inside <head>.",
		);
	});

	it("should report error when href attribute is missing", () => {
		const markup = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>Test</title>
					<link rel="canonical">
				</head>
			</html>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"link-rel-canonical-require",
			"<link rel='canonical'> must have a non-empty href attribute.",
		);
	});

	it("should not report error when head element is missing", () => {
		const markup = `
        <!DOCTYPE html>
        <html>
            <body>Test</body>
        </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid(); // or expect it to be invalid, depending on your rule's intent
	});

	it("should report error when href attribute is empty", () => {
		const markup = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>Test</title>
					<link rel="canonical" href="">
				</head>
			</html>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"link-rel-canonical-require",
			"<link rel='canonical'> must have a non-empty href attribute.",
		);
	});

	it("should report error when href attribute is blank", () => {
		const markup = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>Test</title>
					<link rel="canonical" href="  ">
				</head>
			</html>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"link-rel-canonical-require",
			"<link rel='canonical'> must have a non-empty href attribute.",
		);
	});

	it("should report error when multiple canonical links are present", async () => {
		const markup = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>Test</title>
					<link rel="canonical" href="https://example.com/a">
					<link rel="canonical" href="https://example.com/b">
				</head>
			</html>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"link-rel-canonical-require",
			"Multiple canonical <link> tags found; only one is allowed.",
		);
	});

	it("should report error when href attribute has an invalid URL", () => {
		const invalidUrl = "not-a-valid-url";
		const markup = `
		<!DOCTYPE html>
		            <html>
		                <head>
		                    <title>Test</title>
		                    <link rel="canonical" href="${invalidUrl}">
		                </head>
		            </html>
		        `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"link-rel-canonical-require",
			`<link rel='canonical'> has an invalid URL: "${invalidUrl}".`,
		);
	});

	it("should handle link without rel attribute", () => {
		const markup = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Test</title>
                <link href="https://example.com">
            </head>
        </html>
    `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
	});

	it("should not report if the href contains SSI", () => {
		const markup = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>Test</title>
					<link rel="canonical" href="<!--#include virtual='/imagemap/canonical-domain.shtml'-->/dating/">
				</head>
			</html>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});
});
