import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

// The test runtime already supplies jsdom; describe the small API used here without another dependency.
const { JSDOM } = createRequire(import.meta.url)("jsdom") as { JSDOM: new (html: string, options?: { runScripts: "dangerously" }) => { window: Window & typeof globalThis } }

const SCRIPT = resolve(__dirname, "../../scripts/design-directions.mjs")
const PREFER = resolve(__dirname, "../../scripts/design-preferences.mjs")
const roots: string[] = []
const project = () => { const root = mkdtempSync(join(tmpdir(), "sable-direction-")); roots.push(root); return root }
const sha = (value: Buffer | string) => createHash("sha256").update(value).digest("hex")
const png = (tag: string) => Buffer.concat([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64"), Buffer.from(tag)])

afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })

function run(root: string, args: string[], script = SCRIPT) {
	try { return { code: 0, data: JSON.parse(execFileSync(process.execPath, [script, ...args, "--json"], { cwd: root, encoding: "utf8", stdio: "pipe" })) } }
	catch (error) { const failure = error as { status: number; stdout: string; stderr: string }; return { code: failure.status, data: JSON.parse(`${failure.stdout ?? ""}${failure.stderr ?? ""}`) } }
}

function fixture(root: string) {
	mkdirSync(join(root, "evidence"), { recursive: true })
	return {
		schemaVersion: 1, id: "architecture-directions", scope: { kind: "brand", value: "Architecture practice" },
		brief: { prompt: "Explore completed buildings.", outcome: "Find a relevant building study.", audience: "Prospective architecture clients", mode: "read", contentConstraints: ["Same three completed buildings, same photographs, same working project disclosure."] },
		directions: ["column", "spread", "index"].map((id) => ({ id, title: `${id} composition`, rationale: `${id} organizes the same buildings around a different reading relationship.`, axes: { composition: `${id} geometry`, typography: `${id} hierarchy`, density: "Moderate", imagery: "Architectural photographs", story: "Projects followed by practice", motion: "Disclosure only; no entrance effects" }, artifacts: ["desktop", "mobile", "interaction"].map((kind) => {
			const path = `evidence/${id}-${kind}.png`, bytes = png(`${id}:${kind}`)
			writeFileSync(join(root, path), bytes)
			return { kind, path, sha256: sha(bytes), description: `${kind} capture of ${id}; interaction screenshot shows the disclosed project state, not temporal behavior.` }
		}) })),
	}
}

