import { execFileSync } from "node:child_process"
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const SCRIPT = resolve(__dirname, "../../scripts/design-memory.mjs")
const roots: string[] = []
const project = () => {
	const path = mkdtempSync(join(tmpdir(), "sable-learning-"))
	roots.push(path)
	return path
}

afterEach(() => {
	for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function run(root: string, args: string[]) {
	try {
		return { code: 0, data: JSON.parse(execFileSync(process.execPath, [SCRIPT, ...args, "--json"], { cwd: root, encoding: "utf8" })) }
	} catch (error) {
		const failure = error as { status: number; stdout: string; stderr: string }
		return { code: failure.status, data: JSON.parse(`${failure.stdout ?? ""}${failure.stderr ?? ""}`) }
	}
}

function fixture(root: string) {
	mkdirSync(join(root, "evidence"))
	writeFileSync(join(root, "evidence/before.md"), "Observed: the reading measure fills the wide monitor and scanning loses the next line.")
	writeFileSync(join(root, "evidence/after.md"), "Observed after repair: body measure is bounded independently of the full-width figure.")
	return {
		schemaVersion: 1,
		id: "reading-measure-beside-artifacts",
		title: "Separate prose measure from artifact width",
		tags: ["reading", "measure", "editorial"],
		register: "page",
		mode: "read",
		principle: "Bound prose separately from adjacent full-width artifacts.",
		appliesWhen: "A reading passage shares a region with a wide diagram.",
		avoidWhen: "A data grid needs its entire horizontal range for comparison.",
		change: { before: "Prose inherited diagram width.", after: "Prose has its own measure." },
		provenance: { kind: "build-review", source: "Original documentation proof review", date: "2026-09-06", reviewer: "Test reviewer", sableVersion: "0.60.0" },
		evidence: [{ kind: "before", path: "evidence/before.md", observation: "Scanning lost line position." }, { kind: "after", path: "evidence/after.md", observation: "Bounded measure preserves line tracking." }],
	}
}

describe("package-native design memory", () => {
	it("retrieves scoped precedents without a plugin, network, or local corpus", () => {
		const result = run(project(), ["--search", "motion workspace"])
		expect(result.code).toBe(0)
		expect(result.data.data.lessons[0].id).toBe("motion-needs-a-reason")
		expect(result.data.data.lessons[0].avoidWhen).toContain("workspace")
		expect(result.data.data.lessons[0].confidence).toBe("precedent")
	})

	it("records evidence in the consuming project and retrieves both memory tiers", () => {
		const root = project()
		writeFileSync(join(root, "lesson.json"), JSON.stringify(fixture(root)))
		const result = run(root, ["--record", "lesson.json"])
		expect(result.code).toBe(0)
		expect(result.data.type).toBe("learn.recorded")
		const stored = join(root, ".sable/lessons/reading-measure-beside-artifacts.json")
		expect(JSON.parse(readFileSync(stored, "utf8")).confidence).toBe("provisional")
		const memory = run(root, ["--list"]).data.data.lessons
		expect(memory.some((lesson: { origin: string }) => lesson.origin === "bundled")).toBe(true)
		expect(memory.some((lesson: { origin: string }) => lesson.origin === "project")).toBe(true)
		const original = readFileSync(stored, "utf8")
		expect(run(root, ["--record", "lesson.json"]).data.code).toBe("ERR_LESSON_EXISTS")
		expect(readFileSync(stored, "utf8")).toBe(original)
	})

	it("rejects unsupported lessons, missing artifacts, and aliases of one before/after file", () => {
		const root = project()
		const lesson = fixture(root)
		lesson.avoidWhen = ""
		writeFileSync(join(root, "lesson.json"), JSON.stringify(lesson))
		expect(run(root, ["--record", "lesson.json"]).data.message).toContain("avoidWhen")
		lesson.avoidWhen = "Equivalent table rows."
		lesson.evidence[1].path = "evidence/missing.md"
		writeFileSync(join(root, "lesson.json"), JSON.stringify(lesson))
		expect(run(root, ["--record", "lesson.json"]).data.message).toContain("missing or empty")
		lesson.evidence[1].path = "./evidence/before.md"
		writeFileSync(join(root, "lesson.json"), JSON.stringify(lesson))
		expect(run(root, ["--record", "lesson.json"]).data.message).toContain("different artifacts")
	})

	it("reports evidence lost after recording instead of silently forgetting the lesson", () => {
		const root = project()
		writeFileSync(join(root, "lesson.json"), JSON.stringify(fixture(root)))
		expect(run(root, ["--record", "lesson.json"]).code).toBe(0)
		rmSync(join(root, "evidence/after.md"))
		expect(run(root, ["--check"]).data.code).toBe("ERR_LESSON_INVALID")
	})
})
