#!/usr/bin/env node
/** Offline precedent retrieval and project-owned, evidence-linked learning. */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const text = (value) => typeof value === "string" && value.trim().length > 0
const words = (value) => String(value).toLowerCase().match(/[a-z0-9]+/g) ?? []
const inside = (root, file) => {
	const rel = relative(root, file)
	return rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)
}

export function validateLesson(lesson, { root, bundled = false } = {}) {
	const errors = []
	if (!lesson || typeof lesson !== "object" || Array.isArray(lesson)) return ["Lesson must be an object."]
	if (lesson.schemaVersion !== 1) errors.push("schemaVersion must be 1.")
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lesson.id ?? "")) errors.push("id must be a lowercase hyphenated slug.")
	for (const key of ["title", "principle", "appliesWhen", "avoidWhen"]) {
		if (!text(lesson[key])) errors.push(`${key} must describe a concrete decision.`)
	}
	if (!Array.isArray(lesson.tags) || !lesson.tags.length || lesson.tags.some((tag) => !text(tag))) errors.push("tags must contain searchable terms.")
	if (!["page", "workspace", "either"].includes(lesson.register)) errors.push("register must be page, workspace, or either.")
	if (!["persuade", "operate", "read", "experience", "either"].includes(lesson.mode)) errors.push("mode must be persuade, operate, read, experience, or either.")
	if (!text(lesson.provenance?.source) || !text(lesson.provenance?.date)) errors.push("provenance needs a source description and date.")
	if (lesson.provenance?.kind !== (bundled ? "curated-precedent" : "build-review")) errors.push(`provenance.kind must be ${bundled ? "curated-precedent" : "build-review"}.`)
	if (!bundled && (!text(lesson.provenance?.reviewer) || !text(lesson.provenance?.sableVersion))) errors.push("Build provenance needs reviewer and sableVersion.")
	if (!bundled && (!text(lesson.change?.before) || !text(lesson.change?.after))) errors.push("change must describe the observed before state and resulting after state.")
	const evidence = Array.isArray(lesson.evidence) ? lesson.evidence : []
	if (!evidence.length) errors.push("evidence must contain artifact references.")
	if (!bundled) {
		for (const kind of ["before", "after"]) if (!evidence.some((item) => item.kind === kind)) errors.push(`Evidence needs a ${kind} artifact.`)
	}
	for (const [index, item] of evidence.entries()) {
		if (!item || !text(item.path) || !text(item.observation)) {
			errors.push(`evidence[${index}] needs path and observation.`)
			continue
		}
		if (!(bundled ? ["source"] : ["before", "after"]).includes(item.kind)) errors.push(`evidence[${index}] has an invalid kind.`)
		if (!root) continue
		const file = resolve(root, item.path)
		if (!inside(root, file)) errors.push(`evidence[${index}] must stay inside the project.`)
		else if (!existsSync(file) || !statSync(file).isFile() || statSync(file).size === 0) errors.push(`evidence[${index}] is missing or empty: ${item.path}`)
	}
	if (!bundled) {
		const normalize = (path) => root && text(path) ? resolve(root, path) : path
		const before = new Set(evidence.filter((item) => item?.kind === "before").map((item) => normalize(item.path)))
		if (evidence.some((item) => item?.kind === "after" && before.has(normalize(item.path)))) errors.push("Before and after must reference different artifacts.")
	}
	return errors
}

export function readLessons(root = process.cwd()) {
	const catalog = JSON.parse(readFileSync(join(PACKAGE, "llms", "taste", "lessons.json"), "utf8"))
	const lessons = catalog.lessons.map((lesson) => ({ ...lesson, origin: "bundled", confidence: "precedent", retrieve: `sable docs ${lesson.id}` }))
	const errors = []
	for (const lesson of lessons) errors.push(...validateLesson(lesson, { root: PACKAGE, bundled: true }).map((error) => `${lesson.id}: ${error}`))
	const local = join(root, ".sable", "lessons")
	if (existsSync(local)) {
		for (const name of readdirSync(local).filter((name) => name.endsWith(".json")).sort()) {
			try {
				const lesson = JSON.parse(readFileSync(join(local, name), "utf8"))
				const failures = validateLesson(lesson, { root })
				if (failures.length) errors.push(...failures.map((error) => `${name}: ${error}`))
				else lessons.push({ ...lesson, origin: "project", confidence: "provisional" })
			} catch (error) { errors.push(`${name}: ${error.message}`) }
		}
	}
	const ids = lessons.map((lesson) => lesson.id)
	if (new Set(ids).size !== ids.length) errors.push("Lesson ids must be unique across bundled and project memory.")
	return { lessons, errors }
}

export function searchLessons(lessons, query = "") {
	const terms = [...new Set(words(query))]
	if (!terms.length) return lessons
	return lessons.map((lesson) => {
		const tags = new Set(words([lesson.id, lesson.title, ...lesson.tags, lesson.register, lesson.mode].join(" ")))
		const body = new Set(words(`${lesson.appliesWhen} ${lesson.avoidWhen} ${lesson.principle}`))
		const score = terms.reduce((sum, term) => sum + (tags.has(term) ? 4 : body.has(term) ? 1 : 0), 0)
		return { ...lesson, relevance: score }
	}).filter((lesson) => lesson.relevance > 0).sort((a, b) => b.relevance - a.relevance || a.id.localeCompare(b.id))
}

