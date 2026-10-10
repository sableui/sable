#!/usr/bin/env node
/** Contextual judgments, deliberately separate from causal design lessons. */
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs"
import { dirname, isAbsolute, join, relative, resolve, sep, win32 } from "node:path"
import { fileURLToPath } from "node:url"

export const hasText = (value) => typeof value === "string" && value.trim().length > 0
export const PREFERENCE_DIMENSIONS = ["composition", "typography", "density", "imagery", "story", "motion", "color", "spacing", "interaction"]
export const sha256 = (value) => createHash("sha256").update(value).digest("hex")
export const validId = (value) => typeof value === "string" && value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(value)
const inside = (root, path) => { const rel = relative(root, path); return rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel) }
export const portablePath = (root, path) => relative(resolve(root), resolve(root, path)).split(sep).join("/")

/** Check real ancestors as well as lexical paths, including not-yet-created output directories. */
export function projectPath(root, path, { existing = true } = {}) {
	if (!hasText(path) || isAbsolute(path) || win32.isAbsolute(path) || path.includes("\\") || /^[a-z][a-z0-9+.-]*:/i.test(path)) throw new Error("Paths must be relative to the project, using forward slashes.")
	const base = realpathSync(root)
	const target = resolve(root, path)
	if (!inside(resolve(root), target)) throw new Error("Paths must stay inside the project.")
	let ancestor = target
	while (!existsSync(ancestor) && ancestor !== dirname(ancestor)) ancestor = dirname(ancestor)
	if (!inside(base, realpathSync(ancestor))) throw new Error("A symlink resolves outside the project.")
	if (existing && (!existsSync(target) || !statSync(target).isFile() || statSync(target).size === 0)) throw new Error(`Artifact is missing or empty: ${path}`)
	return target
}

export function validateScope(scope) {
	const errors = []
	if (!["personal", "project", "brand", "task-type"].includes(scope?.kind)) errors.push("scope.kind must be personal, project, brand, or task-type.")
	if (!hasText(scope?.value)) errors.push("scope.value must identify the person, project, brand, or task type; no universal preference is inferred.")
	return errors
}

export function artifactMime(buffer) {
	if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png"
	if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return "image/jpeg"
	if (["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString())) return "image/gif"
	if (buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") return "image/webp"
	if (buffer.subarray(4, 8).toString() === "ftyp") return "video/mp4"
	if (buffer.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163]))) return "video/webm"
	throw new Error("Evidence must be a rendered PNG, JPEG, GIF, WebP, MP4, or WebM artifact; SVG, HTML, and prose are not rendered evidence.")
}

export function inspectArtifacts(artifacts, { root, requireHashes = true, seen = new Set(), label = "artifacts" } = {}) {
	const errors = []
	const sealed = []
	if (!Array.isArray(artifacts) || !artifacts.length) return { errors: [`${label} must include rendered evidence.`], artifacts: sealed }
	for (const [index, item] of artifacts.entries()) {
		const key = `${label}[${index}]`
		if (!item || typeof item !== "object") { errors.push(`${key} must be an artifact object.`); continue }
		if (!["desktop", "mobile", "interaction"].includes(item.kind)) errors.push(`${key}.kind must be desktop, mobile, or interaction.`)
		if (!hasText(item.description)) errors.push(`${key}.description must identify the observed view or interaction state.`)
		if (requireHashes && !/^[a-f0-9]{64}$/.test(item.sha256 ?? "")) errors.push(`${key}.sha256 must pin the captured bytes.`)
		try {
			const path = projectPath(root, item.path)
			if (statSync(path).size > 25 * 1024 * 1024) throw new Error("Each artifact must be at most 25 MiB.")
			const bytes = readFileSync(path)
			artifactMime(bytes)
			const hash = sha256(bytes)
			if (item.sha256 && item.sha256 !== hash) errors.push(`${key}: evidence changed since capture (SHA-256 mismatch).`)
			if (seen.has(hash)) errors.push(`${key}: comparisons need different rendered artifacts; duplicate bytes or an alias of the same physical artifact cannot prove an alternative.`)
			seen.add(hash)
			sealed.push({ kind: item.kind, path: portablePath(root, path), sha256: hash, description: item.description })
		} catch (error) { errors.push(`${key}: ${error.message}`) }
	}
	return { errors, artifacts: sealed }
}

