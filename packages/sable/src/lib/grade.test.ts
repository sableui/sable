import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, relative, resolve, sep } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const ROOT = resolve(__dirname, "..", "..")
const CLI = join(ROOT, "bin", "sable.mjs")
const directories: string[] = []
const makeFixture = () => {
	const dir = mkdtempSync(join(tmpdir(), "sable-grade-"))
	directories.push(dir)
	writeFileSync(join(dir, "Surface.tsx"), `export function Surface() {
	return <main><header><h1>Field notes</h1><p>A journal of changing landscapes.</p></header>
		<section><article><h2>Along the coast</h2><p>Notes from the eastern shore.</p></article></section>
		<footer><a href="/archive">Read the archive</a></footer></main>
}`)
	return dir
}
const run = (cwd: string, args: string[]) => {
	const result = spawnSync(process.execPath, [CLI, "grade", ...args, "--json"], { cwd, encoding: "utf8" })
	return { exitCode: result.status, code: result.status, ...JSON.parse(result.stdout) }
}

function completeReview(dir: string) {
	const template = run(dir, ["--template"]).data
	const report = run(dir, ["Surface.tsx"]).data
	template.build = { name: "Field notes", brief: "A quiet, legible editorial archive.", sourceHash: report.sourceHash }
	template.reviewer = { name: "Fixture reviewer", method: "agent" }
	for (const name of ["wide.png", "narrow.png", "reduced.png"]) {
		writeFileSync(join(dir, name), Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=", "base64"))
	}
	template.artifacts = [
		{ id: "wide", path: "wide.png", kind: "screenshot", viewport: { width: 1440, height: 900 }, state: "archive", colorMode: "light", motion: "full" },
		{ id: "narrow", path: "narrow.png", kind: "screenshot", viewport: { width: 390, height: 844 }, state: "archive", colorMode: "light", motion: "full" },
		{ id: "reduced", path: "reduced.png", kind: "screenshot", viewport: { width: 390, height: 844 }, state: "archive", colorMode: "light", motion: "reduced" },
	]
	for (const artifact of template.artifacts) artifact.sha256 = createHash("sha256").update(readFileSync(join(dir, artifact.path))).digest("hex")
	for (const entry of [...template.dimensions, ...template.checks]) Object.assign(entry, { status: "pass", observation: `Observed ${entry.id} on the rendered archive.`, evidence: ["wide", "narrow", "reduced"] })
	return template
}

afterEach(() => {
	for (const dir of directories.splice(0)) {
		const child = relative(tmpdir(), resolve(dir))
		if (!child.startsWith("sable-grade-") || child.includes(sep)) throw new Error("Refusing cleanup outside the fixture directory")
		rmSync(dir, { recursive: true, force: true })
	}
})

describe("static contract and design review remain separate", () => {
	it.each(["", " \n\t\r\n "])("rejects empty source content instead of returning a passing score", (contents) => {
		const dir = makeFixture()
		writeFileSync(join(dir, "Surface.tsx"), contents)
		const result = run(dir, ["Surface.tsx"])
		expect(result.exitCode).toBe(1)
		expect(result.code).toBe("ERR_GRADE_INPUT")
		expect(result.message).toContain("non-empty source")
		expect(result.data?.score).toBeUndefined()
	})

	it("never penalizes an original composition or declares a clean file visually approved", () => {
		const dir = makeFixture()
		const report = run(dir, ["Surface.tsx"])
		expect(report.type).toBe("grade.score")
		expect(report.data.score).toBe(100)
		expect(report.data.conformance.informationalOnly).toBe(true)
		expect(report.data.review.status).toBe("unreviewed")
		expect(run(dir, ["Surface.tsx", "--strict"]).code).toBe(1)
	})

	it("does not let a canonical shell compensate for a contract defect", () => {
		const dir = makeFixture()
		const registry = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf8"))
		const pattern = registry.patterns.items.find((item: { name: string }) => item.name === "DashboardPage")
		writeFileSync(join(dir, "Surface.tsx"), `${pattern.code}\nconst defect = <div className="bg-lime-500" />`)
		const report = run(dir, ["Surface.tsx"]).data
		expect(report.conformance.mean).toBeGreaterThan(0.8)
		expect(report.contract.status).toBe("fail")
		expect(report.score).toBeLessThan(100)
	})

	it("keeps boolean flags from swallowing a target and deduplicates overlapping targets", () => {
		const dir = makeFixture()
		const ordinary = run(dir, ["Surface.tsx"]).data
		const duplicate = run(dir, ["--json", "Surface.tsx", "Surface.tsx"]).data
		expect(duplicate.files).toBe(1)
		expect(duplicate.sourceHash).toBe(ordinary.sourceHash)
	})

	it("does not let a gradient hide unrelated inline color violations", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "Surface.tsx"), 'const art = "linear-gradient(var(--primary), var(--background))"; const chrome = <button style={{ color: "#ff0000" }}>Save</button>')
		const report = run(dir, ["Surface.tsx"]).data
		expect(report.findings.contract.some((finding: { ruleId: string }) => finding.ruleId === "inline-color")).toBe(true)
	})

	it("records complete reviews but never claims to inspect their evidence", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "review.json"), JSON.stringify(completeReview(dir)))
		const result = run(dir, ["Surface.tsx", "--review", "review.json", "--strict"])
		expect(result.code).toBe(0)
		expect(result.data.review.status).toBe("review-recorded")
		expect(result.data.review.limitations).toContain("does not inspect images")
	})

	it("invalidates reviews after source changes", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "review.json"), JSON.stringify(completeReview(dir)))
		writeFileSync(join(dir, "Surface.tsx"), "export const changed = true")
		const result = run(dir, ["Surface.tsx", "--review", "review.json", "--strict"])
		expect(result.code).toBe(1)
		expect(result.data.review.issues.join(" ")).toContain("sourceHash")
	})

	it("fingerprints asset bytes alongside source even when an asset filename stays the same", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "image.svg"), '<svg><title>Before</title></svg>')
		const before = run(dir, ["."]).data
		writeFileSync(join(dir, "image.svg"), '<svg><title>After</title></svg>')
		const after = run(dir, ["."]).data
		expect(after.sourceHash).not.toBe(before.sourceHash)
		expect(after.fingerprint.files).toBe(2)
		expect(after.fingerprint.packageHash).toMatch(/^[a-f0-9]{64}$/)
	})

	it("keeps source fingerprints stable across CRLF checkouts while preserving binary asset bytes", () => {
		const dir = makeFixture()
		const source = readFileSync(join(dir, "Surface.tsx"), "utf8").replace(/\r\n/g, "\n")
		writeFileSync(join(dir, "Surface.tsx"), source)
		const lf = run(dir, ["."]).data.sourceHash
		writeFileSync(join(dir, "Surface.tsx"), source.replace(/\n/g, "\r\n"))
		expect(run(dir, ["."]).data.sourceHash).toBe(lf)
		writeFileSync(join(dir, "font.woff2"), Buffer.from([0, 13, 10, 255]))
		const binary = run(dir, ["."]).data.sourceHash
		writeFileSync(join(dir, "font.woff2"), Buffer.from([0, 10, 255]))
		expect(run(dir, ["."]).data.sourceHash).not.toBe(binary)
	})

	it("rejects before/after aliases pointing at the same capture file", () => {
		const dir = makeFixture()
		const review = completeReview(dir)
		review.artifacts.push({ ...review.artifacts[0], id: "wide-alias", path: "./wide.png" })
		review.iterations = [{ defect: "Weak hierarchy", action: "Increase heading scale", before: ["wide"], after: ["wide-alias"] }]
		writeFileSync(join(dir, "review.json"), JSON.stringify(review))
		const result = run(dir, ["Surface.tsx", "--review", "review.json", "--strict"])
		expect(result.exitCode).toBe(1)
		expect(result.data.review.status).toBe("evidence-incomplete")
		expect(result.data.review.issues.join(" ")).toContain("same file")
	})

	it("detects replaced evidence bytes and reports their current hashes without accepting them", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "review.json"), JSON.stringify(completeReview(dir)))
		writeFileSync(join(dir, "wide.png"), "replaced after review")
		const result = run(dir, ["Surface.tsx", "--review", "review.json", "--strict"])
		expect(result.code).toBe(1)
		expect(result.data.review.issues.join(" ")).toContain("sha256")
		expect(result.data.review.artifactHashes.wide).toMatch(/^[a-f0-9]{64}$/)
	})

	it.each(["missing-file", "unknown-evidence", "untested", "missing-mobile", "duplicate-dimension", "same-iteration-capture"])("rejects incomplete evidence: %s", (defect) => {
		const dir = makeFixture()
		const review = completeReview(dir)
		if (defect === "missing-file") review.artifacts[0].path = "does-not-exist.png"
		if (defect === "unknown-evidence") review.dimensions[0].evidence = ["phantom"]
		if (defect === "untested") review.checks[0].status = "untested"
		if (defect === "missing-mobile") review.artifacts.forEach((entry: { viewport: { width: number } }) => { entry.viewport.width = 1440 })
		if (defect === "duplicate-dimension") review.dimensions.push(review.dimensions[0])
		if (defect === "same-iteration-capture") review.iterations = [{ defect: "Weak heading", action: "Increase contrast", before: ["wide"], after: ["wide"] }]
		writeFileSync(join(dir, "review.json"), JSON.stringify(review))
		const result = run(dir, ["Surface.tsx", "--review", "review.json", "--strict"])
		expect(result.code).toBe(1)
		expect(result.data.review.status).toBe("evidence-incomplete")
	})

	it.each(["dimension", "check", "issue"])("keeps unresolved %s findings open", (kind) => {
		const dir = makeFixture()
		const review = completeReview(dir)
		if (kind === "dimension") review.dimensions[0].status = "revise"
		if (kind === "check") review.checks[0].status = "fail"
		if (kind === "issue") review.openIssues = ["Keyboard focus needs another pass."]
		writeFileSync(join(dir, "review.json"), JSON.stringify(review))
		const result = run(dir, ["Surface.tsx", "--review", "review.json", "--strict"])
		expect(result.code).toBe(1)
		// Issues first: if this ever flakes, the message names the cause instead of just the status.
		expect(result.data.review.issues).toEqual([])
		expect(result.data.review.status).toBe("revision-needed")
	})

	it("accepts props a component forwards to its Base UI root", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "Surface.tsx"), `import { Combobox, Toggle } from "@sableui/react"
export const a = <Toggle pressed onPressedChange={() => {}} aria-label="Bold" />
export const b = <Combobox items={[]} filter={null} />
export const c = <Toggle invented />`)
		const props = run(dir, ["Surface.tsx"]).data.findings.hallucinatedProp.map((f: { prop: string }) => f.prop)
		expect(props).toEqual(["invented"])
	})

	it("accepts icon names the app declares in .sable/icons.json", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "Surface.tsx"), 'import { Icon } from "@sableui/react"\nexport const a = <><Icon name="glitch-wave" /><Icon name="nope" /><Icon name="heart" /></>')
		expect(run(dir, ["Surface.tsx"]).data.counts.offContractIcon).toBe(2)
		mkdirSync(join(dir, ".sable"))
		writeFileSync(join(dir, ".sable", "icons.json"), JSON.stringify({ names: ["glitch-wave"] }))
		const report = run(dir, ["Surface.tsx"]).data
		expect(report.findings.offContractIcon.map((f: { name: string }) => f.name)).toEqual(["nope"])
		expect(report.appIcons).toEqual({ file: ".sable/icons.json", names: 1 })
		writeFileSync(join(dir, "extra.json"), JSON.stringify({ names: "glitch-wave" }))
		expect(run(dir, ["Surface.tsx", "--icons", "extra.json"]).code).toBe("ERR_GRADE_INPUT")
	})

	it("skips --ignore paths in the checks, as sable-lint does, but still fingerprints them", () => {
		const dir = makeFixture()
		mkdirSync(join(dir, "lib", "docs"), { recursive: true })
		writeFileSync(join(dir, "lib", "docs", "palette.ts"), 'export const swatches = ["#8C9B82", "#E4D6C3"]')
		const all = run(dir, ["."]).data
		expect(all.counts.contract).toBe(2)
		const skipped = run(dir, [".", "--ignore", "lib/**"]).data
		expect(skipped.counts.contract).toBe(0)
		expect(skipped.ignored).toEqual({ globs: ["lib/**"], files: 1 })
		expect(skipped.sourceHash).toBe(all.sourceHash)
		expect(run(dir, [".", "--ignore=lib/**"]).data.counts.contract).toBe(0)
	})

	it("returns recoverable input errors for broken review JSON", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "review.json"), "{")
		expect(run(dir, ["Surface.tsx", "--review", "review.json"]).code).toBe("ERR_GRADE_INPUT")
	})

	it("ships example artifacts in the template that the evidence validator accepts once their files exist", () => {
		const dir = makeFixture()
		const template = run(dir, ["--template"]).data
		const kinds = template.artifacts.map((a: { kind: string }) => a.kind)
		expect(kinds).toEqual(["screenshot", "report"])
		for (const a of template.artifacts) expect(`${a.id} ${a.path}`).toMatch(/example/)
		// As shipped, the examples point at no file and carry a placeholder hash, so
		// an unedited template can never pass on them.
		writeFileSync(join(dir, "review.json"), JSON.stringify(template))
		const unedited = run(dir, ["Surface.tsx", "--review", "review.json"]).data.review.issues.join("\n")
		expect(unedited).toContain("Artifact example-wide: missing or empty file")
		// With the files in place and their real hashes, every example field is
		// valid: the template cannot drift from the schema the validator enforces.
		mkdirSync(join(dir, "captures"))
		writeFileSync(join(dir, "captures", "example-wide.png"), Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=", "base64"))
		writeFileSync(join(dir, "captures", "example-keyboard.md"), "Tab order follows the visual order; Enter submits.\n")
		for (const a of template.artifacts) a.sha256 = createHash("sha256").update(readFileSync(join(dir, a.path))).digest("hex")
		writeFileSync(join(dir, "review.json"), JSON.stringify(template))
		const issues: string[] = run(dir, ["Surface.tsx", "--review", "review.json"]).data.review.issues
		expect(issues.filter((issue) => issue.startsWith("Artifact "))).toEqual([])
	})

	/* Each import is judged against the subpath it came from. Judging every
	 * `@sableui/react/*` import against the root barrel reported 25 correct
	 * imports in Sable's own docs app as hallucinations. */
	it("judges a /blocks import against the blocks subpath", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "Surface.tsx"), `import { SignInBlock, PricingCardBlock } from "@sableui/react/blocks"
import { NotABlock } from "@sableui/react/blocks"
export const a = <><SignInBlock /><PricingCardBlock /><NotABlock /></>`)
		const found = run(dir, ["Surface.tsx"]).data.findings.hallucinatedComponent
		expect(found.map((f: { name: string }) => f.name)).toEqual(["NotABlock"])
		expect(found[0].from).toBe("@sableui/react/blocks")
	})

	it("judges /presets and /icons/reicon imports, including lowercase helpers, against their own subpaths", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "Surface.tsx"), `import { parsePreset, presetManifest, type SablePreset } from "@sableui/react/presets"
import { reiconIconSet } from "@sableui/react/icons/reicon"
import { IconProvider } from "@sableui/react"
export const preset: SablePreset = parsePreset({})
export const themes = [presetManifest(preset)]
export const a = <IconProvider set={reiconIconSet}>x</IconProvider>`)
		expect(run(dir, ["Surface.tsx"]).data.findings.hallucinatedComponent).toEqual([])
		// The same helper from the root barrel is a real mistake: Reicon left it.
		writeFileSync(join(dir, "Surface.tsx"), 'import { reiconIconSet } from "@sableui/react"\nexport const s = reiconIconSet')
		expect(run(dir, ["Surface.tsx"]).data.findings.hallucinatedComponent.map((f: { name: string }) => f.name)).toEqual(["reiconIconSet"])
	})

	it("reports a subpath the package does not publish", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "Surface.tsx"), 'import { Button } from "@sableui/react/components"\nexport const a = <Button />')
		const [finding] = run(dir, ["Surface.tsx"]).data.findings.hallucinatedComponent
		expect(finding).toMatchObject({ name: "Button", from: "@sableui/react/components", reason: "not a published subpath" })
	})

	it("does not judge an app's own component that shares a Sable name", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "Surface.tsx"), `import { Button } from "@sableui/react"
function PageHeader({ eyebrow, lede }: { eyebrow: string; lede: string }) { return <header>{eyebrow}{lede}</header> }
function Icon({ name }: { name: string }) { return <i>{name}</i> }
export const a = <><PageHeader eyebrow="Docs" lede="Read me" /><Icon name="local-only" /><Button invented /></>`)
		const report = run(dir, ["Surface.tsx"]).data
		expect(report.findings.hallucinatedProp.map((f: { component: string; prop: string }) => `${f.component}.${f.prop}`)).toEqual(["Button.invented"])
		expect(report.counts.offContractIcon).toBe(0)
	})

	it("follows an aliased import back to the Sable component", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "Surface.tsx"), 'import { Button as SableButton } from "@sableui/react"\nexport const a = <SableButton invented />')
		expect(run(dir, ["Surface.tsx"]).data.findings.hallucinatedProp).toMatchObject([{ component: "Button", prop: "invented" }])
	})

	it("does not judge JSX that is a string, such as a code sample", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "Surface.tsx"), `import { Icon, RadioCard } from "@sableui/react"
const glyph = "plus"
export const sample = \`<RadioCard value="post"\\n  title="Standard" />\\n<Icon name="\${glyph}" />\`
export const a = <RadioCard value="post" title="Standard" invented />`)
		const report = run(dir, ["Surface.tsx"]).data
		expect(report.findings.hallucinatedProp.map((f: { prop: string }) => f.prop)).toEqual(["invented"])
		expect(report.counts.offContractIcon).toBe(0)
	})
})

