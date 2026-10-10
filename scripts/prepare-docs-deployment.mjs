// Package the already-built docs using Vercel's static Build Output API.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const dist = join(root, "apps/docs/dist")
const output = join(root, ".vercel/output")
if (!existsSync(join(dist, "index.html"))) throw new Error("Build the docs first.")
if (existsSync(join(dist, "llms/atlas"))) throw new Error("Reference captures must not be deployed.")
// This target is fixed inside the workspace and contains generated output only.
rmSync(output, { recursive: true, force: true })
mkdirSync(output, { recursive: true })
cpSync(dist, join(output, "static"), { recursive: true })

// Serve the route-specific HTML at /button, etc., preserving crawler metadata.
const overrides = {}
for (const entry of readdirSync(dist, { withFileTypes: true })) {
	if (entry.isDirectory() && existsSync(join(dist, entry.name, "index.html"))) {
		overrides[`${entry.name}/index.html`] = { path: entry.name }
	}
}
const { routes } = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"))
writeFileSync(join(output, "config.json"), `${JSON.stringify({ version: 3, routes, overrides }, null, 2)}\n`)
console.log(`Prepared static docs deployment with ${Object.keys(overrides).length} route shells; reference atlas excluded.`)
