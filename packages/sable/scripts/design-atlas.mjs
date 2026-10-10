#!/usr/bin/env node
/** Offline, evidence-backed visual references. Retrieval is lexical, not a taste score. */
import { createHash } from "node:crypto"
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs"
import { dirname, isAbsolute, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const MODES = ["persuade", "operate", "read", "experience"]
const DESIGN = ["composition", "typography", "spacing", "color", "imagery", "motion", "interaction", "story", "responsive"]
const ENTRY = ["id", "title", "url", "discovery", "family", "domains", "modes", "tags", "summary", "design", "appliesWhen", "avoidWhen", "transferPrinciple", "evidence"]
const text = (value) => typeof value === "string" && value.trim().length > 0
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value)
const slug = (value) => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
const stopwords = new Set("a an and are as at be but by for from has have in into is it of on or our that the their these this to use with website websites design designs inspiration site sites".split(" "))
const words = (value) => [...new Set((String(value).toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter((word) => !stopwords.has(word)))]
const inside = (root, file) => {
	const path = relative(root, file)
	return path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path)
}
const webUrl = (value) => {
	try { return typeof value === "string" && ["https:", "http:"].includes(new URL(value).protocol) } catch { return false }
}
const keys = (value, allowed, label, errors) => {
	if (!object(value)) { errors.push(`${label} must be an object.`); return false }
	for (const key of Object.keys(value)) if (!allowed.includes(key)) errors.push(`${label}.${key} is not a supported field.`)
	return true
}
const strings = (value) => Array.isArray(value) && value.length > 0 && value.every(text) && new Set(value).size === value.length
const portablePath = (value) => text(value) && !isAbsolute(value) && !/^[a-z]:/i.test(value) && !/[\\:\x00]/.test(value) && value.split("/").every((part) => part !== "" && part !== "." && part !== "..")

/** Schema checks always run; --check additionally verifies every file and its physical containment. */
export function validateAtlas(atlas, { root = PACKAGE, verifyEvidence = false } = {}) {
	const errors = []
	if (!keys(atlas, ["schemaVersion", "entries"], "atlas", errors)) return errors
	if (atlas.schemaVersion !== 1) errors.push("atlas.schemaVersion must be 1.")
	if (!Array.isArray(atlas.entries) || !atlas.entries.length) {
		errors.push("atlas.entries must contain at least one reference.")
		return errors
	}
	const ids = new Set()
	for (const [index, entry] of atlas.entries.entries()) {
		const label = `entries[${index}]`
		if (!keys(entry, ENTRY, label, errors)) continue
		for (const key of ["id", "family"]) if (!slug(entry[key])) errors.push(`${label}.${key} must be a lowercase hyphenated slug.`)
		if (ids.has(entry.id)) errors.push(`${label}.id duplicates ${entry.id}.`)
		ids.add(entry.id)
		for (const key of ["title", "summary", "appliesWhen", "avoidWhen", "transferPrinciple"]) if (!text(entry[key])) errors.push(`${label}.${key} must describe the reference and its context.`)
		if (!webUrl(entry.url)) errors.push(`${label}.url must be an http or https URL.`)
		if (keys(entry.discovery, ["url", "gallery"], `${label}.discovery`, errors)) {
			if (!webUrl(entry.discovery.url) || !text(entry.discovery.gallery)) errors.push(`${label}.discovery needs a gallery name and http or https URL.`)
		}
		for (const key of ["domains", "tags", "modes"]) if (!strings(entry[key])) errors.push(`${label}.${key} must be a nonempty array of unique strings.`)
		if (Array.isArray(entry.modes) && entry.modes.some((mode) => !MODES.includes(mode))) errors.push(`${label}.modes must use ${MODES.join(", ")}.`)
		if (keys(entry.design, DESIGN, `${label}.design`, errors)) {
			for (const key of DESIGN) if (!text(entry.design[key])) errors.push(`${label}.design.${key} must describe an observation or explicitly say it was unobserved.`)
		}
		if (!Array.isArray(entry.evidence) || !entry.evidence.length) { errors.push(`${label}.evidence must contain a captured reference.`); continue }
		const evidencePaths = new Set()
		for (const [number, evidence] of entry.evidence.entries()) {
			const item = `${label}.evidence[${number}]`
			if (!keys(evidence, ["kind", "path", "sha256", "observation", "capturedAt", "viewport", "observed"], item, errors)) continue
			if (!["desktop", "mobile", "interaction", "gallery"].includes(evidence.kind)) errors.push(`${item}.kind must be desktop, mobile, interaction, or gallery.`)
			if (!portablePath(evidence.path)) errors.push(`${item}.path must be a portable package-relative path without traversal.`)
			if (!/^[a-f0-9]{64}$/.test(evidence.sha256 ?? "")) errors.push(`${item}.sha256 must be a lowercase SHA-256 digest.`)
			if (!text(evidence.observation)) errors.push(`${item}.observation must state what was actually inspected.`)
			if (evidence.observed !== true) errors.push(`${item}.observed must be true; uninspected captures are not evidence.`)
			if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(evidence.capturedAt ?? "") || !Number.isFinite(Date.parse(evidence.capturedAt))) errors.push(`${item}.capturedAt must be an ISO date or timestamp.`)
			if (keys(evidence.viewport, ["width", "height"], `${item}.viewport`, errors)) {
				for (const dimension of ["width", "height"]) if (!Number.isSafeInteger(evidence.viewport[dimension]) || evidence.viewport[dimension] < 1) errors.push(`${item}.viewport.${dimension} must be a positive integer.`)
			}
			if (evidencePaths.has(evidence.path)) errors.push(`${item}.path duplicates a capture in this entry.`)
			evidencePaths.add(evidence.path)
			if (!verifyEvidence || !portablePath(evidence.path)) continue
			try {
				const physicalRoot = realpathSync(root)
				const file = resolve(root, evidence.path)
				if (!inside(root, file) || !inside(physicalRoot, realpathSync(file))) { errors.push(`${item}.path must physically remain inside the package (including symlinks).`); continue }
				if (!statSync(file).isFile() || statSync(file).size === 0) { errors.push(`${item}.path must name a nonempty file.`); continue }
				const digest = createHash("sha256").update(readFileSync(file)).digest("hex")
				if (digest !== evidence.sha256) errors.push(`${item}.sha256 does not match the captured file.`)
			} catch (error) { errors.push(`${item}.path cannot be read: ${error.code ?? error.message}`) }
		}
	}
	return errors
}

