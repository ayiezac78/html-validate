import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs", "esm"],
	dts: true,
	clean: true,
	outDir: "dist",
	sourcemap: true,
	bundle: true,
	minify: true,
	target: "es2020",
	platform: "node",
	treeshake: true,
});
