// Copy the hand-authored CSS (token entry + themes) into dist alongside the
// compiled JS, preserving paths so the published `exports` resolve. The CSS is
// never bundled/processed — the consumer's Tailwind v4 compiles it.
//
// Theme CSS is discovered from src/themes/*/<dir>.css rather than hardcoded:
// a hardcoded list once shipped a dist/styles.css whose @imports pointed at
// theme files that were never copied (new themes added, list not updated).
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const packageRoot = fileURLToPath(new URL("../", import.meta.url))

const assets = [
	["src/styles.css", "dist/styles.css"],
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

// A root license is not automatically included by npm in a monorepo subpackage.
cpSync(join(packageRoot, "../../LICENSE"), join(packageRoot, "LICENSE"))
