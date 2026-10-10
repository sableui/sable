/**
 * Check what's actually on npm vs. what this repo says.
 *
 * Exits non-zero when the published latest doesn't match packages/sable —
 * either the tag hasn't been pushed yet or CI's publish step didn't land.
 */
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const fail = (msg) => {
	console.error(`[published] ✗ ${msg}`)
	process.exit(1)
}

const { name, version } = JSON.parse(readFileSync("packages/sable/package.json", "utf8"))

let latest
try {
	// shell:true so npm.cmd resolves on Windows; args stay unsplit.
	latest = execFileSync("npm", ["view", name, "dist-tags.latest", "--registry", "https://registry.npmjs.org"], {
		encoding: "utf8",
		shell: true,
		stdio: ["ignore", "pipe", "pipe"],
	}).trim()
} catch (err) {
	const detail = `${err.stderr ?? ""}`.includes("404")
		? `${name} is not on npm yet — the first release has not been published.`
		: `npm view failed: ${`${err.stderr ?? err.message}`.trim().split("\n")[0]}`
	fail(detail)
}

if (latest === version) {
	console.log(`[published] ✓ ${name}@${latest} is live — matches packages/sable.`)
} else {
	fail(`${name}@${latest} is live but packages/sable says ${version} — tag not pushed, or CI's publish didn't land.`)
}
