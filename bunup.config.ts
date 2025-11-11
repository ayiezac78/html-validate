import type { BuildConfig } from "bun";
import { defineConfig } from "bunup";

export default defineConfig({
	entry: ["./src/index.ts"],
	outDir: "./dist",
	dts: true,
	clean: true,
	format: ["cjs", "esm"],
	minify: true,
	target: "node",
	splitting: true,
}) as BuildConfig;
