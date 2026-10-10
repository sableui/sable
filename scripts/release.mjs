/**
 * Release @sableui/react — tag-driven, published by CI.
 *
 * The GitHub Actions workflow (.github/workflows/release.yml) publishes to npm
 * with provenance whenever a v* tag is pushed. Local `pnpm publish` is NOT part
 * of the flow. This script just validates state and pushes the tag:
 *
 *   1. working tree is clean and HEAD is pushed to origin
 *   2. tag v<packages/sable version> doesn't already exist
 *   3. create the tag and push it — CI does the rest
 */
import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"

const run = (cmd) => execSync(cmd, { encoding: "utf8" }).trim()
const fail = (msg) => {
	console.error(`[release] ✗ ${msg}`)
	process.exit(1)
}

const { version } = JSON.parse(readFileSync("packages/sable/package.json", "utf8"))
const tag = `v${version}`

if (run("git status --porcelain") !== "") fail("working tree is dirty — commit first.")

run("git fetch origin --quiet")
const head = run("git rev-parse HEAD")
const remote = run("git rev-parse origin/main")
if (head !== remote) fail("HEAD is not pushed to origin/main — push first.")

if (run(`git tag --list ${tag}`) !== "") fail(`${tag} already exists — bump the version in packages/sable/package.json first.`)

run(`git tag ${tag}`)
run(`git push origin ${tag}`)
console.log(`[release] ✓ pushed ${tag} — CI is publishing. Watch: gh run list --workflow=release.yml`)
