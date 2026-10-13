/**
 * sable patch — fix a Sable component in place while the library fix ships, and
 * hear about it on every upgrade.
 *
 * A defect in a component left an app two choices: restyle it with className,
 * which `component-restyle` rightly flags, or wait for a release. A patch is the
 * third: the project's own package manager patches the installed module
 * (`pnpm patch`, `yarn patch`, or patch-package for npm), and this records why,
 * against which version, and how to tell whether it is still needed:
 *
 *   .sable/patches.json  { patches: [{ component, files, version, base, reason, repro, issue? }] }
 *
 * `base` holds the hash of each file as Sable shipped it at that version
 * (dist/file-hashes.json), so `sable doctor` can tell three things on a later
 * install: whether the patch is applied, whether Sable has changed the file
 * since, and what the changelog says about the component in between. A patch
 * whose file Sable changed fails doctor (and so `sable check`) until someone
 * re-runs the repro and keeps the patch or drops it. Nothing changes silently,
 * in either direction.
 */
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, parse, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { packageManager } from "./agent-setup.mjs"
import { parseFlags } from "./design-preferences.mjs"

export const PATCHES_FILE = join(".sable", "patches.json")
const PACKAGE = "@sableui/react"

const hash = (path) => createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 16)

/** Hashes of every dist file as published, written at build time. */
function shippedHashes(pkgRoot) {
	const path = join(pkgRoot, "dist", "file-hashes.json")
	return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null
}

export function readPatches(root) {
	const path = join(root, PATCHES_FILE)
	if (!existsSync(path)) return []
	const data = JSON.parse(readFileSync(path, "utf8"))
	if (!Array.isArray(data?.patches)) throw Object.assign(new Error(`${PATCHES_FILE} has no patches array.`), { code: "ERR_PATCHES_INVALID" })
	return data.patches
}

function writePatches(root, patches) {
	const path = join(root, PATCHES_FILE)
	mkdirSync(dirname(path), { recursive: true })
	writeFileSync(path, `${JSON.stringify({ patches }, null, 2)}\n`)
}

/**
 * The dist modules a component's patch covers: its own folder's modules, not
 * the barrel or the docs metadata. A part (CardList) resolves to its component.
 */
export function componentFiles(pkgRoot, name) {
	const registry = JSON.parse(readFileSync(join(pkgRoot, "registry.json"), "utf8"))
	const entries = [...(registry.components ?? []), ...(registry.layoutPrimitives?.primitives ?? [])]
	const entry =
		entries.find((c) => c.name === name) ??
		entries.find((c) => (c.subcomponents ?? []).some((s) => s.name === name))
	if (!entry?.path) return null
	const dir = join(pkgRoot, "dist", entry.path)
	if (!existsSync(dir)) return null
	return {
		component: entry.name,
		files: readdirSync(dir)
			.filter((f) => f.endsWith(".js") && f !== "index.js" && !f.endsWith(".meta.js"))
			.map((f) => `dist/${entry.path}/${f}`),
	}
}

/** Changelog bullets between two versions (exclusive, inclusive) that name the component. */
export function changelogMentions(pkgRoot, component, from, to) {
	const path = join(pkgRoot, "CHANGELOG.md")
	if (!existsSync(path)) return []
	const text = readFileSync(path, "utf8")
	const out = []
	for (const section of text.split(/^## /m).slice(1)) {
		const version = section.split(/\s/, 1)[0]
		if (compareVersions(version, from) <= 0 || compareVersions(version, to) > 0) continue
		for (const bullet of section.split(/\n(?=- )/)) {
			if (!bullet.startsWith("- ")) continue
			if (!new RegExp(`\\b${component}\\b`).test(bullet)) continue
			const lead = /^- \*\*(.+?)\*\*/.exec(bullet)?.[1] ?? bullet.slice(2, 120)
			out.push(`${version}: ${lead.replace(/\s+/g, " ").replace(/\.$/, "")}`)
		}
	}
	return out
}

function compareVersions(a, b) {
	const x = String(a).split(/[.-]/).map((n) => Number(n) || 0)
	const y = String(b).split(/[.-]/).map((n) => Number(n) || 0)
	for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) < (y[i] ?? 0) ? -1 : 1
	return 0
}

