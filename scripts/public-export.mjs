// The public repository is a clean export of this one, not its history.
//
//   node scripts/public-export.mjs                 dry run: what would be exported, and the scans
//   node scripts/public-export.mjs --json          the same, as JSON
//   node scripts/public-export.mjs --out <dir> --author "Name <email>"
//                                                  write the export to <dir> as a fresh
//                                                  repository with ONE commit; never pushes
//
// The export set is every tracked or unignored file minus publicExport.exclude
// in docs/audits/public-use/release-status.json. The scans run on that set
// only, because that is what becomes public: personal identity, machine paths,
// credential patterns, the retired preset's name, and third-party captures. A
// hit fails the run and blocks --out. The private scope (@cdecaire) is reported
// but not failed: renaming it is its own open blocker (neutral-identity).
import { execFileSync } from "node:child_process"
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const args = process.argv.slice(2)
const flag = name => { const i = args.indexOf(name); return i === -1 ? undefined : args[i + 1] }
const outDir = flag("--out")
const author = flag("--author")
const status = JSON.parse(readFileSync(join(root, "docs/audits/public-use/release-status.json"), "utf8"))
const exclude = status.publicExport.exclude
const excluded = path => exclude.some(rule => (rule.endsWith("/") ? path.startsWith(rule) : path === rule))

const all = [...new Set(execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean))]
	.filter(path => existsSync(join(root, path)))
	.sort()
const files = all.filter(path => !excluded(path))
const left = all.filter(excluded)
// Dropping a whole workspace package would leave pnpm-lock.yaml naming a
// missing importer, and a fresh install of the export would fail.
const droppedWorkspaces = left.filter(path => /^(apps|packages)\/[^/]+\/package\.json$/.test(path))
if (droppedWorkspaces.length) {
	console.error(`[public-export] ✗ the exclusions drop whole workspace packages (${droppedWorkspaces.join(", ")}); exclude their contents selectively or remove them from the workspace first.`)
	process.exit(1)
}

const TEXT = /\.(md|txt|json|tsx?|jsx?|mjs|cjs|css|html|ya?ml|svg)$/i
const CAPTURE = /\.(png|jpe?g|webp|gif|mp4|webm)$/i
const scans = {
	personalIdentity: { pattern: /\bCarl(?: W\.)? DeCaire\b|\bcdecaire@gmail\.com\b/i, hits: [] },
	machinePaths: { pattern: /[A-Z]:[\\/]+Users[\\/]+cdeca\b|\bD:[\\/]+dev[\\/]+/i, hits: [] },
	credentialPatterns: { pattern: /gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, hits: [] },
	retiredPreset: { pattern: /\bdesperse\b/i, hits: [] },
}
const privateScope = []
const images = []
for (const path of files) {
	const bytes = readFileSync(join(root, path))
	if (CAPTURE.test(path)) images.push({ path, bytes: bytes.length })
	if (!TEXT.test(path)) continue
	const body = bytes.toString("utf8")
	for (const scan of Object.values(scans)) if (scan.pattern.test(body)) scan.hits.push(path)
	if (/@cdecaire\/|github\.com[/:]cdecaire\//.test(body)) privateScope.push(path)
}
// Everything that ships in the export is ours. Any raster image must be an
// original (our own UI, our own art); review the list before the first export.
const failures = Object.entries(scans).filter(([, scan]) => scan.hits.length).map(([name, scan]) => `${name}: ${scan.hits.length} file(s) — ${scan.hits.slice(0, 8).join(", ")}${scan.hits.length > 8 ? ", …" : ""}`)

const groups = paths => Object.entries(paths.reduce((acc, path) => { const key = path.split("/").slice(0, path.startsWith("apps/") || path.startsWith("packages/") || path.startsWith("docs/") ? 2 : 1).join("/"); acc[key] = (acc[key] ?? 0) + 1; return acc }, {})).sort((a, b) => b[1] - a[1])
const report = {
	exported: files.length,
	excluded: left.length,
	excludedGroups: groups(left),
	images: { count: images.length, bytes: images.reduce((sum, image) => sum + image.bytes, 0), paths: images.map(image => image.path) },
	scans: Object.fromEntries(Object.entries(scans).map(([name, scan]) => [name, scan.hits])),
	privateScopeFiles: privateScope.length,
	failures,
}

if (args.includes("--json")) console.log(JSON.stringify(report, null, 2))
else {
	console.log(`[public-export] ${files.length} files would be exported; ${left.length} excluded.`)
	for (const [group, count] of report.excludedGroups.slice(0, 12)) console.log(`  excluded  ${String(count).padStart(4)}  ${group}`)
	console.log(`[public-export] ${images.length} images ship (${(report.images.bytes / 1e6).toFixed(1)} MB); review them as originals before the first export.`)
	console.log(`[public-export] ${privateScope.length} files still name the private @cdecaire scope (open blocker: neutral-identity).`)
	if (failures.length) console.error(`[public-export] ✗ scans failed:\n${failures.map(f => `  - ${f}`).join("\n")}`)
	else console.log("[public-export] ✓ identity, machine-path, credential and retired-preset scans are clean on the export set.")
}
if (failures.length) process.exit(1)

if (outDir) {
	if (!author || !/^[^<>]+ <[^<>@\s]+@[^<>\s]+>$/.test(author)) {
		console.error('[public-export] --out needs --author "Name <email>" (use a public, neutral identity, e.g. a GitHub noreply address).')
		process.exit(1)
	}
	const target = resolve(outDir)
	if (existsSync(target) && readdirSync(target).length) {
		console.error(`[public-export] ${target} is not empty; refusing to write into it.`)
		process.exit(1)
	}
	for (const path of files) {
		mkdirSync(dirname(join(target, path)), { recursive: true })
		copyFileSync(join(root, path), join(target, path))
	}
	// Root scripts that drive an excluded app or file would fail in the export.
	const pkgPath = join(target, "package.json")
	const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
	for (const [name, command] of Object.entries(pkg.scripts ?? {})) {
		// Compare whole path words, not substrings: `docs/` must not match `apps/docs`.
		const words = command.split(/[\s"'=]+/).map(word => word.replace(/^\.\//, ""))
		const names = rule => words.some(word => (rule.endsWith("/") ? word === rule.slice(0, -1) || word.startsWith(rule) : word === rule))
		if (exclude.some(names)) delete pkg.scripts[name]
	}
	writeFileSync(pkgPath, `${JSON.stringify(pkg, null, "\t")}\n`)
	const [, name, email] = author.match(/^([^<]+) <([^>]+)>$/)
	const git = (...gitArgs) => execFileSync("git", gitArgs, { cwd: target, stdio: "pipe", env: { ...process.env, GIT_AUTHOR_NAME: name.trim(), GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: name.trim(), GIT_COMMITTER_EMAIL: email } })
	git("init", "-b", "main")
	git("add", "-A")
	git("commit", "-m", "Initial public release", "--no-gpg-sign")
	console.log(`[public-export] ✓ wrote ${files.length} files to ${target} as one commit by ${name.trim()}. Nothing was pushed.`)
}
