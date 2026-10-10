#!/usr/bin/env node
/**
 * sync-llms — copy the generated agent-docs artifacts from packages/sable into
 * apps/docs/public so Vite's public/ passthrough serves them as real static
 * files (/llms.txt, /llms-full.txt, /llms/components/accordion.md, …) once the
 * docs site is built/served — not just inside the published npm tarball.
 *
 * Source of truth is packages/sable/scripts/build-registry.mjs; this script
 * only copies its output, it never regenerates it.
 *
 *   node scripts/sync-llms.mjs
 */

import { cpSync, existsSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = join(HERE, "..")
const SABLE_ROOT = join(DOCS_ROOT, "..", "..", "packages", "sable")
const PUBLIC_DIR = join(DOCS_ROOT, "public")

const copies = [
	[join(SABLE_ROOT, "llms.txt"), join(PUBLIC_DIR, "llms.txt")],
	[join(SABLE_ROOT, "llms-full.txt"), join(PUBLIC_DIR, "llms-full.txt")],
	[join(SABLE_ROOT, "llms"), join(PUBLIC_DIR, "llms")],
]

for (const [src, dest] of copies) {
	if (!existsSync(src)) {
		console.error(
			`[sync-llms] ✗ missing ${src} — run \`pnpm --filter @sableui/react build:registry\` first.`,
		)
		process.exit(1)
	}
	// Replace the generated tree so retired components cannot survive a rebuild.
	// The local atlas contains third-party captures with unresolved permissions;
	// it is available to local tools, but is excluded from the public docs site.
	if (src === join(SABLE_ROOT, "llms")) {
		rmSync(dest, { recursive: true, force: true })
		cpSync(src, dest, {
			recursive: true,
			filter: (path) => path !== join(src, "atlas"),
		})
	} else {
		cpSync(src, dest)
	}
}

console.log("[sync-llms] ✓ synced public agent docs; local reference atlas excluded.")