/** How to make, commit and remove a patch with this project's package manager. */
export function patchSteps(pm, version, files) {
	const list = files.join(", ")
	if (pm === "pnpm")
		return {
			make: [`pnpm patch ${PACKAGE}@${version}`, `edit ${list} in the folder it prints`, "pnpm patch-commit <that folder>"],
			remove: [`pnpm patch-remove ${PACKAGE}@${version}`],
		}
	if (pm === "yarn")
		return {
			make: [`yarn patch ${PACKAGE}`, `edit ${list} in the folder it prints`, "yarn patch-commit -s <that folder>", "(Yarn 1: use the npm steps with patch-package)"],
			remove: [`remove the patch: entry for ${PACKAGE} from package.json resolutions, then yarn install`],
		}
	return {
		make: [`edit ${files.map((f) => `node_modules/${PACKAGE}/${f}`).join(", ")}`, `npx patch-package ${PACKAGE}`, 'add "postinstall": "patch-package" to package.json scripts'],
		remove: [`delete patches/${PACKAGE.replace("/", "+")}+${version}.patch, then reinstall`],
	}
}

/**
 * One doctor check per recorded patch. `fail` when someone has to decide —
 * Sable changed a patched file, or a patch is missing from the installed copy —
 * so the agent is told on the upgrade itself, not when a user hits the bug.
 */
export function patchChecks(pkgRoot, root, installed) {
	let patches
	try {
		patches = readPatches(root)
	} catch (error) {
		return [{ status: "fail", name: "patches", detail: error.message, fix: `Fix or delete ${PATCHES_FILE}.` }]
	}
	if (!patches.length) return []
	const shipped = shippedHashes(pkgRoot)
	if (!shipped) return [{ status: "warn", name: "patches", detail: `${patches.length} recorded, but this Sable build ships no file hashes to check them against.` }]
	const pm = packageManager(parse(root).root, root)
	return patches.map((p) => {
		const name = `patch:${p.component}`
		const why = `"${p.reason}"`
		const missing = p.files.filter((f) => !shipped[f])
		if (missing.length)
			return { status: "fail", name, detail: `${p.version} → ${installed}: Sable no longer ships ${missing.join(", ")} (${why}). The component was restructured.`, fix: `Re-run the repro without the patch: ${p.repro}. Fixed → sable patch ${p.component} --drop. Still broken → patch the new files, then sable patch ${p.component} --keep.` }
		const applied = p.files.some((f) => existsSync(join(pkgRoot, f)) && hash(join(pkgRoot, f)) !== shipped[f])
		const changed = p.files.filter((f) => p.base?.[f] !== shipped[f])
		const steps = patchSteps(pm, installed, p.files)
		if (p.version === installed) {
			if (applied) return { status: "pass", name, detail: `patched for ${why}${p.issue ? ` (${p.issue})` : ""}.` }
			return { status: "warn", name, detail: `recorded for ${why} but not applied: the installed files are Sable's own.`, fix: steps.make.join(" → ") }
		}
		if (!changed.length && applied) return { status: "pass", name, detail: `patched for ${why}; Sable has not changed these files since ${p.version}.` }
		const notes = changelogMentions(pkgRoot, p.component, p.version, installed)
		const news = notes.length ? ` Changelog: ${notes.join(" | ")}.` : ""
		if (!changed.length)
			return { status: "fail", name, detail: `${p.version} → ${installed}: Sable did not change ${p.component}, and your patch (${why}) is not applied to ${installed}.`, fix: `Re-apply it: ${steps.make.join(" → ")}. Then sable patch ${p.component} --keep.` }
		return {
			status: "fail",
			name,
			detail: `${p.version} → ${installed}: Sable changed ${changed.join(", ")} since your patch (${why}).${news}`,
			fix: `Re-run the repro on Sable's own files${applied ? " (remove the patch first)" : ""}: ${p.repro}. Fixed → sable patch ${p.component} --drop. Still broken → re-patch (${steps.make.join(" → ")}), then sable patch ${p.component} --keep, and report it.`,
		}
	})
}

