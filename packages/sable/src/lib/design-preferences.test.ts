import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const SCRIPT = resolve(__dirname, "../../scripts/design-preferences.mjs")
const roots: string[] = []
const project = () => { const root = mkdtempSync(join(tmpdir(), "sable-preference-")); roots.push(root); return root }
const png = (tag: string) => Buffer.concat([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64"), Buffer.from(tag)])

afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })

function run(root: string, args: string[]) {
	try { return { code: 0, data: JSON.parse(execFileSync(process.execPath, [SCRIPT, ...args, "--json"], { cwd: root, encoding: "utf8", stdio: "pipe" })) } }
	catch (error) { const failure = error as { status: number; stdout: string; stderr: string }; return { code: failure.status, data: JSON.parse(`${failure.stdout ?? ""}${failure.stderr ?? ""}`) } }
}

function fixture(root: string, id = "editorial-authority") {
	mkdirSync(join(root, "evidence"), { recursive: true })
	for (const option of ["column", "spread"]) writeFileSync(join(root, `evidence/${option}.png`), png(option))
	return {
		schemaVersion: 1, id, scope: { kind: "brand", value: "Architecture practice" }, brief: "Present an architecture practice's completed buildings.",
		options: ["column", "spread"].map((id) => ({ id, artifacts: [{ kind: "desktop", path: `evidence/${id}.png`, description: `${id} composition in its rendered desktop view.` }] })),
		choice: "spread", reviewer: { kind: "human", name: "Test reviewer" }, rationale: "The wider building photographs retain the spatial relationships between the buildings and their sites.", date: "2026-09-06",
		source: { kind: "manual", reference: "Explicit comparison of the two architecture studies." },
	}
}

