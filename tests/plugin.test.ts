import type { Plugin } from "html-validate";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the dependencies before importing the plugin
vi.mock("html-validate", async () => {
	const actual = await vi.importActual("html-validate");
	return {
		...actual,
		compatibilityCheck: vi.fn(),
	};
});

vi.mock("../package.json", () => ({
	name: "html-sentinel-shepherd",
	peerDependencies: {
		"html-validate": "^8.0.0",
	},
}));

vi.mock("./configs", () => ({
	default: {
		recommended: {
			rules: {
				"html-sentinel-shepherd/no-block-level-br": ["error"],
			},
		},
	},
}));

vi.mock("./rules", () => ({
	default: {
		"no-block-level-br": {},
		"no-use-event-handler-attr": {},
	},
}));

describe("plugin", () => {
	let plugin: Plugin;
	let compatibilityCheck: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		// Reset modules to ensure clean state
		vi.resetModules();

		// Get the mocked function
		const htmlValidate = await import("html-validate");
		compatibilityCheck = htmlValidate.compatibilityCheck as ReturnType<
			typeof vi.fn
		>;

		// Import the plugin after mocks are set up
		const pluginModule = await import("../src/index");
		plugin = pluginModule.default;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("plugin structure", () => {
		it("should export a plugin object", () => {
			expect(plugin).toBeDefined();
			expect(typeof plugin).toBe("object");
		});

		it("should have required plugin properties", () => {
			expect(plugin).toHaveProperty("name");
			expect(plugin).toHaveProperty("rules");
			expect(plugin).toHaveProperty("configs");
		});

		it("should have the correct plugin name", () => {
			expect(plugin.name).toBe("html-sentinel-shepherd");
		});

		it("should conform to Plugin type", () => {
			// Type assertion to verify structure
			const typedPlugin: Plugin = plugin;
			expect(typedPlugin.name).toBeDefined();
			expect(typedPlugin.rules).toBeDefined();
			expect(typedPlugin.configs).toBeDefined();
		});
	});

	describe("compatibility check", () => {
		it("should call compatibilityCheck on module load", () => {
			expect(compatibilityCheck).toHaveBeenCalledTimes(1);
		});

		it("should call compatibilityCheck with correct arguments", () => {
			expect(compatibilityCheck).toHaveBeenCalledWith(
				"html-sentinel-shepherd",
				"^8.0.0",
			);
		});
	});
});
