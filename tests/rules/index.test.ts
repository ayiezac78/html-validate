import { describe, expect, it } from "vitest";
import rules from "../../src/rules/index.ts";

describe("rules", () => {
	it("should be defined", () => {
		expect(rules).toBeDefined();
	});

	expect(rules).toMatchObject({
		"html-sentinel-shepherd/no-block-level-br": expect.any(Function),
		"html-sentinel-shepherd/no-use-event-handler-attr": expect.any(Function),
		"html-sentinel-shepherd/link-rel-canonical-require": expect.any(Function),
		"html-sentinel-shepherd/meta-description-require": expect.any(Function),
		"html-sentinel-shepherd/required-figcaption": expect.any(Function),
		"html-sentinel-shepherd/required-img-width-height-attr":
			expect.any(Function),
	});
});