export const preferenceTemplate = {
	schemaVersion: 1, id: "replace-with-specific-judgment",
	scope: { kind: "project", value: "" }, brief: "",
	options: ["direction-a", "direction-b"].map((id) => ({ id, artifacts: [{ kind: "desktop", path: "", description: "" }] })),
	choice: "", reviewer: { kind: "", name: "" }, rationale: "", date: "",
	source: { kind: "manual", reference: "" },
	dimensions: [], regions: [],
}

export function validatePreference(record, { root = process.cwd(), requireHashes = true } = {}) {
	if (!record || typeof record !== "object" || Array.isArray(record)) return { errors: ["Preference must be an object."], record: null }
	const errors = []
	if (record.schemaVersion !== 1) errors.push("schemaVersion must be 1.")
	if (!validId(record.id)) errors.push("id must be a lowercase hyphenated slug of at most 80 characters.")
	errors.push(...validateScope(record.scope))
	for (const key of ["brief", "rationale"]) if (!hasText(record[key])) errors.push(`${key} must describe the specific comparison and reason.`)
	if (!["human", "agent"].includes(record.reviewer?.kind) || !hasText(record.reviewer?.name)) errors.push("reviewer must explicitly declare kind human or agent and a name. Do not infer a human preference from an agent decision.")
	if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date ?? "") || Number.isNaN(Date.parse(record.date)) || new Date(record.date).toISOString().slice(0, 10) !== record.date) errors.push("date must be a real YYYY-MM-DD date.")
	if (!["manual", "comparison"].includes(record.source?.kind) || !hasText(record.source?.reference)) errors.push("source needs kind manual or comparison and a reference to the originating review.")
	if (record.source?.kind === "comparison") {
		try {
			const source = projectPath(root, record.source.reference)
			const bytes = readFileSync(source)
			if (!/^[a-f0-9]{64}$/.test(record.source.sha256 ?? "") || sha256(bytes) !== record.source.sha256) errors.push("Comparison source is missing its captured SHA-256 or has changed.")
			const manifest = JSON.parse(bytes.toString("utf8"))
			if (record.brief !== manifest.brief?.prompt || record.scope?.kind !== manifest.scope?.kind || record.scope?.value !== manifest.scope?.value) errors.push("Preference brief and scope must match the source comparison.")
			const expected = new Map((manifest.directions ?? []).map((direction) => [direction.id, direction.artifacts]))
			const canonicalArtifacts = (items) => Array.isArray(items) ? items.map((item) => ({ kind: item?.kind, path: item?.path, sha256: item?.sha256, description: item?.description })) : null
			if (!Array.isArray(record.options) || record.options.length !== expected.size || record.options.some((option) => JSON.stringify(canonicalArtifacts(option?.artifacts)) !== JSON.stringify(canonicalArtifacts(expected.get(option?.id))))) errors.push("Preference alternatives must match the captured source comparison; regenerate a comparison when evidence changes.")
		} catch (error) { errors.push(`Comparison source: ${error.message}`) }
	}
	const options = Array.isArray(record.options) ? record.options : []
	if (options.length < 2 || options.length > 12) errors.push("options must contain between 2 and 12 rendered alternatives.")
	const ids = options.map((option) => option?.id)
	if (ids.some((id) => !validId(id) || id === "tie") || new Set(ids).size !== ids.length) errors.push("Option ids must be unique slugs and cannot be tie.")
	if (record.choice !== "tie" && !ids.includes(record.choice)) errors.push("choice must name an option id or tie.")
	const seen = new Set()
	const sealedOptions = options.map((option, index) => {
		const result = inspectArtifacts(option?.artifacts, { root, requireHashes, seen, label: `options[${index}].artifacts` })
		errors.push(...result.errors)
		return { id: option?.id, artifacts: result.artifacts }
	})
	const dimensions = []
	if (record.dimensions !== undefined) {
		if (!Array.isArray(record.dimensions) || record.dimensions.length > PREFERENCE_DIMENSIONS.length) errors.push("dimensions must be an array of at most nine specific judgments.")
		else for (const [index, item] of record.dimensions.entries()) {
			if (!PREFERENCE_DIMENSIONS.includes(item?.dimension) || dimensions.some((existing) => existing.dimension === item.dimension)) errors.push(`dimensions[${index}].dimension must name a supported, unique dimension.`)
			if (item?.choice !== "tie" && !ids.includes(item?.choice)) errors.push(`dimensions[${index}].choice must name a rendered option or tie.`)
			if (!hasText(item?.rationale) || item.rationale.length > 5000) errors.push(`dimensions[${index}].rationale must state the reviewer's reason in at most 5000 characters.`)
			dimensions.push({ dimension: item?.dimension, choice: item?.choice, rationale: item?.rationale })
		}
	}
	const regions = []
	if (record.regions !== undefined) {
		if (!Array.isArray(record.regions) || record.regions.length > 50) errors.push("regions must be an array of at most 50 evidence-bound notes.")
		else for (const [index, item] of record.regions.entries()) {
			if (!validId(item?.id) || regions.some((existing) => existing.id === item.id)) errors.push(`regions[${index}].id must be a unique slug.`)
			const option = sealedOptions.find((option) => option.id === item?.optionId)
			const artifact = option?.artifacts.find((artifact) => artifact.path === item?.artifact?.path && artifact.sha256 === item?.artifact?.sha256)
			if (!artifact) errors.push(`regions[${index}].artifact must match a captured path and SHA-256 belonging to its optionId.`)
			else if (!artifactMime(readFileSync(projectPath(root, artifact.path))).startsWith("image/")) errors.push(`regions[${index}]: region notes require a still image; a video frame is not pinned by a rectangle alone.`)
			const rect = item?.rect
			if (!rect || !["x", "y", "width", "height"].every((key) => Number.isFinite(rect[key])) || rect.x < 0 || rect.y < 0 || rect.width <= 0 || rect.height <= 0 || rect.x + rect.width > 1 || rect.y + rect.height > 1) errors.push(`regions[${index}].rect must be a positive rectangle within normalized image coordinates 0..1.`)
			if (!hasText(item?.note) || item.note.length > 3000) errors.push(`regions[${index}].note must describe the observed image region in at most 3000 characters.`)
			regions.push({ id: item?.id, optionId: item?.optionId, artifact: item?.artifact, rect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null, note: item?.note })
		}
	}
	return { errors, record: { schemaVersion: 1, id: record.id, scope: record.scope, brief: record.brief, options: sealedOptions, choice: record.choice, reviewer: record.reviewer, rationale: record.rationale, date: record.date, source: record.source, ...(record.dimensions !== undefined ? { dimensions } : {}), ...(record.regions !== undefined ? { regions } : {}), confidence: "contextual-judgment", attribution: record.reviewer?.kind === "human" ? "self-reported-human" : "agent-observation" } }
}

