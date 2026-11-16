// Copy the hand-authored CSS (token entry + themes) into dist alongside the
// compiled JS, preserving paths so the published `exports` resolve. The CSS is
// never bundled/processed — the consumer's Tailwind v4 compiles it.
//
// Theme CSS is discovered from src/themes/*/<dir>.css rather than hardcoded:
// a hardcoded list once shipped a dist/styles.css whose @imports pointed at
// theme files that were never copied (new themes added, list not updated).
import { createHash } from "node:crypto"
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const packageRoot = fileURLToPath(new URL("../", import.meta.url))

const assets = [
	["src/styles.css", "dist/styles.css"],
	["src/palette.css", "dist/palette.css"],
	// The opt-in aggregate of the bundled alternates. Ships even though most
	// apps never import it: it is 4 @import lines, and omitting it would make
	// `@sableui/react/themes.css` a 404 for the apps that do.
	["src/themes.css", "dist/themes.css"],
	["src/ios/styles.css", "dist/ios/styles.css"],
	["src/ios/chrome.css", "dist/ios/chrome.css"],
	["src/ios/frame.css", "dist/ios/frame.css"],
]

for (const entry of readdirSync(join(packageRoot, "src/themes"), { withFileTypes: true })) {
	if (!entry.isDirectory()) continue
	const css = join("src/themes", entry.name, `${entry.name}.css`)
	if (existsSync(join(packageRoot, css))) assets.push([css, join("dist/themes", entry.name, `${entry.name}.css`)])
}

for (const [from, to] of assets) {
	mkdirSync(dirname(join(packageRoot, to)), { recursive: true })
	cpSync(join(packageRoot, from), join(packageRoot, to))
}

console.log(`[copy-assets] copied ${assets.length} CSS files into dist/`)

// The published CSS must not scan anything itself. An `@source` here resolves
// against the installed dist, so every app would generate every component's
// classes (and every *.meta.js example string) whatever it scans, and
// `sable sources` could trim nothing. The consumer's stylesheet owns the scan.
// (The opt-in iOS adapter's styles.css scans only its own folder, and only an
// app that imports it pays for that.)
for (const [, to] of assets.filter(([, to]) => !to.startsWith("dist/ios/"))) {
	const css = readFileSync(join(packageRoot, to), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
	if (/@source\b/.test(css)) throw new Error(`[copy-assets] ${to} carries an @source; the consumer's stylesheet owns the scan (see src/styles.css header).`)
}

// The hash of every published file, as shipped. `sable doctor` compares an app's
// installed copy against it to tell whether a recorded patch (`sable patch`) is
// applied, and whether a later Sable changed the file it patched.
const hashes = {}
const walk = (dir) => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) walk(path)
		else if (entry.name !== "file-hashes.json")
			hashes[relative(packageRoot, path).split("\\").join("/")] = createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 16)
	}
}
walk(join(packageRoot, "dist"))
writeFileSync(join(packageRoot, "dist/file-hashes.json"), `${JSON.stringify(hashes, null, "\t")}\n`)
console.log(`[copy-assets] hashed ${Object.keys(hashes).length} dist files`)

// A root license is not automatically included by npm in a monorepo subpackage.
cpSync(join(packageRoot, "../../LICENSE"), join(packageRoot, "LICENSE"))