describe("contextual preference memory", () => {
	it("provides a structured template without implying an author or choice", () => {
		const result = run(project(), ["--template"])
		expect(result.data.type).toBe("prefer.template")
		expect(result.data.data.reviewer.kind).toBe("")
		expect(result.data.data.choice).toBe("")
	})

	it("records explicit human judgments with immutable evidence hashes and exact context retrieval", () => {
		const root = project(), record = fixture(root)
		writeFileSync(join(root, "preference.json"), JSON.stringify(record))
		expect(run(root, ["--record", "preference.json"]).code).toBe(0)
		const stored = JSON.parse(readFileSync(join(root, `.sable/preferences/${record.id}.json`), "utf8"))
		expect(stored.options[0].artifacts[0].sha256).toMatch(/^[a-f0-9]{64}$/)
		expect(stored.attribution).toBe("self-reported-human")
		expect(run(root, ["--search", "building"]).data.message).toContain("requires --scope")
		expect(run(root, ["--search", "building", "--scope", "brand:Architecture practice"]).data.data.count).toBe(1)
		expect(run(root, ["--search", "building", "--scope", "brand:Food shop"]).data.data.count).toBe(0)
		expect(run(root, ["--search", "building", "--scope", "project:Architecture practice"]).data.data.count).toBe(0)
		expect(run(root, ["--record", "preference.json"]).data.message).toContain("already exists")
	})

	it("keeps agent observations separate from human preferences, including ties", () => {
		const root = project(), record = fixture(root)
		record.reviewer = { kind: "agent", name: "Independent critic" }; record.choice = "tie"
		writeFileSync(join(root, "preference.json"), JSON.stringify(record))
		expect(run(root, ["--record", "preference.json"]).data.data.attribution).toBe("agent-observation")
		expect(run(root, ["--list"]).data.data.count).toBe(0)
		const observations = run(root, ["--list", "--reviewer", "agent"]).data.data.records
		expect(observations[0].choice).toBe("tie")
		expect(observations[0].confidence).toBe("contextual-judgment")
		expect(run(root, ["--check"]).data.data.checkedCount).toBe(1)
	})

	it("preserves optional mixed dimension choices and validates every image-region binding through the CLI", () => {
		const root = project(), base = fixture(root)
		const options = base.options.map((option) => ({ ...option, artifacts: option.artifacts.map((artifact) => ({ ...artifact, sha256: createHash("sha256").update(readFileSync(join(root, artifact.path))).digest("hex") })) }))
		const record = { ...base, options, choice: "tie", dimensions: [{ dimension: "typography", choice: "column", rationale: "The restrained title fits the architecture captions." }, { dimension: "composition", choice: "spread", rationale: "The broad image makes the building relationship clear." }], regions: [{ id: "caption-measure", optionId: "column", artifact: { path: options[0].artifacts[0].path, sha256: options[0].artifacts[0].sha256 }, rect: { x: 0.1, y: 0.2, width: 0.4, height: 0.3 }, note: "A compact caption aligns to the building edge." }] }
		const write = (value: unknown) => writeFileSync(join(root, "preference.json"), JSON.stringify(value))
		write({ ...record, regions: [{ ...record.regions[0], optionId: "spread" }] })
		expect(run(root, ["--record", "preference.json"]).data.message).toContain("belonging to its optionId")
		write({ ...record, regions: [{ ...record.regions[0], artifact: { ...record.regions[0].artifact, sha256: "0".repeat(64) } }] })
		expect(run(root, ["--record", "preference.json"]).data.message).toContain("SHA-256")
		write({ ...record, dimensions: [record.dimensions[0], record.dimensions[0]] })
		expect(run(root, ["--record", "preference.json"]).data.message).toContain("unique dimension")
		write(record)
		expect(run(root, ["--record", "preference.json"]).code).toBe(0)
		const stored = run(root, ["--search", "caption-measure", "--scope", "brand:Architecture practice"]).data.data.records[0]
		expect(stored.dimensions).toEqual(record.dimensions)
		expect(stored.regions).toEqual(record.regions)
		expect(stored.choice).toBe("tie")
	})

	it("requires explicit attribution, a real date, valid choice, and useful context", () => {
		const root = project(), record = fixture(root)
		record.reviewer.kind = ""; record.date = "2026-02-31"; record.choice = "unseen"; record.scope.value = ""; record.rationale = " "
		writeFileSync(join(root, "preference.json"), JSON.stringify(record))
		const failure = run(root, ["--record", "preference.json"])
		expect(failure.code).toBe(1)
		for (const field of ["reviewer", "date", "choice", "scope.value", "rationale"]) expect(failure.data.message).toContain(field)
	})

	it("rejects aliased or duplicate alternatives and non-rendered evidence", () => {
		const root = project(), record = fixture(root)
		record.options[1].artifacts[0].path = "evidence/../evidence/column.png"
		writeFileSync(join(root, "preference.json"), JSON.stringify(record))
		expect(run(root, ["--record", "preference.json"]).data.message).toContain("different rendered artifacts")
		writeFileSync(join(root, "evidence/forged.png"), "<svg onload=alert(1)></svg>")
		record.options[1].artifacts[0].path = "evidence/forged.png"
		writeFileSync(join(root, "preference.json"), JSON.stringify(record))
		expect(run(root, ["--record", "preference.json"]).data.message).toContain("not rendered evidence")
	})

	it("detects evidence modification and deletion after recording", () => {
		const root = project(), record = fixture(root)
		writeFileSync(join(root, "preference.json"), JSON.stringify(record))
		expect(run(root, ["--record", "preference.json"]).code).toBe(0)
		writeFileSync(join(root, "evidence/column.png"), png("changed"))
		expect(run(root, ["--check"]).data.message).toContain("SHA-256 mismatch")
		rmSync(join(root, "evidence/column.png"))
		expect(run(root, ["--list"]).data.message).toContain("missing or empty")
	})

	it("rejects outside, absolute, URL, and symlink evidence paths", () => {
		const root = project(), outside = project(), record = fixture(root)
		writeFileSync(join(outside, "outside.png"), png("outside"))
		for (const path of ["../outside.png", "C:/outside.png", "https://example.com/screenshot.png"]) {
			record.options[1].artifacts[0].path = path
			writeFileSync(join(root, "preference.json"), JSON.stringify(record))
			expect(run(root, ["--record", "preference.json"]).code).toBe(1)
		}
		symlinkSync(outside, join(root, "linked"), "junction")
		record.options[1].artifacts[0].path = "linked/outside.png"
		writeFileSync(join(root, "preference.json"), JSON.stringify(record))
		expect(run(root, ["--record", "preference.json"]).data.message).toContain("symlink resolves outside")
	})

	it("refuses redirected memory directories and path-shaped record ids", () => {
		const root = project(), outside = project(), record = fixture(root)
		record.id = "../../escaped"
		writeFileSync(join(root, "preference.json"), JSON.stringify(record))
		expect(run(root, ["--record", "preference.json"]).data.message).toContain("id must")
		mkdirSync(join(root, ".sable")); symlinkSync(outside, join(root, ".sable/preferences"), "junction")
		expect(run(root, ["--list"]).data.message).toContain("symlink resolves outside")
	})
})