const template = {
	schemaVersion: 1,
	id: "replace-with-specific-lesson",
	title: "",
	tags: [],
	register: "page",
	mode: "operate",
	principle: "",
	appliesWhen: "",
	avoidWhen: "",
	change: { before: "", after: "" },
	provenance: { kind: "build-review", source: "", date: "", reviewer: "", sableVersion: "" },
	evidence: [{ kind: "before", path: "", observation: "" }, { kind: "after", path: "", observation: "" }],
}

function main() {
	const args = process.argv.slice(2)
	const flags = new Map()
	const values = new Set(["--search", "--show", "--record"])
	const switches = new Set(["--list", "--template", "--check", "--json", "--help"])
	const fail = (code, message) => {
		process.stderr.write(`${JSON.stringify({ type: "error", code, message })}\n`)
		process.exitCode = 1
	}
	for (let index = 0; index < args.length; index++) {
		const arg = args[index]
		if (values.has(arg)) {
			if (!args[index + 1] || args[index + 1].startsWith("--")) return fail("ERR_MISSING_ARGUMENT", `${arg} needs a value.`)
			flags.set(arg, args[++index])
		} else if (switches.has(arg)) flags.set(arg, true)
		else return fail("ERR_BAD_FLAG", `Unknown flag: ${arg}`)
	}
	const actions = ["--list", "--search", "--show", "--record", "--template", "--check"].filter((flag) => flags.has(flag))
	if (actions.length > 1) return fail("ERR_BAD_FLAG", "Choose one of --list, --search, --show, --record, --template, --check.")
	if (flags.has("--help")) {
		process.stdout.write("sable learn — retrieve precedents and record project-owned lessons\n\n  --list | --search <words> | --show <id> | --template | --record <lesson.json> | --check\n  --json   structured { type, data } output\n\nRun from the project root. Evidence paths are relative to that root. Records are provisional reviewer observations, never automatic proof of taste.\n")
		return
	}
	if (flags.has("--template")) {
		process.stdout.write(`${JSON.stringify(template, null, 2)}\n`)
		return
	}
	const root = process.cwd()
	const memory = readLessons(root)
	if (memory.errors.length) return fail("ERR_LESSON_INVALID", memory.errors.join("\n"))
	if (flags.has("--record")) {
		const lesson = JSON.parse(readFileSync(resolve(root, flags.get("--record")), "utf8"))
		const errors = validateLesson(lesson, { root })
		if (errors.length) return fail("ERR_LESSON_INVALID", errors.join("\n"))
		if (memory.lessons.some((existing) => existing.id === lesson.id)) return fail("ERR_LESSON_EXISTS", `The id ${lesson.id} already exists. Reuse its lesson, or record a distinct decision under a new id.`)
		const directory = join(root, ".sable", "lessons")
		mkdirSync(directory, { recursive: true })
		const path = join(directory, `${lesson.id}.json`)
		const recorded = { ...lesson, confidence: "provisional", evidence: lesson.evidence.map((item) => ({ ...item, path: relative(root, resolve(root, item.path)).split(sep).join("/") })) }
		writeFileSync(path, `${JSON.stringify(recorded, null, 2)}\n`, { flag: "wx" })
		process.stdout.write(`${JSON.stringify({ type: "learn.recorded", data: { id: lesson.id, path: relative(root, path), confidence: "provisional" } }, null, 2)}\n`)
		return
	}
	let lessons = searchLessons(memory.lessons, flags.get("--search"))
	if (flags.has("--show")) {
		lessons = lessons.filter((lesson) => lesson.id === flags.get("--show"))
		if (!lessons.length) return fail("ERR_UNKNOWN_LESSON", `No lesson ${flags.get("--show")}. Use sable learn --list.`)
	}
	const type = flags.has("--check") ? "learn.check" : flags.has("--show") ? "learn.detail" : "learn.list"
	const data = { count: lessons.length, lessons, notice: "Precedents guide decisions; they are conditional and do not replace visual review. Local records remain provisional." }
	if (flags.has("--json") || flags.has("--check")) process.stdout.write(`${JSON.stringify({ type, data }, null, 2)}\n`)
	else {
		for (const lesson of lessons) {
			process.stdout.write(`${lesson.id} — ${lesson.title} [${lesson.origin}; ${lesson.confidence}]\n  Apply: ${lesson.appliesWhen}\n  Avoid: ${lesson.avoidWhen}\n`)
			if (flags.has("--show")) process.stdout.write(`  Principle: ${lesson.principle}\n  Evidence: ${JSON.stringify(lesson.evidence)}\n`)
		}
		process.stdout.write(`${lessons.length} lesson(s). ${data.notice}\n`)
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try { main() } catch (error) {
		process.stderr.write(`${JSON.stringify({ type: "error", code: "ERR_LESSON_IO", message: error.message })}\n`)
		process.exitCode = 1
	}
}