/** Shared exclusive writer: the CLI and local studio preserve the same immutable record contract. */
export function recordPreference(input, { root = process.cwd(), requireHashes = false } = {}) {
	const memory = readPreferences(root)
	if (memory.errors.length) throw new Error(memory.errors.join("\n"))
	const result = validatePreference(input, { root, requireHashes })
	if (result.errors.length) throw new Error(result.errors.join("\n"))
	if (memory.records.some((record) => record.id === result.record.id)) throw new Error(`Preference ${result.record.id} already exists; records are not overwritten.`)
	const directory = projectPath(root, ".sable/preferences", { existing: false })
	mkdirSync(directory, { recursive: true })
	const path = projectPath(root, `.sable/preferences/${result.record.id}.json`, { existing: false })
	writeFileSync(path, `${JSON.stringify(result.record, null, 2)}\n`, { flag: "wx" })
	return { record: result.record, path: portablePath(root, path) }
}

export function readPreferences(root = process.cwd()) {
	const records = [], errors = []
	let directory
	try { directory = projectPath(root, ".sable/preferences", { existing: false }) } catch (error) { return { records, errors: [error.message] } }
	if (!existsSync(directory)) return { records, errors }
	for (const file of readdirSync(directory).filter((name) => name.endsWith(".json")).sort()) {
		try {
			const path = projectPath(root, `.sable/preferences/${file}`)
			const result = validatePreference(JSON.parse(readFileSync(path, "utf8")), { root })
			errors.push(...result.errors.map((error) => `${file}: ${error}`))
			if (!result.errors.length) {
				if (file !== `${result.record.id}.json`) { errors.push(`${file}: filename must match the immutable record id.`); continue }
				records.push(result.record)
			}
		} catch (error) { errors.push(`${file}: ${error.message}`) }
	}
	if (new Set(records.map((record) => record.id)).size !== records.length) errors.push("Preference ids must be unique.")
	return { records, errors }
}

