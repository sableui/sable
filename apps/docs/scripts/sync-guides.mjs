#!/usr/bin/env node
/**
 * sync-guides — copy the package's PROSE into the docs app so the site can
 * render it, and snapshot the CLI's own manifest so the commands page is
 * generated rather than transcribed.
 *
 * Every guide the docs site shows already existed as a file nobody visiting the
 * site could see: five task walkthroughs under `llms/tasks/` (written for
 * agents, and the best writing in the repo about how to actually use Sable),
 * the token-intent reference, DESIGN.md and AGENTS.md. They were reachable by
 * `npx sable docs <slug>`, by grepping the repo, or not at all.
 *
 * This copies rather than importing across the workspace boundary on purpose,
 * matching sync-llms.mjs next door: the docs build then depends on files inside
 * its own tree, so it cannot break on a bundler's `fs.allow` rules, and the
 * copy step fails loudly when a source file is renamed instead of the page
 * quietly rendering nothing.
 *
 *   node scripts/sync-guides.mjs
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = join(HERE, "..")
const SABLE_ROOT = join(DOCS_ROOT, "..", "..", "packages", "sable")
const OUT_DIR = join(DOCS_ROOT, "src", "generated")
const GUIDES_DIR = join(OUT_DIR, "guides")

/**
 * source path (relative to packages/sable) → generated filename.
 *
 * The docs slug is the filename without its extension; `src/guides.ts` names
 * and orders them, because a walkthrough's title is an editorial decision and
 * its filename is not.
 */
const GUIDES = [["CHANGELOG.md", "changelog.md"], ["THIRD_PARTY_NOTICES.md", "credits.md"], ["LICENSE", "license.md"]]

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

for (const [from, to] of GUIDES) {
	const src = join(SABLE_ROOT, from)
	if (!existsSync(src)) {
		console.error(
			`[sync-guides] ✗ missing ${from} — it moved or was renamed. Update scripts/sync-guides.mjs (and src/guides.ts) rather than dropping the page.`,
		)
		process.exit(1)
	}
	copyFileSync(src, join(GUIDES_DIR, to))
	if (to === "credits.md") copyFileSync(src, join(DOCS_ROOT, "public/credits.md"))
}

const licensesDir = join(DOCS_ROOT, "public", "licenses")
mkdirSync(licensesDir, { recursive: true })
copyFileSync(join(SABLE_ROOT, "third-party/reicon-LICENSE.txt"), join(licensesDir, "reicon.txt"))
copyFileSync(join(SABLE_ROOT, "CHANGELOG.md"), join(DOCS_ROOT, "public/whats-new.md"))

console.log(`[sync-guides] ✓ synced the changelog and catalog data into src/generated.`)
