import { defineConfig } from "tsdown";

/**
 * tsup Configuration for Dual Package Publishing (ESM/CJS)
 *
 * Design Decision: While tsup advertises as "zero-config", we need this configuration
 * to ensure proper dual ESM/CJS publishing with:
 * 1. Correct file extensions (.js/.cjs) for module resolution
 * 2. Proper TypeScript declaration files (.d.ts/.d.cts)
 * 3. Clean builds and proper source maps for debugging
 * 4. Bundle splitting disabled to maintain individual module structure
 *
 * This setup ensures compatibility with both modern ESM and legacy CJS environments
 * while maintaining type safety and IDE support.
 */
export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs", "esm"], // Output both ESM and CJS formats for maximum compatibility
	dts: true,
	clean: true,
	outDir: "dist",
	sourcemap: true,
	bundle: true,
	minify: true,
	target: "es2020",
	platform: "node",

	// Tree shake unused code
	treeshake: true,
});
