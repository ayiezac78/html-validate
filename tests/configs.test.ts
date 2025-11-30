import { describe, expect, it } from "vitest";
import configs from "../src/configs";

describe("configs", () => {
	it("should export recommended config", () => {
		expect(configs).toHaveProperty("recommended");
	});

	it("should contain required rules", () => {
		const rules = configs.recommended.rules;

		expect(rules).toBeDefined();

		expect(rules).toHaveProperty("html-sentinel-shepherd/no-block-level-br");
		expect(rules).toHaveProperty(
			"html-sentinel-shepherd/no-use-event-handler-attr",
		);
		expect(rules).toHaveProperty(
			"html-sentinel-shepherd/link-rel-canonical-require",
		);
		expect(rules).toHaveProperty(
			"html-sentinel-shepherd/meta-description-require",
		);
		expect(rules).toHaveProperty("html-sentinel-shepherd/required-figcaption");
		expect(rules).toHaveProperty(
			"html-sentinel-shepherd/required-img-width-height-attr",
		);
	});

	it("should mark all rules as error", () => {
		const rules = configs.recommended.rules as {
			[key: string]: string[];
		};

		for (const [_key, value] of Object.entries(rules)) {
			expect(value).toEqual(["error"]);
		}
	});
});
