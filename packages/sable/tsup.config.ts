import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, extname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, type Options } from "tsup"

/**
 * Build for extraction/publishing. In the workspace, @sableui/react is consumed as
 * SOURCE (package.json `exports` point at ./src) for instant HMR. This build
 * produces the publishable ./dist artifact; `publishConfig.exports` in
 * package.json repoints consumers at dist when the package is published.
 *
 * CSS (styles.css + the theme) is copied verbatim by scripts/copy-assets.mjs —
 * it is never run through a bundler (the consumer's Tailwind owns compilation).
 */
const packageRoot = dirname(fileURLToPath(import.meta.url))
const srcRoot = join(packageRoot, "src")

// Build exactly the JavaScript subpaths the published manifest promises. A
// hand-maintained list omitted Ember while exporting it, so workspace imports
// worked and the published theme subpath did not exist.
const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"))
const published: Record<string, string> = {}
for (const [subpath, source] of Object.entries(manifest.exports)) {
	if (typeof source !== "object" || source === null || !("default" in source)) continue
	const from = source.default
	const to = manifest.publishConfig.exports[subpath]?.default
	if (typeof from !== "string" || !/\.tsx?$/.test(from)) continue
	if (typeof to !== "string" || !to.startsWith("./dist/") || !to.endsWith(".js")) {
		throw new Error(`Missing published JavaScript target for ${subpath}`)
	}
	const name = to.slice("./dist/".length, -".js".length)
	// Each source file becomes dist/<its path under src>.js, so a published
	// target has to sit where its source does or the subpath would not resolve.
	if (`${name}${extname(from)}` !== relative("src", from).split(sep).join("/")) {
		throw new Error(`${subpath}: ${to} must mirror ${from} — dist keeps the src layout`)
	}
	published[name] = from
}

/*
 * One output module per source module, not one bundle per entry.
 *
 * A bundled entry is a single file, and `"sideEffects": ["*.css"]` can only
 * drop whole files: inside one file, a bundler keeps every statement it cannot
 * prove pure (a `displayName` assignment, a Base UI namespace read), and with
 * it everything that statement references. Bundled, `import { Button }` pulled
 * in about 70% of the library under esbuild. Kept as separate modules, an
 * unused component's file is never evaluated, so it is never shipped.
 *
 * The graph is walked from the published entries, so only reachable source is
 * emitted (no tests, no test helpers). Relative imports are left external and
 * rewritten to the emitted file, with the `.js` extension Node ESM requires.
 */
const SOURCE_EXTENSIONS = [".ts", ".tsx"]

function resolveSource(fromDir: string, specifier: string): string | null {
	const base = resolve(fromDir, specifier)
	if (SOURCE_EXTENSIONS.includes(extname(base)) && existsSync(base)) return base
	for (const ext of SOURCE_EXTENSIONS) if (existsSync(base + ext)) return base + ext
	if (existsSync(base) && statSync(base).isDirectory()) {
		for (const ext of SOURCE_EXTENSIONS) if (existsSync(join(base, `index${ext}`))) return join(base, `index${ext}`)
	}
	return null
}

const RELATIVE_SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["'](\.{1,2}\/[^"']*)["']/g

function reachableSources(entries: string[]): string[] {
	const seen = new Set<string>()
	const queue = entries.map((entry) => join(packageRoot, entry))
	while (queue.length) {
		const file = queue.pop() as string
		if (seen.has(file)) continue
		seen.add(file)
		const code = readFileSync(file, "utf8")
		for (const [, specifier] of code.matchAll(RELATIVE_SPECIFIER)) {
			const target = resolveSource(dirname(file), specifier)
			if (target?.startsWith(srcRoot)) queue.push(target)
		}
	}
	return [...seen]
}

const entry: Record<string, string> = {}
for (const file of reachableSources(Object.values(published))) {
	const name = relative(srcRoot, file).slice(0, -extname(file).length).split(sep).join("/")
	entry[name] = relative(packageRoot, file).split(sep).join("/")
}

const keepModules: NonNullable<Options["esbuildPlugins"]>[number] = {
	name: "sable-keep-modules",
	setup(build) {
		build.onResolve({ filter: /^\.{1,2}\// }, (args) => {
			// Entry points themselves resolve normally; only their imports stay external.
			if (args.kind === "entry-point") return undefined
			const target = resolveSource(args.resolveDir, args.path)
			if (!target?.startsWith(srcRoot)) return undefined
			const emitted = target.slice(0, -extname(target).length) + ".js"
			let specifier = relative(args.resolveDir, emitted).split(sep).join("/")
			if (!specifier.startsWith(".")) specifier = `./${specifier}`
			return { path: specifier, external: true }
		})
	},
}

export default defineConfig({
	entry,
	format: ["esm"],
	// Declarations only for the published subpaths: those are the types a
	// consumer can reach, bundled per subpath as before.
	dts: { entry: published },
	clean: true,
	// No Rollup pass: it would merge nothing (every relative import is external)
	// and it strips the "use client" directives each module now keeps.
	treeshake: false,
	splitting: false,
	esbuildPlugins: [keepModules],
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
