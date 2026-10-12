import { readFileSync } from "node:fs"
import { defineConfig } from "tsup"

/**
 * Build for extraction/publishing. In the workspace, @sableui/react is consumed as
 * SOURCE (package.json `exports` point at ./src) for instant HMR. This build
 * produces the publishable ./dist artifact; `publishConfig.exports` in
 * package.json repoints consumers at dist when the package is published.
 *
 * CSS (styles.css + the theme) is copied verbatim by scripts/copy-assets.mjs —
 * it is never run through a bundler (the consumer's Tailwind owns compilation).
 */
// Build exactly the JavaScript subpaths the published manifest promises. A
// hand-maintained list omitted Ember while exporting it, so workspace imports
// worked and the published theme subpath did not exist.
const manifest = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))
const entry: Record<string, string> = {}
for (const [subpath, source] of Object.entries(manifest.exports)) {
	if (typeof source !== "object" || source === null || !("default" in source)) continue
	const from = source.default
	const to = manifest.publishConfig.exports[subpath]?.default
	if (typeof from !== "string" || !/\.tsx?$/.test(from)) continue
	if (typeof to !== "string" || !to.startsWith("./dist/") || !to.endsWith(".js")) {
		throw new Error(`Missing published JavaScript target for ${subpath}`)
	}
	entry[to.slice("./dist/".length, -".js".length)] = from
}

export default defineConfig({
	entry,
	format: ["esm"],
	dts: true,
	clean: true,
	treeshake: true,
	// Everything in deps/peerDeps stays external — never bundle React, Base UI, etc.
	external: [
		"react",
		"react-dom",
		"react/jsx-runtime",
		"@base-ui/react",
		"react-day-picker",
		"date-fns",
		"class-variance-authority",
		"clsx",
		"tailwind-merge",
		// Default icon dependency — resolve from the consumer, never bundle artwork.
		"reicon-react",
		/^reicon-react\//,
		// Shader sources for GradientArt — a dependency, resolved from the consumer.
		"@paper-design/shaders",
		// Optional browser iOS adapter only; never reachable from the core barrel.
		"konsta",
		/^konsta\//,
	],
})
