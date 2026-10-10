import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
execFileSync(process.execPath, [join(root, "scripts/public-inventory.mjs")], { cwd: root, stdio: "inherit" })
const load = p => JSON.parse(readFileSync(join(root, p), "utf8"))
const pkg = load("packages/sable/package.json")
const recipe = load("packages/sable/registry.json").consume
const inventory = load("docs/audits/public-use/inventory.json")
const status = load("docs/audits/public-use/release-status.json")
const failures = status.blockers.filter(b => b.status !== "resolved").map(b => `${b.id}: ${b.resolution}`)
if (pkg.license !== "MIT" || !existsSync(join(root, "packages/sable/LICENSE"))) failures.push("Package MIT license is missing; build the package.")
if (pkg.publishConfig.registry !== "https://registry.npmjs.org" || recipe.private !== false) failures.push("Distribution is still authenticated GitHub Packages; public npm configuration is incomplete.")
if (inventory.privacy.personalIdentityPaths.length || inventory.privacy.machinePathPaths.length || inventory.privacy.secretCandidatePaths.length) failures.push("Working-tree privacy/credential scan needs review; see inventory.json (values are never printed).")
if (inventory.privacy.legacyScopePaths.length) failures.push("Legacy personal package/repository references remain; see inventory.json.")
if (inventory.privacy.productIdentityPaths.length) failures.push("Legacy product identity (including the default theme's exported name) remains; see inventory.json.")
if (inventory.brandGlyphs.some(glyph => glyph.source === "cdn.reicon.dev")) failures.push("Uncleared CDN-only brand glyphs remain in the generated distribution source.")
if (!existsSync(join(root, "packages/sable/third-party/reicon-LICENSE.txt"))) failures.push("The vendored Reicon MIT notice is missing.")
// The atlas only matters if it ships; the package excludes it and so does the export.
const atlasShips = !pkg.files.includes("!llms/atlas") || !status.publicExport.exclude.includes("packages/sable/llms/atlas/")
const missingRights = atlasShips ? inventory.atlas.filter(e => !e.permission && !e.redistributionLicense) : []
if (missingRights.length) failures.push(`${missingRights.length} shipped atlas entries have no recorded redistribution rights.`)
// What becomes public is the export set; its scans must be clean.
try { execFileSync(process.execPath, [join(root, "scripts/public-export.mjs")], { cwd: root, stdio: "inherit" }) }
catch { failures.push("The public export set fails its identity, path, credential or retired-preset scans; see above.") }
if (failures.length) {
	console.error(`Public release is not ready (${failures.length} checks unresolved):\n${failures.map(f => `- ${f}`).join("\n")}`)
	process.exitCode = 1
} else console.log("Public-readiness declarations and mechanical checks pass. Confirm release evidence and the actual tarball before publishing.")
