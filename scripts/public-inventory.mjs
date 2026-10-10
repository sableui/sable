import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const out = join(root, "docs/audits/public-use")
const paths = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean)
// Inventory what becomes public: the export set (release-status.json → publicExport.exclude).
const exclude = JSON.parse(readFileSync(join(root, "docs/audits/public-use/release-status.json"), "utf8")).publicExport.exclude
const excluded = path => exclude.some(rule => (rule.endsWith("/") ? path.startsWith(rule) : path === rule))
const files = [...new Set(paths)].filter(f => !f.startsWith("docs/audits/") && !excluded(f) && existsSync(join(root, f))).sort()
const json = path => JSON.parse(readFileSync(join(root, path), "utf8"))
const identity = []
const secretCandidates = []
const machinePaths = []
const scopeReferences = []
const productIdentity = []
const assets = []
for (const path of files) {
	const bytes = readFileSync(join(root, path))
	if (/\.(png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf|mp4|webm|pdf)$/i.test(path)) {
		assets.push({ path, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") })
	}
	if (!/\.(md|txt|json|tsx?|jsx?|mjs|css|html|ya?ml)$/.test(path)) continue
	const body = bytes.toString("utf8")
	// Report paths and counts only. Never echo a suspected credential.
	if (/\bCarl(?: W\.)? DeCaire\b|\bcarl\b|cdecaire@gmail\.com/i.test(body)) identity.push(path)
	if (/(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/.test(body)) secretCandidates.push(path)
	if (/(?:[A-Z]:[\\/]+Users[\\/]+cdeca|D:[\\/]+dev[\\/]+)/i.test(body)) machinePaths.push(path)
	if (/@cdecaire\/|github\.com[/:]cdecaire\//.test(body)) scopeReferences.push(path)
	if (/\bdesperse\b/i.test(body)) productIdentity.push(path)
}
const manifest = json("packages/sable/package.json")
const dependencies = []
for (const name of Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies })) {
	const dir = join(root, "packages/sable/node_modules", name)
	if (!existsSync(join(dir, "package.json"))) { dependencies.push({ name, installed: false }); continue }
	const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))
	dependencies.push({ name, version: pkg.version, license: pkg.license ?? null, repository: pkg.repository ?? null, noticeFiles: readdirSync(dir).filter(f => /license|notice|copying/i.test(f)) })
}
// The reference atlas lives outside the repository now; inventory it only if one is present.
const atlas = existsSync(join(root, "packages/sable/llms/atlas/atlas.json")) ? json("packages/sable/llms/atlas/atlas.json") : { entries: [] }
const glyphSource = readFileSync(join(root, "packages/sable/src/icon-sets/brands.generated.ts"), "utf8")
const brandGlyphs = [...glyphSource.matchAll(/\/\*\* (.*?) — (reicon-brands|cdn\.reicon\.dev), source viewBox .*?\. \*\/\s*"([^"]+)":/g)].map(([, title, source, name]) => ({ name, title, source }))
const authorEmails = execFileSync("git", ["log", "--format=%ae"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean)
const authorGroups = new Map()
for (const email of authorEmails) authorGroups.set(email.trim(), (authorGroups.get(email.trim()) ?? 0) + 1)
const report = {
	schemaVersion: 1, generatedAt: new Date().toISOString(), packageVersion: manifest.version,
	scope: "The public export set (tracked and nonignored files minus publicExport.exclude), plus Git author-email group counts and tag count only. No history-content scan, remote release attachments, ignored local configuration, or exhaustive license/similarity verification.",
	filesInspected: files.length,
	privacy: { personalIdentityPaths: identity, machinePathPaths: machinePaths, legacyScopePaths: scopeReferences, productIdentityPaths: productIdentity, identityScanLimit: "Targeted known identifiers, including a case-insensitive standalone first name. Not an exhaustive personal-information detector.", secretCandidatePaths: secretCandidates, secretScanLimit: "High-confidence token/key patterns only; not a full secrets audit." },
	historyMetadata: { commits: authorEmails.length, authorEmailGroups: [...authorGroups.values()].sort((a, b) => b - a), tags: execFileSync("git", ["tag", "--list"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean).length, limit: "Counts only; raw email values are not retained. Every identity group must be handled in a clean export." },
	brandGlyphs,
	dependencies,
	atlas: atlas.entries.map(entry => ({ id: entry.id, source: entry.url, permission: entry.permission ?? null, redistributionLicense: entry.license ?? null, evidence: entry.evidence.map(e => ({ path: `packages/sable/${e.path}`, sha256: e.sha256 })) })),
	assets,
}
mkdirSync(out, { recursive: true })
writeFileSync(join(out, "inventory.json"), JSON.stringify(report, null, 2) + "\n")
console.log(`Inspected ${files.length} files; inventoried ${assets.length} assets and ${dependencies.length} runtime/peer dependencies. Identity: ${identity.length}; machine paths: ${machinePaths.length}; legacy scope files: ${scopeReferences.length}; secret candidates: ${secretCandidates.length}.`)
