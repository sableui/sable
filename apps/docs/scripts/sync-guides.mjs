#!/usr/bin/env node
/**
 * sync-guides — copy the package prose the docs site renders into
 * src/generated, and derive the small data files its pages read.
 *
 * It writes:
 *
 *   src/generated/guides/<name>.md   the changelog (What's new), the third-party
 *                                    notices and license (Credits), and the task
 *                                    guides that are also site pages (Next.js,
 *                                    Colour mode, Troubleshooting, the two
 *                                    migration guides). Each of those pages
 *                                    renders its guide, so the page and its
 *                                    markdown twin are one file.
 *   src/generated/instructions-block.md
 *                                    the AGENTS.md / CLAUDE.md block
 *                                    `sable setup --agent` writes, produced by
 *                                    the installer's own instructionsBlock(), so
 *                                    the Build with Sable page cannot drift from it.
 *   src/generated/catalog-*.json     navigation projections of registry.json.
 *
 * It also copies a few files into public/ (licence texts, the changelog as
 * /whats-new.md). The agent docs themselves (llms.txt, llms/) are copied by
 * sync-llms.mjs next door.
 *
 * This copies rather than importing across the workspace boundary on purpose,
 * matching sync-llms.mjs: the docs build then depends on files inside its own
 * tree, so it cannot break on a bundler's `fs.allow` rules, and the copy step
 * fails loudly when a source file is renamed instead of the page quietly
 * rendering nothing.
 *
 *   node scripts/sync-guides.mjs
 */

import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { instructionsBlock } from "../../../packages/sable/scripts/agent-setup.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = join(HERE, "..")
const SABLE_ROOT = join(DOCS_ROOT, "..", "..", "packages", "sable")
const OUT_DIR = join(DOCS_ROOT, "src", "generated")
const GUIDES_DIR = join(OUT_DIR, "guides")

/**
 * source path (relative to packages/sable) → generated filename. The page that
 * renders each one imports it from src/generated/guides; markdown-twins.json
 * names the same source as that page's twin.
 */
const GUIDES = [
	["CHANGELOG.md", "changelog.md"],
	["THIRD_PARTY_NOTICES.md", "credits.md"],
	["LICENSE", "license.md"],
	["llms/tasks/nextjs.md", "nextjs.md"],
	["llms/tasks/color-mode.md", "color-mode.md"],
	["llms/tasks/troubleshooting.md", "troubleshooting.md"],
	["llms/tasks/converting-an-app.md", "converting-an-app.md"],
	["llms/tasks/migrating-from-shadcn.md", "migrating-from-shadcn.md"],
]

mkdirSync(GUIDES_DIR, { recursive: true })

// Browser navigation needs names and search terms, not the agent contract's
// props, code examples, token tables, or install recipe. Derive projections
// from the same registry so route splitting also splits its data payload.
const registry = JSON.parse(readFileSync(join(SABLE_ROOT, "registry.json"), "utf8"))
const json = (name, data) => writeFileSync(join(OUT_DIR, name), `${JSON.stringify(data)}\n`)
json("catalog-summary.json", {
	version: registry.version,
	components: registry.components.map(({ name, path, group, register, status, summary, keywords, related }) => ({
		name, path, group, register, status, summary, keywords,
		related: { components: related?.components ?? [] },
	})),
})
json("catalog-patterns.json", registry.patterns.items)
// The Blocks page renders every block but shows its source only on the Code
// tab, so the source (about 145 kB of the 200 kB) is its own file, fetched
// when a Code tab opens or Copy is pressed, not with the page.
json(
	"catalog-blocks.json",
	registry.blocks.items.map(({ name, family, kind, width, summary }) => ({ name, family, kind, width, summary })),
)
json(
	"catalog-blocks-code.json",
	Object.fromEntries(registry.blocks.items.map(({ name, imports, code }) => [name, `${imports}\n\n${code}`])),
)

for (const [from, to] of GUIDES) {
	const src = join(SABLE_ROOT, from)
	if (!existsSync(src)) {
		console.error(
			`[sync-guides] ✗ missing ${from} — it moved or was renamed. Update GUIDES in scripts/sync-guides.mjs (and the page that imports it) rather than dropping the page.`,
		)
		process.exit(1)
	}
	copyFileSync(src, join(GUIDES_DIR, to))
	if (to === "credits.md") copyFileSync(src, join(DOCS_ROOT, "public/credits.md"))
}

// The block as a pnpm app gets it: instructionsBlock() picks the runner from
// the project's lockfile, so it is asked about a throwaway project with one.
const sampleApp = mkdtempSync(join(tmpdir(), "sable-docs-block-"))
try {
	writeFileSync(join(sampleApp, "pnpm-lock.yaml"), "")
	writeFileSync(join(OUT_DIR, "instructions-block.md"), `${instructionsBlock({ root: sampleApp })}\n`)
} finally {
	rmSync(sampleApp, { recursive: true, force: true })
}

const licensesDir = join(DOCS_ROOT, "public", "licenses")
mkdirSync(licensesDir, { recursive: true })
copyFileSync(join(SABLE_ROOT, "third-party/reicon-LICENSE.txt"), join(licensesDir, "reicon.txt"))
// THIRD_PARTY_NOTICES.md (copied by sync-llms) links its licence texts as ./third-party/…
const thirdPartyDir = join(DOCS_ROOT, "public", "third-party")
mkdirSync(thirdPartyDir, { recursive: true })
copyFileSync(join(SABLE_ROOT, "third-party/emilkowalski-skills-LICENSE.txt"), join(thirdPartyDir, "emilkowalski-skills-LICENSE.txt"))
copyFileSync(join(SABLE_ROOT, "CHANGELOG.md"), join(DOCS_ROOT, "public/whats-new.md"))

console.log(`[sync-guides] ✓ synced the changelog, guides, setup block and catalog data into src/generated.`)
