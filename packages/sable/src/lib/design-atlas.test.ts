import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { isAbsolute, join, resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const SCRIPT = resolve(__dirname, "../../scripts/design-atlas.mjs")
const roots: string[] = []
const project = () => {
	const root = mkdtempSync(join(tmpdir(), "sable-atlas-"))
	roots.push(root)
	mkdirSync(join(root, "scripts"))
	mkdirSync(join(root, "llms/atlas/evidence"), { recursive: true })
	copyFileSync(SCRIPT, join(root, "scripts/design-atlas.mjs"))
	return root
}

afterEach(() => {
	for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function entry(root: string, id: string, family = "editorial") {
	const path = `llms/atlas/evidence/${id}.webp`
	const content = `Fixture capture for ${id}; file content is only used to test integrity, not visual judgment.`
	writeFileSync(join(root, path), content)
	return {
		id,
		title: id,
		url: `https://example.org/${id}`,
		discovery: { url: "https://recent.design/websites", gallery: "Recent" },
		family,
		domains: ["culture"],
		modes: ["read", "experience"],
		tags: ["museum", "collection", "editorial"],
		summary: "A collection uses a generous image anchor and compact curatorial labels.",
		design: {
			composition: "One broad visual anchor beside a narrower label column.",
			typography: "Large condensed titles contrast with small utilitarian labels.",
			spacing: "Large section intervals and close label grouping.",
			color: "Neutral ground, dark ink, and a restrained accent.",
			imagery: "A large cropped artifact photograph.",
			motion: "Unobserved; a still image cannot establish transitions.",
			interaction: "Unobserved; the capture shows affordances only.",
			story: "The artifact precedes explanation.",
			responsive: "Unobserved; no mobile capture is present.",
		},
		appliesWhen: "An artifact carries the primary narrative.",
		avoidWhen: "A high-volume transaction queue needs compact controls.",
		transferPrinciple: "Give the object more visual weight than its metadata.",
		evidence: [{
			kind: "desktop",
			path,
			sha256: createHash("sha256").update(content).digest("hex"),
			observation: "The inspected desktop capture shows a wide artifact and a narrow label column.",
			capturedAt: "2026-09-06T12:00:00Z",
			viewport: { width: 1440, height: 1000 },
			observed: true,
		}],
	}
}

function catalog(root: string, entries = [entry(root, "museum-index")]) {
	writeFileSync(join(root, "llms/atlas/atlas.json"), JSON.stringify({ schemaVersion: 1, entries }))
}

function run(root: string, args: string[], cwd = root) {
	const result = spawnSync(process.execPath, [join(root, "scripts/design-atlas.mjs"), ...args, "--json"], { cwd, encoding: "utf8" })
	return { code: result.status, data: JSON.parse(`${result.stdout}${result.stderr}`) }
}

describe("offline visual design atlas", () => {
	it("retrieves a brief list and resolves inspected evidence relative to the installed package", () => {
		const root = project()
		catalog(root)
		const list = run(root, ["--search", "museum"])
		expect(list.code).toBe(0)
		expect(list.data.type).toBe("atlas.list")
		expect(list.data.data.entries[0].design).toBeUndefined()
		expect(list.data.data.entries[0].evidence).toBeUndefined()
		expect(list.data.data.entries[0].retrieve).toBe("sable atlas --show museum-index --json")
		const detail = run(root, ["--show", "museum-index"], project())
		expect(detail.code).toBe(0)
		expect(detail.data.type).toBe("atlas.detail")
		const reference = detail.data.data.entries[0]
		expect(reference.design.motion).toContain("Unobserved")
		expect(isAbsolute(reference.evidence[0].absolutePath)).toBe(true)
		expect(reference.evidence[0].absolutePath).toBe(resolve(root, reference.evidence[0].path))
		expect(readFileSync(reference.evidence[0].absolutePath, "utf8")).toContain("Fixture capture")
	})

	it("selects contrasting relevant families instead of returning near-duplicates first", () => {
		const root = project()
		const references = [entry(root, "a-index"), entry(root, "b-index"), entry(root, "c-wall", "exhibition")]
		catalog(root, references)
		const plain = run(root, ["--search", "museum collection", "--limit", "2"])
		expect(plain.data.data.entries.map((item: { id: string }) => item.id)).toEqual(["a-index", "b-index"])
		const varied = run(root, ["--search", "museum collection", "--contrast", "--limit", "2"])
		expect(varied.data.data.entries.map((item: { id: string }) => item.id)).toEqual(["a-index", "c-wall"])
	})

	it("never forces an irrelevant family or weak coincidence to fill the contrast quota", () => {
		const root = project()
		const match = entry(root, "a-index")
		const weak = entry(root, "b-cart", "commerce")
		weak.tags = ["retail"]
		weak.summary = "Products for sale."
		weak.design.composition = "A museum illustration beside a purchase button."
		const unrelated = entry(root, "c-trading", "terminal")
		unrelated.tags = ["trading"]
		unrelated.summary = "A market data grid."
		unrelated.avoidWhen = "A museum collection needs an image narrative."
		catalog(root, [match, weak, unrelated])
		const result = run(root, ["--search", "museum collection", "--contrast", "--limit", "3"])
		expect(result.data.data.entries.map((item: { id: string }) => item.id)).toEqual(["a-index"])
		expect(run(root, ["--search", "agricultural irrigation", "--contrast"]).data.data.count).toBe(0)
		expect(run(root, ["--search", "the website design"]).data.data.count).toBe(0)
	})

	it("respects hard activity and family filters before diversity selection", () => {
		const root = project()
		const tool = entry(root, "archive-console", "terminal")
		tool.modes = ["operate"]
		catalog(root, [entry(root, "museum-index"), tool])
		const filtered = run(root, ["--search", "museum", "--mode", "operate", "--contrast"])
		expect(filtered.data.data.entries.map((item: { id: string }) => item.id)).toEqual(["archive-console"])
		expect(run(root, ["--list", "--family", "editorial", "--mode", "operate"]).data.data.count).toBe(0)
		expect(run(root, ["--family", "unknown"]).data.code).toBe("ERR_UNKNOWN_FAMILY")
	})

	it("accepts explicitly scoped gallery evidence without inventing mobile or motion observations", () => {
		const root = project()
		const reference = entry(root, "gallery-preview")
		reference.evidence[0].kind = "gallery"
		reference.evidence[0].observation = "Only the gallery preview was inspected; live behavior and responsive adaptation are unobserved."
		reference.summary = "The gallery preview shows a large image and a narrow caption."
		catalog(root, [reference])
		expect(run(root, ["--check"]).code).toBe(0)
		expect(run(root, ["--show", reference.id]).data.data.entries[0].evidence[0].kind).toBe("gallery")
	})

	it("rejects evidence tampering on both a full check and detailed retrieval", () => {
		const root = project()
		const reference = entry(root, "museum-index")
		catalog(root, [reference])
		expect(run(root, ["--check"]).code).toBe(0)
		writeFileSync(join(root, reference.evidence[0].path), "A replacement file must not inherit the original observation.")
		for (const flags of [["--check"], ["--show", reference.id]]) {
			const result = run(root, flags)
			expect(result.code).toBe(1)
			expect(result.data.code).toBe("ERR_ATLAS_INVALID")
			expect(result.data.message).toContain("does not match")
		}
	})

	it("rejects missing evidence and uninspected captures", () => {
		const root = project()
		const reference = entry(root, "museum-index")
		catalog(root, [reference])
		rmSync(join(root, reference.evidence[0].path))
		expect(run(root, ["--check"]).data.message).toContain("cannot be read")
		reference.evidence[0].observed = false
		catalog(root, [reference])
		expect(run(root, ["--list"]).data.message).toContain("uninspected captures")
	})

	it.each(["../outside.webp", "llms/atlas/../outside.webp", "/outside.webp", "C:/outside.webp", "llms\\atlas\\outside.webp", "llms/atlas/file.webp:stream"])("rejects nonportable or escaping evidence path %s", (path) => {
		const root = project()
		const reference = entry(root, "museum-index")
		reference.evidence[0].path = path
		catalog(root, [reference])
		expect(run(root, ["--check"]).data.message).toContain("package-relative path")
	})

	it("resolves directory links before allowing evidence outside the package", () => {
		const root = project()
		const outside = project()
		const reference = entry(root, "museum-index")
		writeFileSync(join(outside, "external.webp"), "External evidence")
		symlinkSync(outside, join(root, "llms/atlas/evidence/link"), process.platform === "win32" ? "junction" : "dir")
		reference.evidence[0].path = "llms/atlas/evidence/link/external.webp"
		reference.evidence[0].sha256 = createHash("sha256").update("External evidence").digest("hex")
		catalog(root, [reference])
		expect(run(root, ["--check"]).data.message).toContain("physically remain inside")
	})

	it("rejects schema typos, duplicate ids, and unsupported activity modes", () => {
		const root = project()
		const reference = entry(root, "museum-index")
		writeFileSync(join(root, "llms/atlas/atlas.json"), JSON.stringify({ schemaVersion: 1, entries: [{ ...reference, familiy: "oops" }, reference] }))
		const result = run(root, ["--list"])
		expect(result.data.message).toContain("familiy")
		expect(result.data.message).toContain("duplicates")
		reference.modes = ["premium"]
		catalog(root, [reference])
		expect(run(root, ["--check"]).data.message).toContain("modes must use")
	})

	it.each([
		["--unknown"], ["--search"], ["--limit", "0"], ["--limit", "1.5"], ["--limit", "101"],
		["--mode", "premium"], ["--list", "--list"], ["--list", "--check"], ["--check", "--contrast"], ["--show", "museum-index", "--limit", "1"],
	])("returns a structured actionable error for malformed CLI arguments %j", (...args) => {
		const result = run(project(), args)
		expect(result.code).toBe(1)
		expect(result.data.type).toBe("error")
		expect(result.data.code).toMatch(/^ERR_(BAD_FLAG|BAD_ARGUMENT|MISSING_ARGUMENT)$/)
		expect(result.data.message.length).toBeGreaterThan(10)
	})

	it("answers plainly when no atlas is installed, as in the published package", () => {
		const root = mkdtempSync(join(tmpdir(), "sable-no-atlas-"))
		roots.push(root)
		mkdirSync(join(root, "scripts"))
		copyFileSync(SCRIPT, join(root, "scripts/design-atlas.mjs"))
		const result = run(root, ["--search", "editorial"])
		expect(result.code).toBe(0)
		expect(result.data.data.entries).toEqual([])
		expect(result.data.data.notice).toMatch(/ships none/)
	})

	it("reads a project's own atlas from .sable/atlas", () => {
		const root = mkdtempSync(join(tmpdir(), "sable-project-atlas-"))
		roots.push(root)
		mkdirSync(join(root, "scripts"))
		copyFileSync(SCRIPT, join(root, "scripts/design-atlas.mjs"))
		const cwd = mkdtempSync(join(tmpdir(), "sable-project-"))
		roots.push(cwd)
		mkdirSync(join(cwd, ".sable/atlas"), { recursive: true })
		// An empty project atlas fails validation, which shows it was the one read.
		writeFileSync(join(cwd, ".sable/atlas/atlas.json"), JSON.stringify({ schemaVersion: 1, entries: [] }))
		const result = run(root, ["--list"], cwd)
		expect(result.data.type).toBe("error")
		expect(result.data.message).toMatch(/at least one reference/)
	})
})