describe("rendered art-direction comparisons", () => {
	it("provides a structured template with all creative axes and capture requirements", () => {
		const result = run(project(), ["--template"])
		expect(result.data.type).toBe("explore.template")
		expect(result.data.data.directions).toHaveLength(3)
		expect(Object.keys(result.data.data.directions[0].axes)).toEqual(["composition", "typography", "density", "imagery", "story", "motion"])
		expect(result.data.data.directions[0].artifacts.map((item: { kind: string }) => item.kind)).toEqual(["desktop", "mobile", "interaction"])
	})

	it("requires three rendered directions with desktop, mobile, interaction, and two declared axes", () => {
		const root = project(), manifest = fixture(root)
		writeFileSync(join(root, "directions.json"), JSON.stringify(manifest))
		const result = run(root, ["--check", "directions.json"])
		expect(result.code).toBe(0)
		expect(result.data.data.diversity).toHaveLength(3)
		expect(result.data.data.notice).toContain("not perceived originality")
		manifest.directions.pop(); manifest.directions[0].artifacts.pop()
		writeFileSync(join(root, "directions.json"), JSON.stringify(manifest))
		const failure = run(root, ["--check", "directions.json"])
		expect(failure.data.message).toContain("between 3 and 6")
		expect(failure.data.message).toContain("interaction artifact")
	})

	it("rejects palette-only variation and cosmetic differences without structural variation", () => {
		const root = project(), manifest = fixture(root)
		manifest.directions[1].axes = { ...manifest.directions[0].axes }
		manifest.directions[1].title = "Same layout in orange"
		writeFileSync(join(root, "directions.json"), JSON.stringify(manifest))
		expect(run(root, ["--check", "directions.json"]).data.message).toContain("Palette-only variants")
		manifest.directions[1].axes.typography = "Different font"
		manifest.directions[1].axes.imagery = "Different tint"
		writeFileSync(join(root, "directions.json"), JSON.stringify(manifest))
		expect(run(root, ["--check", "directions.json"]).data.message).toContain("including composition, density, or story")
	})

	it("rejects duplicated physical evidence and changed bytes", () => {
		const root = project(), manifest = fixture(root)
		manifest.directions[1].artifacts[0] = { ...manifest.directions[0].artifacts[0], path: "evidence/../evidence/column-desktop.png" }
		writeFileSync(join(root, "directions.json"), JSON.stringify(manifest))
		expect(run(root, ["--check", "directions.json"]).data.message).toContain("different rendered artifacts")
		manifest.directions[1].artifacts[0].path = "evidence/spread-desktop.png"
		writeFileSync(join(root, "directions.json"), JSON.stringify(manifest))
		expect(run(root, ["--check", "directions.json"]).data.message).toContain("SHA-256 mismatch")
	})

	it("builds a portable anonymous comparison and safely displays untrusted metadata", () => {
		const root = project(), manifest = fixture(root)
		manifest.brief.prompt = '</script><script>alert("injection")</script>'
		manifest.directions[0].rationale = '<img src=x onerror="alert(1)">'
		writeFileSync(join(root, "directions.json"), JSON.stringify(manifest))
		const result = run(root, ["--compare", "directions.json"])
		expect(result.code).toBe(0)
		const html = readFileSync(join(root, result.data.data.path), "utf8")
		const dom = new JSDOM(html)
		const doc = dom.window.document
		expect(doc.querySelectorAll("script")).toHaveLength(2)
		expect(doc.querySelector("img[onerror]")).toBeNull()
		expect(doc.querySelector("header p:nth-of-type(2)")?.textContent).toBe(manifest.brief.prompt)
		expect([...doc.querySelectorAll("article h2")].map((node) => node.textContent)).toEqual(["Direction A", "Direction B", "Direction C"])
		expect(doc.querySelector("details[open]")).toBeNull()
		expect([...doc.querySelectorAll("img")].every((node) => node.src.startsWith("data:image/png;base64,"))).toBe(true)
		expect(doc.querySelector("select")?.value).toBe("")
		expect(doc.querySelector('input[type="radio"]:checked')).toBeNull()
		expect(doc.querySelector("meta[http-equiv]")?.getAttribute("content")).toContain("script-src 'sha256-")
		const encoded = JSON.parse(doc.getElementById("comparison-data")!.textContent!)
		expect(encoded.brief).toBe(manifest.brief.prompt)
		expect(encoded.source.sha256).toBe(sha(readFileSync(join(root, encoded.source.reference))))
		expect(run(root, ["--compare", "directions.json"]).data.message).toContain("already exists")
		dom.window.close()
	})

	it("exports explicitly attributed preference JSON that the record command accepts and binds to source", async () => {
		const root = project(), manifest = fixture(root)
		writeFileSync(join(root, "directions.json"), JSON.stringify(manifest))
		const result = run(root, ["--compare", "directions.json"])
		const dom = new JSDOM(readFileSync(join(root, result.data.data.path), "utf8"), { runScripts: "dangerously" })
		const doc = dom.window.document
		let blob: Blob | undefined
		Object.defineProperty(dom.window.URL, "createObjectURL", { value: (value: Blob) => { blob = value; return "blob:download" } })
		Object.defineProperty(dom.window.URL, "revokeObjectURL", { value: () => {} })
		dom.window.HTMLAnchorElement.prototype.click = () => {}
		;(doc.querySelector('input[value="A"]') as HTMLInputElement).checked = true
		;(doc.querySelector('[name="kind"]') as HTMLSelectElement).value = "agent"
		;(doc.querySelector('[name="name"]') as HTMLInputElement).value = "Independent test critic"
		;(doc.querySelector('[name="rationale"]') as HTMLTextAreaElement).value = "The chosen composition makes project selection explicit while keeping images legible. This is an agent observation, not the user's preference."
		doc.getElementById("judgment")!.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }))
		expect(blob).toBeDefined()
		const exported = await new Promise<string>((resolve) => { const reader = new dom.window.FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsText(blob!) })
		const record = JSON.parse(exported)
		expect(record.reviewer.kind).toBe("agent")
		expect(record.choice).toBe(JSON.parse(doc.getElementById("comparison-data")!.textContent!).options[0].id)
		expect(doc.getElementById("status")?.textContent).toContain("Nothing has been saved")
		writeFileSync(join(root, "exported.json"), exported)
		expect(run(root, ["--record", "exported.json"], PREFER).code).toBe(0)
		expect(run(root, ["--list"], PREFER).data.data.count).toBe(0)
		expect(run(root, ["--list", "--reviewer", "agent"], PREFER).data.data.count).toBe(1)
		record.id = "changed-scope"; record.scope.value = "Different company"
		writeFileSync(join(root, "changed.json"), JSON.stringify(record))
		expect(run(root, ["--record", "changed.json"], PREFER).data.message).toContain("scope must match")
		writeFileSync(join(root, record.source.reference), `${readFileSync(join(root, record.source.reference), "utf8")}\n`)
		expect(run(root, ["--check"], PREFER).data.message).toContain("has changed")
		dom.window.close()
	})
})
