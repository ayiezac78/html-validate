import { HtmlValidate } from "html-validate";
import { describe, expect, it } from "vitest";
import MetaDescriptionRequire from "../../src/rules/meta-description-require";
import "html-validate/vitest";

const htmlvalidate = new HtmlValidate({
	root: true,
	extends: [],
	plugins: [
		{
			rules: {
				"meta-description-require": MetaDescriptionRequire,
			},
		},
	],
	rules: {
		"meta-description-require": "error",
	},
});

describe("meta-description-require", () => {
	it("should not report error when <meta name='description'> is present in <head>", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test</title>
          <meta name="description" content="This is a valid meta description with exactly the right length needed for SEO">
        </head>
      </html>
    `;
		expect.assertions(1);
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when <meta name='description'> is not present in <head>", () => {
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
			"meta-description-require",
			"<meta name='description'> must be present inside <head> tag.",
		);
	});

	it("should report if content description is empty", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test</title>
          <meta name="description" content="">
        </head>
      </html>
    `;

		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"meta-description-require",
			"<meta name='description'> content attribute must not be empty.",
		);
	});

	it("should report if meta content description is less than 70 character length", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test</title>
          <meta name="description" content="test content">
        </head>
      </html>
    `;

		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"meta-description-require",
			"<meta name='description'> content should be 70-160 characters long.",
		);
	});

	it("should report if meta content description is more than 160 character length", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test</title>
          <meta name="description" content="asdsasdsasdsasdsdsassssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss">
        </head>
      </html>
    `;

		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"meta-description-require",
			"<meta name='description'> content should be 70-160 characters long.",
		);
	});

	it("should not report error when content is exactly 70 characters", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test</title>
          <meta name="description" content="A meta description that is exactly seventy characters long for testing">
        </head>
      </html>
    `;

		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when content is exactly 160 characters", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test</title>
          <meta name="description" content="This meta description is exactly one hundred and sixty characters long which is the maximum allowed length for optimal SEO performance and search results.">
        </head>
      </html>
    `;

		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when meta description is having duplicates", () => {
		const markup = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test</title>
          <meta name="description" content="This meta description is exactly one hundred and sixty characters long which is the maximum allowed length for optimal SEO performance and search results.">
          <meta name="description" content="This meta description is exactly one hundred and sixty characters long which is the maximum allowed length for optimal SEO performance and search results.">
        </head>
      </html>
    `;

		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"meta-description-require",
			"Multiple <meta name='description'> tags found; only one is allowed.",
		);
	});
});
