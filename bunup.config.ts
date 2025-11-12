import type { BuildConfig } from "bun";
import { defineConfig } from "bunup";

export default defineConfig({
	entry: ["src/index.ts"],
	outDir: "dist",
	dts: true,
	clean: true,
	format: ["esm"],
	minify: true,
	target: "node",
	sourcemap: "linked",
	packages: "bundle",
}) as BuildConfig;