/*
 * Where an atlas lives. The published package ships none: its references are
 * captures of other companies' sites, which are not ours to redistribute. A
 * project can keep its own at `.sable/atlas/atlas.json` (evidence paths relative
 * to the project root); a workspace checkout of Sable still has its internal one.
 */
export function locateAtlas({ root = PACKAGE, cwd = process.cwd() } = {}) {
	for (const [base, file] of [[root, "llms/atlas/atlas.json"], [cwd, ".sable/atlas/atlas.json"]]) {
		if (existsSync(resolve(base, file))) return { root: base, file }
	}
	return null
}

export function readAtlas({ root = PACKAGE, file = "llms/atlas/atlas.json", verifyEvidence = false } = {}) {
	const atlas = JSON.parse(readFileSync(resolve(root, file), "utf8"))
	return { entries: atlas.entries, errors: validateAtlas(atlas, { root, verifyEvidence }) }
}

const jaccard = (a, b) => {
	const union = new Set([...a, ...b])
	return union.size ? [...a].filter((term) => b.has(term)).length / union.size : 0
}

/** Context filters are hard constraints. Contrasting choices must remain positively relevant. */
export function searchAtlas(entries, { query = "", mode, family, limit = 6, contrast = false } = {}) {
	const terms = words(query)
	const candidates = entries.filter((entry) => (!mode || entry.modes.includes(mode)) && (!family || entry.family === family)).map((entry) => {
		const identity = new Set(words([entry.id, entry.title, entry.family, ...entry.domains, ...entry.modes, ...entry.tags].join(" ")))
		const context = new Set(words(`${entry.summary} ${entry.appliesWhen} ${entry.transferPrinciple}`))
		const design = new Set(words(Object.values(entry.design).join(" ")))
		// Avoid-when text deliberately does not attract a reference to a use it warns against.
		const matchedTerms = terms.filter((term) => identity.has(term) || context.has(term) || design.has(term))
		const raw = terms.reduce((sum, term) => sum + (identity.has(term) ? 5 : context.has(term) ? 3 : design.has(term) ? 1 : 0), 0)
		const relevance = terms.length ? raw * (matchedTerms.length / terms.length) : 1
		return { ...entry, relevance, matchedTerms }
	}).filter((entry) => entry.relevance > 0 && (!text(query) || terms.length > 0)).sort((a, b) => b.relevance - a.relevance || a.id.localeCompare(b.id))
	if (!contrast || !candidates.length) return { entries: candidates.slice(0, limit), total: candidates.length }
	const maximum = candidates[0].relevance
	// A weak keyword coincidence is not a useful contrasting direction.
	const remaining = candidates.filter((entry) => entry.relevance >= maximum * 0.35)
	const selected = []
	while (remaining.length && selected.length < limit) {
		let best = 0
		let bestScore = -Infinity
		for (const [index, candidate] of remaining.entries()) {
			const tags = new Set(candidate.tags)
			const similarity = selected.length ? Math.max(...selected.map((entry) => (candidate.family === entry.family ? 0.75 : 0) + 0.25 * jaccard(tags, new Set(entry.tags)))) : 0
			const score = candidate.relevance / maximum - 0.45 * similarity
			if (score > bestScore) { best = index; bestScore = score }
		}
		selected.push(remaining.splice(best, 1)[0])
	}
	return { entries: selected, total: candidates.length }
}