/* ── CLI ────────────────────────────────────────────────────────────────────── */

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
	const args = process.argv.slice(2)
	const json = args.includes("--json")
	const emit = (type, data, text) => process.stdout.write(json ? `${JSON.stringify({ type, data })}\n` : `${text}\n`)
	try {
		const pkgRoot = fileURLToPath(new URL("../", import.meta.url))
		const root = process.cwd()
		const installed = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8")).version
		const name = args[0] && !args[0].startsWith("--") ? args[0] : null
		const flags = parseFlags(name ? args.slice(1) : args, ["--reason", "--repro", "--issue", "--file"], ["--list", "--keep", "--drop", "--json"])
		const patches = readPatches(root)
		const pm = packageManager(parse(root).root, root)
		if (flags.has("--list") || !name) {
			const checks = patchChecks(pkgRoot, root, installed)
			emit("patch.list", { patches, checks }, checks.length ? checks.map((c) => `${c.status === "pass" ? "✓" : c.status === "warn" ? "!" : "✗"} ${c.name} ${c.detail}${c.fix ? `\n    → ${c.fix}` : ""}`).join("\n") : "No Sable patches recorded.")
		} else if (flags.has("--drop")) {
			const p = patches.find((x) => x.component === name)
			if (!p) throw Object.assign(new Error(`No recorded patch for ${name}.`), { code: "ERR_NO_PATCH" })
			writePatches(root, patches.filter((x) => x !== p))
			const steps = patchSteps(pm, p.version, p.files)
			emit("patch.dropped", { component: name, remove: steps.remove }, `Dropped the ${name} patch record. Remove the patch itself too: ${steps.remove.join(" → ")}`)
		} else if (flags.has("--keep")) {
			const p = patches.find((x) => x.component === name)
			if (!p) throw Object.assign(new Error(`No recorded patch for ${name}.`), { code: "ERR_NO_PATCH" })
			const shipped = shippedHashes(pkgRoot) ?? {}
			Object.assign(p, { version: installed, base: Object.fromEntries(p.files.map((f) => [f, shipped[f]])) })
			writePatches(root, patches)
			emit("patch.kept", p, `Kept the ${name} patch against ${installed}. Report it upstream if you haven't, so the library fix can replace it.`)
		} else {
			const reason = flags.get("--reason")
			const repro = flags.get("--repro")
			if (!reason || !repro)
				throw Object.assign(new Error("A patch records why and how to check it: pass --reason \"<what is wrong>\" and --repro \"<how to see it>\"."), { code: "ERR_BAD_ARGUMENT" })
			if (patches.some((x) => x.component === name)) throw Object.assign(new Error(`${name} already has a patch record. Use --keep or --drop.`), { code: "ERR_PATCH_EXISTS" })
			const found = componentFiles(pkgRoot, name)
			const extra = flags.get("--file")
			if (!found && !extra) throw Object.assign(new Error(`No Sable component named ${name}. For a shared module, pass --file dist/lib/<module>.js.`), { code: "ERR_UNKNOWN_COMPONENT" })
			const shipped = shippedHashes(pkgRoot) ?? {}
			const files = [...(found?.files ?? []), ...(extra ? [extra.replace(/\\/g, "/")] : [])]
			const unknown = files.filter((f) => !shipped[f])
			if (unknown.length) throw Object.assign(new Error(`Not a published Sable file: ${unknown.join(", ")}.`), { code: "ERR_UNKNOWN_FILE" })
			const record = { component: found?.component ?? name, files, version: installed, base: Object.fromEntries(files.map((f) => [f, shipped[f]])), reason, repro, ...(flags.get("--issue") ? { issue: flags.get("--issue") } : {}) }
			writePatches(root, [...patches, record])
			const steps = patchSteps(pm, installed, files)
			emit(
				"patch.recorded",
				{ ...record, steps: steps.make },
				`Recorded a patch for ${record.component} against ${installed} in ${relative(root, join(root, PATCHES_FILE))}.\nNow make it with ${pm}:\n${steps.make.map((s) => `  - ${s}`).join("\n")}\nOn every upgrade, sable doctor checks it: it fails when Sable changes these files, until the repro says keep (--keep) or drop (--drop).\nReport the defect upstream so the library fix can replace the patch.`,
			)
		}
	} catch (error) {
		process.stderr.write(`${JSON.stringify({ type: "error", code: error.code ?? "ERR_PATCH", message: error.message, suggestions: ["sable patch --list", "sable docs patching-a-component"] })}\n`)
		process.exitCode = 1
	}
}