describe("app-owned surface inventory", () => {
	/* The reuse inventory (finish step 6) used to be written from memory. These
	 * pin the list grade hands it: what counts as an app-owned surface, what
	 * does not, and that the list never moves the score. */
	it("lists hand-built surfaces, media frames and round boxes without scoring them", () => {
		const dir = makeFixture()
		writeFileSync(join(dir, "Surface.tsx"), `import { Card } from "@sableui/react"
export function Surface({ a }) {
	return <main>
		<div className="rounded-lg border border-border p-4">Notes</div>
		<section className="bg-popover p-2">Menu-ish</section>
		<div className="aspect-video overflow-hidden"><canvas /></div>
		<span className="size-2 rounded-full bg-success" />
		<div className="size-10 rounded-full"><img src={a.src} alt="" /></div>
		<p className="text-body-md text-muted-foreground">Plain copy is not a surface.</p>
		<div className="rounded-md px-2">No edge, no fill.</div>
		<Card render={<a href="/x" className="rounded-lg border bg-card p-4" />}>Composed</Card>
		{/* <div className="rounded-lg border p-4"> in a comment */}
	</main>
}`)
		const report = run(dir, ["Surface.tsx"]).data
		// The inventory is never scored: the one finding is the avatar lookalike
		// lint already fails; the surfaces beside it cost nothing.
		expect(report.findings.contract.map((f: { ruleId: string }) => f.ruleId)).toEqual(["lookalike-avatar"])
		expect(report.score).toBe(99)
		expect(report.inventory.informationalOnly).toBe(true)
		const rows = report.inventory.surfaces.map((s: { line: number; tag: string; kind: string; consider: string }) => [s.line, s.tag, s.kind, s.consider])
		expect(rows).toEqual([
			[4, "div", "surface", "Card, or the component that owns this surface"],
			[5, "section", "surface", "Card, or the component that owns this surface"],
			[6, "div", "media frame", "AspectBox"],
			[7, "span", "round", "StatusDot, if it reports a status"],
			[8, "div", "round", "Avatar"],
		])
		expect(report.inventory.byKind).toEqual({ surface: 2, "media frame": 1, round: 2 })
	})
})