const notice = "References are contextual observations, not templates or proof of usability. View the local evidence; preserve uncertainty about unobserved behavior. Retrieval is lexical and contrast favors different visual families among relevant matches."
const brief = (entry) => ({ id: entry.id, title: entry.title, url: entry.url, family: entry.family, domains: entry.domains, modes: entry.modes, summary: entry.summary, evidenceKinds: [...new Set(entry.evidence.map((item) => item.kind))], ...(entry.relevance !== undefined ? { relevance: entry.relevance, matchedTerms: entry.matchedTerms } : {}), retrieve: `sable atlas --show ${entry.id} --json` })
const detail = (entry, root) => ({ ...entry, evidence: entry.evidence.map((item) => ({ ...item, absolutePath: resolve(root, item.path) })) })

export function runAtlas(args, { root = PACKAGE, stdout = process.stdout, stderr = process.stderr } = {}) {
	const fail = (code, message, suggestions = []) => { stderr.write(`${JSON.stringify({ type: "error", code, message, suggestions })}\n`); return 1 }
	const flags = new Map()
	const values = new Set(["--search", "--show", "--mode", "--family", "--limit"])
	const switches = new Set(["--list", "--check", "--contrast", "--json", "--help"])
	for (let index = 0; index < args.length; index++) {
		const flag = args[index]
		if (!values.has(flag) && !switches.has(flag)) return fail("ERR_BAD_FLAG", `Unknown flag: ${flag}`, ["sable atlas --help"])
		if (flags.has(flag)) return fail("ERR_BAD_FLAG", `Repeated flag: ${flag}`)
		if (values.has(flag)) {
			if (!text(args[index + 1]) || args[index + 1].startsWith("--")) return fail("ERR_MISSING_ARGUMENT", `${flag} needs a value.`)
			flags.set(flag, args[++index])
		} else flags.set(flag, true)
	}
	const actions = ["--list", "--search", "--show", "--check"].filter((flag) => flags.has(flag))
	if (actions.length > 1) return fail("ERR_BAD_FLAG", "Choose one of --list, --search, --show, or --check.")
	const modifiers = ["--mode", "--family", "--limit", "--contrast"]
	if ((flags.has("--show") || flags.has("--check")) && modifiers.some((flag) => flags.has(flag))) return fail("ERR_BAD_FLAG", "Context filters, --limit, and --contrast apply only to listing or searching.")
	if (flags.has("--mode") && !MODES.includes(flags.get("--mode"))) return fail("ERR_BAD_ARGUMENT", `--mode must be ${MODES.join(", ")}.`)
	if (flags.has("--limit") && (!/^[1-9]\d*$/.test(flags.get("--limit")) || Number(flags.get("--limit")) > 100)) return fail("ERR_BAD_ARGUMENT", "--limit must be an integer from 1 to 100.")
	if (flags.has("--help")) {
		stdout.write("sable atlas — inspect an offline visual reference atlas\n\n  --list | --search <words> | --show <id> | --check\n  --mode persuade|operate|read|experience   filter by user activity\n  --family <slug>                          filter by visual family\n  --limit <1..100>                         default: search 6, list 100\n  --contrast                              favor relevant, different families\n  --json                                  structured { type, data } output\n\nListings are brief; --show returns all observations and absolute evidence paths.\n--check verifies schema, file hashes, and physical path containment, offline.\nNo reference is forced when a search has no relevant match.\n")
		return 0
	}
	const located = locateAtlas({ root })
	if (!located) {
		// Not an error: no atlas is installed, so there is nothing to retrieve.
		const data = { entries: [], total: 0, count: 0, notice: "No visual atlas is installed. The Sable package ships none; a project can add its own at .sable/atlas/atlas.json.", suggestion: "Work from the brief and the user's own references, or proceed with an original direction." }
		if (flags.has("--json")) stdout.write(`${JSON.stringify({ type: flags.has("--check") ? "atlas.check" : "atlas.list", data }, null, 2)}
`)
		else stdout.write(`${data.notice}
${data.suggestion}
`)
		return 0
	}
	root = located.root
	try {
		const atlas = readAtlas({ root, file: located.file, verifyEvidence: flags.has("--check") })
		if (atlas.errors.length) return fail("ERR_ATLAS_INVALID", atlas.errors.join("\n"))
		const families = [...new Set(atlas.entries.map((entry) => entry.family))].sort()
		if (flags.has("--family") && !families.includes(flags.get("--family"))) return fail("ERR_UNKNOWN_FAMILY", `No visual family ${flags.get("--family")}.`, families)
		if (flags.has("--check")) {
			stdout.write(`${JSON.stringify({ type: "atlas.check", data: { count: atlas.entries.length, evidenceCount: atlas.entries.reduce((sum, entry) => sum + entry.evidence.length, 0), families, notice } }, null, 2)}\n`)
			return 0
		}
		let found
		if (flags.has("--show")) {
			const entry = atlas.entries.find((item) => item.id === flags.get("--show"))
			if (!entry) return fail("ERR_UNKNOWN_REFERENCE", `No reference ${flags.get("--show")}.`, ["sable atlas --list"])
			// Only inspect the requested files, so retrieval remains inexpensive for a large atlas.
			const errors = validateAtlas({ schemaVersion: 1, entries: [entry] }, { root, verifyEvidence: true })
			if (errors.length) return fail("ERR_ATLAS_INVALID", errors.join("\n"))
			found = { entries: [detail(entry, root)], total: 1 }
		} else {
			found = searchAtlas(atlas.entries, { query: flags.get("--search"), mode: flags.get("--mode"), family: flags.get("--family"), limit: Number(flags.get("--limit") ?? (flags.has("--search") ? 6 : 100)), contrast: flags.has("--contrast") })
			found.entries = found.entries.map(brief)
		}
		const data = { ...found, count: found.entries.length, notice, ...(!found.entries.length ? { suggestion: "Broaden the query or filter, or proceed with an original direction; the atlas is not exhaustive." } : {}) }
		if (flags.has("--json")) stdout.write(`${JSON.stringify({ type: flags.has("--show") ? "atlas.detail" : "atlas.list", data }, null, 2)}\n`)
		else {
			for (const entry of found.entries) {
				stdout.write(`${entry.id} — ${entry.title} [${entry.family}; ${entry.modes.join(", ")}]\n  ${entry.summary}\n`)
				if (flags.has("--show")) {
					for (const key of DESIGN) stdout.write(`  ${key}: ${entry.design[key]}\n`)
					stdout.write(`  Apply: ${entry.appliesWhen}\n  Avoid: ${entry.avoidWhen}\n  Transfer: ${entry.transferPrinciple}\n  Source: ${entry.url}\n  Discovered: ${entry.discovery.url}\n`)
					for (const item of entry.evidence) stdout.write(`  Evidence (${item.kind}): ${item.absolutePath}\n    ${item.observation}\n`)
				} else stdout.write(`  Inspect: ${entry.retrieve}\n`)
			}
			stdout.write(`${data.count} of ${data.total} matching reference(s). ${data.notice}\n${data.suggestion ? `${data.suggestion}\n` : ""}`)
		}
		return 0
	} catch (error) { return fail("ERR_ATLAS_IO", error.message) }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = runAtlas(process.argv.slice(2))
