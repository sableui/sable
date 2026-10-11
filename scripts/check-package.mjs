#!/usr/bin/env node
/** Build first, then prove the packed artifact works outside the workspace. */
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { pathToFileURL } from "node:url"

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const packageRoot = join(repo, "packages/sable")
const pnpm = process.env.npm_execpath
if (!pnpm || !existsSync(pnpm)) throw new Error("Run this check through pnpm package:check so the configured package manager is used.")
if (!existsSync(join(packageRoot, "dist/index.js"))) throw new Error("Build the package first: pnpm build.")
const temporaryRoot = realpathSync(tmpdir())
const scratch = mkdtempSync(join(temporaryRoot, "sable-package-check-"))
const consumer = join(scratch, "consumer")
const run = (args, cwd) => execFileSync(process.execPath, [pnpm, ...args], {
	cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 180_000,
})
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const write = (file, contents) => writeFileSync(join(consumer, file), contents)

try {
	console.log("[package-check] Packing the distributable, then installing into an isolated consumer.")
	run(["pack", "--pack-destination", scratch], packageRoot)
	const archive = readdirSync(scratch).find((file) => file.endsWith(".tgz"))
	assert(archive, "pnpm pack produced no tarball.")
	mkdirSync(consumer)
	// Pin direct tooling to the versions installed by the repository lockfile.
	// Resolve transitive dependencies like a new consumer, using the public npm
	// registry. The private Sable package itself always comes from this tarball.
	const versionOf = (name) => JSON.parse(readFileSync(join(repo, "apps/docs/node_modules", name, "package.json"), "utf8")).version
	write("package.json", JSON.stringify({
		name: "sable-packed-consumer", private: true, type: "module",
		scripts: { build: "vite build" },
		dependencies: {
			"@sableui/react": `file:${join(scratch, archive).replaceAll("\\", "/")}`,
			react: versionOf("react"), "react-dom": versionOf("react-dom"),
		},
		devDependencies: Object.fromEntries(["vite", "@tailwindcss/vite", "tailwindcss", "typescript", "@types/react", "@types/react-dom"].map((name) => [name, versionOf(name)])),
	}, null, 2))
	write(".npmrc", "auto-install-peers=false\n")
	run(["install", "--ignore-scripts", "--no-frozen-lockfile"], consumer)

	const installed = join(consumer, "node_modules/@sableui/react")
	const manifest = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"))
	// A strict consumer (strict, skipLibCheck: false) must compile every published
	// declaration file, and exported wrappers of public hooks must not need names
	// the consumer cannot import (TS2742). Optional iOS types need Konsta, so they
	// are checked again after it is installed.
	const typedSubpaths = Object.entries(manifest.exports).filter(([, value]) => typeof value === "object" && value.types).map(([key]) => key === "." ? "@sableui/react" : `@sableui/react${key.slice(1)}`)
	const konstaSubpaths = ["@sableui/react/ios"]
	function strictTypes(label, subpaths) {
		write("strict-index.ts", subpaths.map((name, index) => `export * as published${index} from "${name}";`).join("\n") + "\n")
		write("strict-usage.tsx", `import { OtpField, useToast, useToastManager, toast, type OtpFieldProps } from "@sableui/react";
export function useAppToast() { return useToast(); }
export const useAppToastManager = () => useToastManager();
export const appToast = toast;
export const otpProps: OtpFieldProps = { length: 6, onValueChange: (value: string) => void value };
export function Code() { return <OtpField length={6} groupSize={3} onValueComplete={(value: string) => void value} aria-invalid />; }\n`)
		write("tsconfig.strict.json", JSON.stringify({
			compilerOptions: { strict: true, skipLibCheck: false, target: "ES2022", module: "ESNext", moduleResolution: "bundler", jsx: "react-jsx", lib: ["ES2022", "DOM", "DOM.Iterable"], types: [], declaration: true, emitDeclarationOnly: true, outDir: "strict-types" },
			files: ["strict-index.ts", "strict-usage.tsx"],
		}, null, 2))
		try {
			execFileSync(process.execPath, [join(consumer, "node_modules/typescript/bin/tsc"), "-p", "tsconfig.strict.json"], { cwd: consumer, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 180_000 })
		} catch (error) {
			error.message = `Strict TypeScript consumer failed (${label}).`
			throw error
		}
		console.log(`[package-check] Strict TypeScript consumer (skipLibCheck: false) compiles ${subpaths.length} published typed subpaths (${label}).`)
	}
	const baseUi = () => JSON.parse(readFileSync(join(realpathSync(installed), "../../@base-ui/react/package.json"), "utf8")).version
	strictTypes(`Base UI ${baseUi()}`, typedSubpaths.filter((name) => !konstaSubpaths.includes(name)))
	assert(manifest.dependencies["reicon-react"], "Reicon must install automatically for the default icons.")
	const { Icon, fallbackIconSet, reiconIconSet } = await import(pathToFileURL(join(installed, "dist/index.js")).href)
	const { createElement } = await import(pathToFileURL(join(consumer, "node_modules/react/index.js")).href)
	const { renderToStaticMarkup } = await import(pathToFileURL(join(consumer, "node_modules/react-dom/server.node.js")).href)
	assert(renderToStaticMarkup(createElement(Icon, { name: "heart" })).includes("<svg"), "Packed icons do not render without an IconProvider.")
	assert(fallbackIconSet === reiconIconSet, "The obsolete fallback export must be an alias, not separate artwork.")
	const registry = JSON.parse(readFileSync(join(installed, "registry.json"), "utf8"))
	assert(manifest.version === registry.version, "Packed package and registry versions disagree.")
	assert(manifest.license === "MIT", "The distributable does not declare its source license.")
	for (const file of ["LICENSE", "THIRD_PARTY_NOTICES.md", "third-party/reicon-LICENSE.txt"]) assert(existsSync(join(installed, file)), `Missing legal notice: ${file}`)
	assert(readFileSync(join(installed, "third-party/reicon-LICENSE.txt"), "utf8") === readFileSync(join(packageRoot, "third-party/reicon-LICENSE.txt"), "utf8"), "Packed Reicon notice is incomplete or stale.")
	const { brandIconNames } = await import(pathToFileURL(join(installed, "dist/icon-sets/brands.js")).href)
	assert(["linkedin", "slack", "microsoft", "openai"].every(name => !brandIconNames.includes(name)), "Uncleared CDN-only marks leaked into the distributable.")
	for (const file of ["SKILL.md", "agents/openai.yaml"]) {
		assert(readFileSync(join(installed, "skills/sable", file), "utf8") === readFileSync(join(packageRoot, "skills/sable", file), "utf8"), `Packaged Sable skill is missing or stale: ${file}`)
	}
	let exportsChecked = 0
	function checkExport(value) {
		if (typeof value === "string") {
			assert(!value.startsWith("./src/"), `Source-only export leaked into the tarball: ${value}`)
			assert(existsSync(join(installed, value)), `Published export does not exist: ${value}`)
			exportsChecked++
		} else for (const nested of Object.values(value)) checkExport(nested)
	}
	for (const value of Object.values(manifest.exports)) checkExport(value)
	function checkCss(path, visited = new Set()) {
		if (visited.has(path)) return
		visited.add(path)
		assert(existsSync(path), `CSS import missing from tarball: ${path}`)
		const css = readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
		for (const match of css.matchAll(/@import\s+["'](\.[^"']+)["']/g)) checkCss(resolve(dirname(path), match[1]), visited)
	}
	checkCss(join(installed, "dist/styles.css"))
	checkCss(join(installed, "dist/themes.css"))
	checkCss(join(installed, "dist/ios/styles.css"))
	checkCss(join(installed, "dist/ios/frame.css"))
	assert(manifest.peerDependenciesMeta?.konsta?.optional === true, "Konsta must remain an optional peer.")
	assert(!manifest.dependencies?.konsta && !manifest.optionalDependencies?.konsta, "Konsta leaked into automatic runtime dependencies.")
	assert(!existsSync(join(consumer, "node_modules/konsta")), "A web consumer unexpectedly installed Konsta.")
	const cli = join(installed, "bin/sable.mjs")
	for (const args of [["setup", "--agent", "--dry-run"], ["setup", "--agent"], ["setup", "--agent"], ["setup", "--agent", "--update"]]) {
		const setup = JSON.parse(execFileSync(process.execPath, [cli, ...args, "--json"], { cwd: consumer, encoding: "utf8" }))
		assert(setup.type === "setup.agent", "Packed agent setup did not return its envelope.")
	}
	assert(existsSync(join(consumer, ".agents/skills/sable/agents/openai.yaml")), "Agent setup did not install the packaged metadata.")
	assert(existsSync(join(consumer, ".claude/skills/sable/SKILL.md")), "Claude setup entry is missing.")
	assert(readFileSync(join(consumer, ".agents/skills/sable/SKILL.md"), "utf8").includes("skills/sable/SKILL.md"), "The installed entry does not resolve the package workflow.")
	for (const args of [["preset", "--template"], ["docs", "building-with-sable"], ["docs", "auditing-an-app"], ["manifest"], ["component", "Button"], ["pattern", "SettingsPage", "--skeleton"], ["block", "SignInBlock", "--skeleton"], ["grade", "--template"], ["learn", "--list"], ["atlas", "--check"], ["prefer", "--template"], ["explore", "--template"]]) {
		const output = execFileSync(process.execPath, [cli, ...args, "--json"], { cwd: consumer, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
		assert(JSON.parse(output).type, `Missing CLI envelope: ${args.join(" ")}`)
	}
	// The package ships no atlas (third-party captures are not ours to
	// redistribute); `sable atlas` must say so plainly rather than fail.
	assert(!existsSync(join(installed, "llms/atlas")), "The packed package ships the visual atlas; it must be excluded.")
	const atlas = JSON.parse(execFileSync(process.execPath, [cli, "atlas", "--list", "--json"], { cwd: consumer, encoding: "utf8" }))
	assert(atlas.data.entries.length === 0 && /ships none/.test(atlas.data.notice), "Without an atlas, sable atlas must answer with an empty list and a notice.")
	console.log(`[package-check] ${exportsChecked} published export targets, CSS imports, and shipped retrieval/review/learning tools resolve.`)
	const preset = JSON.parse(execFileSync(process.execPath, [cli, "preset", "--template", "--json"], { cwd: consumer, encoding: "utf8" })).data
	preset.id = "consumer-preset"
	preset.direction = "Clear hierarchy and a compact settings workflow."
	write("preset.json", JSON.stringify(preset))
	const checked = JSON.parse(execFileSync(process.execPath, [cli, "preset", "--check", "preset.json", "--json"], { cwd: consumer, encoding: "utf8" }))
	assert(checked.data.valid && checked.data.authoredWith === manifest.version, "Packed preset validation or version provenance failed.")
	const compiled = execFileSync(process.execPath, [cli, "preset", "--css", "preset.json"], { cwd: consumer, encoding: "utf8" })
	assert(compiled.includes('[data-sable-theme="consumer-preset"]'), "Packed preset CSS is not scoped to its ID.")

	write("index.html", '<!doctype html><html><head><title>Packed Sable consumer</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>')
	mkdirSync(join(consumer, "src"))
	write("src/preset.css", compiled)
	write("vite.config.mjs", `import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({ plugins: [tailwindcss()], resolve: { dedupe: ["react", "react-dom"] }, esbuild: { jsx: "automatic" } });`)
	write("src/main.jsx", `import React from "react";
import { createRoot } from "react-dom/client";
import { Button, SableThemeProvider } from "@sableui/react";
import { SettingsPage } from "@sableui/react/patterns";
import { PricingCardBlock } from "@sableui/react/blocks";
import { parsePreset, presetManifest } from "@sableui/react/presets";
import record from "../preset.json";
import "./styles.css";
const preset = parsePreset(record);
createRoot(document.getElementById("root")).render(<SableThemeProvider customThemes={[presetManifest(preset)]} defaultThemeId={preset.id}><div className="antialiased"><Button>Save changes</Button><PricingCardBlock /><SettingsPage /></div></SableThemeProvider>);`)
	write("src/styles.css", `@import "tailwindcss";
@import "@sableui/react/styles.css";
@import "@sableui/react/theme/prism.css";
@import "./preset.css";
@source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";`)
	write("render.mjs", `import React from "react";
import { renderToString } from "react-dom/server";
import { Button } from "@sableui/react";
import { PhoneFrame } from "@sableui/react/ios/preview";
const html = renderToString(React.createElement(Button, null, "Save changes"));
if (!html.includes("<button") || !html.includes("Save changes")) throw new Error("The public Button did not render.");
if (!renderToString(React.createElement(PhoneFrame, { src: "/native.html" })).includes("iframe")) throw new Error("Host-only preview needs an unavailable native dependency.");`)
	execFileSync(process.execPath, [join(consumer, "render.mjs")], { cwd: consumer, stdio: "pipe" })
	run(["run", "build"], consumer)
	const css = readdirSync(join(consumer, "dist/assets")).filter((file) => file.endsWith(".css")).map((file) => readFileSync(join(consumer, "dist/assets", file), "utf8")).join("\n")
	for (const marker of [".text-label-lg", ".motion-interactive", "--control-md", "data-sable-theme=prism", "data-sable-theme=consumer-preset"]) assert(css.includes(marker), `Consumer CSS is missing ${marker}.`)
	const wiring = JSON.parse(execFileSync(process.execPath, [cli, "doctor", "--json"], { cwd: consumer, encoding: "utf8", stdio: "pipe" }))
	assert(wiring.type === "doctor", "Packed doctor did not report consumer wiring.")
	console.log("[package-check] Public React imports render; fresh Vite/Tailwind consumer builds with component, motion, and alternate-theme CSS. Doctor passes.")
	// Install the optional peer only after proving that ordinary web consumption
	// (including the host-only phone frame) needs no Konsta runtime.
	run(["add", "konsta@^5.5.0", "--ignore-scripts"], consumer)
	write("native.html", '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/native.jsx"></script></body></html>')
	write("src/native.jsx", `import React from "react";
import { createRoot } from "react-dom/client";
import { Card, CardList, Entity, Input, Switch } from "@sableui/react";
import { NativeApp, NavigationStack, IosPage, IosNavbar, IosTabbar, IosTab, IosIconButton } from "@sableui/react/ios";
import "./native.css";
createRoot(document.getElementById("root")).render(<NativeApp><NavigationStack label="Explore"><IosPage><IosNavbar large title="Explore" right={<IosIconButton aria-label="About">i</IosIconButton>} /><Card><CardList><Entity title="Notifications" action={<Switch aria-label="Notifications" />} /></CardList></Card><Input aria-label="Name" /></IosPage></NavigationStack><IosTabbar aria-label="App navigation"><IosTab active label="Explore" /></IosTabbar></NativeApp>);`)
	// The recommended native document: Sable, a preset, then the adapter.
	write("src/native.css", '@import "tailwindcss";\n@import "@sableui/react/styles.css";\n@import "@sableui/react/theme/verdant.css";\n@import "@sableui/react/ios/styles.css";\n@source "../node_modules/@sableui/react/dist";\n')
	write("vite.config.mjs", `import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({ plugins: [tailwindcss()], resolve: { dedupe: ["react", "react-dom"] }, esbuild: { jsx: "automatic" }, build: { rollupOptions: { input: { main: "index.html", native: "native.html" } } } });`)
	write("render-ios.mjs", `import React from "react";
import { renderToString } from "react-dom/server";
import { NativeApp, NavigationStack, IosNavbar, IosIconButton } from "@sableui/react/ios";
const html = renderToString(React.createElement(NativeApp, { tokens: { "--primary": "var(--brand-accent)" } }, React.createElement(NavigationStack, { label: "Explore" }, React.createElement(IosNavbar, { title: "Explore", right: React.createElement(IosIconButton, { "aria-label": "About" }, "i") }))));
for (const marker of ["--primary:var(--brand-accent)", "ios-navigation-title", "ios-icon-action", "ios-glass-filters"]) if (!html.includes(marker)) throw new Error("Packed adapter omitted " + marker);`)
	execFileSync(process.execPath, [join(consumer, "render-ios.mjs")], { cwd: consumer, stdio: "pipe" })
	run(["run", "build"], consumer)
	const nativeCss = readdirSync(join(consumer, "dist/assets")).filter(file => file.endsWith(".css")).map(file => readFileSync(join(consumer, "dist/assets", file), "utf8")).join("\n")
	for (const marker of [".ios-prototype", ".ios-icon-action", ".native-tab-glass", "--ios-safe-top", "--ios-glass-optics", "prefers-reduced-transparency", "margin-top:var(--ios-navbar-offset", ".text-\\[34px\\]", "--ios-inset", "data-sable-theme=verdant"]) assert(nativeCss.includes(marker), `Packed native consumer CSS is missing ${marker}.`)
	console.log("[package-check] Optional iOS consumer renders and builds with published adapter types, native theme, optical material and safe-area CSS; the web consumer required no Konsta.")
	strictTypes(`Base UI ${baseUi()}, with Konsta`, typedSubpaths)
	// A fresh install resolves the newest Base UI in the declared range. Prove the
	// published types also compile against the lowest version that range allows.
	const minimumBaseUi = manifest.dependencies["@base-ui/react"].replace(/^[\^~]/, "")
	const consumerManifest = JSON.parse(readFileSync(join(consumer, "package.json"), "utf8"))
	write("package.json", JSON.stringify({ ...consumerManifest, pnpm: { overrides: { "@base-ui/react": minimumBaseUi } } }, null, 2))
	run(["install", "--ignore-scripts", "--no-frozen-lockfile"], consumer)
	assert(baseUi() === minimumBaseUi, `Could not install the minimum supported Base UI ${minimumBaseUi}.`)
	strictTypes(`minimum supported Base UI ${minimumBaseUi}, with Konsta`, typedSubpaths)
} catch (error) {
	console.error(`[package-check] ${String(error.message).split("\n")[0]}`)
	if (error.stdout) console.error(String(error.stdout).split("\n").slice(-24).join("\n"))
	if (error.stderr) console.error(String(error.stderr).split("\n").slice(-30).join("\n"))
	process.exitCode = 1
} finally {
	// Only remove the exact temporary directory this process created. Check the
	// resolved target even on Windows, where node_modules can contain junctions.
	const actual = realpathSync(scratch)
	const child = relative(temporaryRoot, actual)
	assert(child.startsWith("sable-package-check-") && !child.includes(sep) && !child.startsWith(".."), "Refusing cleanup outside the checker temporary directory.")
	rmSync(actual, { recursive: true, force: true })
}