export function searchPreferences(records, query = "", { scope, reviewer = "human" } = {}) {
	const terms = [...new Set(String(query).toLowerCase().match(/[a-z0-9]+/g) ?? [])]
	return records.filter((record) => (reviewer === "all" || record.reviewer.kind === reviewer) && (!scope || (record.scope.kind === scope.kind && record.scope.value.toLowerCase() === scope.value.toLowerCase())))
		.map((record) => ({ ...record, relevance: terms.reduce((score, term) => score + Number(`${record.brief} ${record.rationale} ${record.scope.value} ${(record.dimensions ?? []).map((item) => `${item.dimension} ${item.rationale}`).join(" ")} ${(record.regions ?? []).map((item) => item.note).join(" ")}`.toLowerCase().includes(term)), 0) }))
		.filter((record) => !terms.length || record.relevance > 0).sort((a, b) => b.relevance - a.relevance || b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
}

export function parseFlags(args, values, switches) {
	const flags = new Map()
	for (let index = 0; index < args.length; index++) {
		const arg = args[index]
		if (flags.has(arg)) throw new Error(`Duplicate flag: ${arg}`)
		if (values.includes(arg)) {
			if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error(`${arg} needs a value.`)
			flags.set(arg, args[++index])
		} else if (switches.includes(arg)) flags.set(arg, true)
		else throw new Error(`Unknown flag: ${arg}`)
	}
	return flags
}

function main() {
	const flags = parseFlags(process.argv.slice(2), ["--record", "--search", "--scope", "--reviewer"], ["--template", "--list", "--check", "--json", "--help"])
	if (["--record", "--search", "--template", "--list", "--check"].filter((key) => flags.has(key)).length > 1) throw new Error("Choose one action: --record, --search, --template, --list, or --check.")
	if (flags.has("--help")) { process.stdout.write("sable prefer — contextual preference memory, separate from design lessons\n  --template | --record <file.json> | --list | --search <words> | --check\n  --scope <kind:value>  exact contextual filter, required for search\n  --reviewer human|agent|all  default human; agent observations are never human preferences\n  --json\nRun from the project root. Paths stay inside it. Recording pins evidence hashes; later reads detect changes. Attribution is declared by the reviewer, not authenticated by this offline tool. List is an inventory, not permission to apply preferences to other contexts.\n"); return }
	if (flags.has("--template")) { process.stdout.write(`${JSON.stringify(flags.has("--json") ? { type: "prefer.template", data: preferenceTemplate } : preferenceTemplate, null, 2)}\n`); return }
	const root = process.cwd()
	const memory = readPreferences(root)
	if (memory.errors.length) throw new Error(memory.errors.join("\n"))
	if (flags.has("--record")) {
		const input = projectPath(root, flags.get("--record"))
		const result = recordPreference(JSON.parse(readFileSync(input, "utf8")), { root })
		process.stdout.write(`${JSON.stringify({ type: "prefer.recorded", data: { id: result.record.id, path: result.path, attribution: result.record.attribution, scope: result.record.scope } }, null, 2)}\n`)
		return
	}
	let scope
	if (flags.has("--scope")) {
		const raw = flags.get("--scope"), split = raw.indexOf(":")
		scope = { kind: raw.slice(0, split), value: raw.slice(split + 1) }
		const errors = validateScope(scope)
		if (split < 0 || errors.length) throw new Error("--scope must be kind:value, with a supported kind and a nonempty value.")
	}
	if (flags.has("--search") && !scope) throw new Error("--search requires --scope kind:value so one context is never treated as a universal preference.")
	const reviewer = flags.get("--reviewer") ?? "human"
	if (!["human", "agent", "all"].includes(reviewer)) throw new Error("--reviewer must be human, agent, or all.")
	const records = searchPreferences(memory.records, flags.get("--search"), { scope, reviewer })
	const result = { type: flags.has("--check") ? "prefer.check" : "prefer.list", data: { count: records.length, checkedCount: memory.records.length, records, notice: "Contextual, self-reported judgments. Agent choices are observations and never establish the user's taste. An inventory is not a cross-context recommendation." } }
	if (flags.has("--json") || flags.has("--check")) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
	else { for (const record of records) process.stdout.write(`${record.id} [${record.scope.kind}:${record.scope.value}; ${record.attribution}]\n  Choice: ${record.choice}. ${record.rationale}\n`); process.stdout.write(`${records.length} judgment(s). ${result.data.notice}\n`) }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try { main() } catch (error) { process.stderr.write(`${JSON.stringify({ type: "error", code: "ERR_PREFERENCE_INVALID", message: error.message })}\n`); process.exitCode = 1 }
}
