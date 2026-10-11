import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { skeletonize } from "../../scripts/skeleton.mjs"

const PKG_ROOT = resolve(__dirname, "..", "..")
const BIN = join(PKG_ROOT, "bin", "sable.mjs")
const registry = JSON.parse(readFileSync(join(PKG_ROOT, "registry.json"), "utf8"))

/**
 * `sable` is the retrieval surface over the generated catalog: the thing an agent
 * actually calls, because registry.json is 780KB and llms-full.txt is 550KB.
 *
 * What these tests protect is the part a consumer cannot see failing. If the
 * manifest drifts from the real commands, or an error stops carrying a stable
 * code, the CLI keeps working for a human reading its output and quietly stops
 * being machine-usable — which is its entire reason to exist.
 */
function run(args: string[]): { out: string; code: number } {
	try {
		return { out: execFileSync(process.execPath, [BIN, ...args], { encoding: "utf8" }), code: 0 }
	} catch (e) {
		const err = e as { stdout?: string; stderr?: string; status?: number }
		return { out: `${err.stdout ?? ""}${err.stderr ?? ""}`, code: err.status ?? 1 }
	}
}

const json = (args: string[]) => JSON.parse(run([...args, "--json"]).out)

describe("sable manifest", () => {
	it("describes exactly the commands that exist", () => {
		// The manifest is the agent's discovery step. A hand-maintained list would
		// drift the first time a command was added, and an agent would either miss
		// the new command or call one that was removed — both silent.
		const { data } = json(["manifest"])
		const declared = data.commands.map((c: { name: string }) => c.name).sort()
		const help = run(["--help"]).out
		for (const name of declared) expect(help).toContain(name)
		expect(declared).toEqual([...declared].sort())
		expect(declared).toContain("pattern")
		expect(declared).toContain("doctor")
	})

	it("declares a response type for every command, and every error code it can emit", () => {
		const { data } = json(["manifest"])
		for (const c of data.commands) expect(c.returns.length).toBeGreaterThan(0)
		const codes = data.errorCodes.map((e: { code: string }) => e.code)
		expect(codes).toContain("ERR_UNKNOWN_COMPONENT")
		expect(new Set(codes).size).toBe(codes.length)
	})

	it("reports the version of the registry it is serving", () => {
		expect(json(["manifest"]).data.version).toBe(registry.version)
	})
})

describe("error envelopes", () => {
	it("carries a stable code and a usable suggestion for a misspelled component", () => {
		const { out, code } = run(["component", "Buton", "--json"])
		expect(code).toBe(1)
		const err = JSON.parse(out)
		expect(err.type).toBe("error")
		expect(err.code).toBe("ERR_UNKNOWN_COMPONENT")
		// The point of the suggestion is that the agent recovers in one step
		// instead of retrying a guess.
		expect(err.suggestions.join(" ")).toContain("Button")
	})

	it("rejects an out-of-range flag value rather than silently defaulting", () => {
		const err = JSON.parse(run(["component", "Button", "--detail", "everything", "--json"]).out)
		expect(err.code).toBe("ERR_BAD_FLAG")
	})

	it("suggests a real command for an unknown one", () => {
		const err = JSON.parse(run(["componet", "--json"]).out)
		expect(err.code).toBe("ERR_UNKNOWN_COMMAND")
		expect(err.suggestions.join(" ")).toContain("component")
	})
})

describe("component retrieval", () => {
	it("returns a typed envelope whose detail levels actually differ", () => {
		const brief = json(["component", "Button", "--detail", "brief"])
		const full = json(["component", "Button", "--detail", "full"])
		expect(brief.type).toBe("component.detail")
		expect(brief.data.props).toBeUndefined()
		expect(full.data.props.length).toBeGreaterThan(0)
		expect(full.data.examples.length).toBeGreaterThan(0)
		expect(JSON.stringify(full).length).toBeGreaterThan(JSON.stringify(brief).length)
	})

	it("ships an import line with every component, because an example without one does not compile", () => {
		for (const name of ["Button", "DataTable", "Region"]) {
			const cmd = registry.components.some((c: { name: string }) => c.name === name) ? "component" : "layout"
			expect(json([cmd, name]).data.import).toBe(`import { ${name} } from "@sableui/react"`)
		}
	})

	it("lists the whole catalog and filters it by register", () => {
		const all = json(["component", "--list"])
		expect(all.data.count).toBe(registry.components.length)
		const workspace = json(["component", "--list", "--register", "workspace"])
		expect(workspace.data.count).toBeLessThan(all.data.count)
		expect(workspace.data.components.every((c: { register: string }) => c.register !== "page")).toBe(true)
	})
})

describe("pattern skeletons", () => {
	const patterns = registry.patterns.items as Array<{ name: string; code: string }>

	it("reduces every pattern to a tree that is strictly smaller than its source", () => {
		for (const p of patterns) {
			const { tree } = skeletonize(p.code)
			expect(tree.split("\n").length, p.name).toBeLessThan(p.code.split("\n").length)
			expect(tree.trim().length, p.name).toBeGreaterThan(0)
		}
	})

	it("keeps the layout decisions and drops the demo content", () => {
		const { tree } = skeletonize(patterns.find((p) => p.name === "DashboardPage")!.code)
		// The four things the shell exists to demonstrate.
		expect(tree).toContain("<AppShell />")
		expect(tree).toContain('<Page max="wide"')
		expect(tree).toContain("cols={{ base: 2, xl: 4 }}")
		expect(tree).toContain("sidebar:")
		// …and none of the demo fixtures the real source carries.
		expect(tree).not.toContain("Revenue")
		expect(tree).not.toContain("Gold Rush")
	})

	it("never invents a prop out of a closing tag", () => {
		// `<span className="x">text</span>` on one line used to scan its own closing
		// tag as a bare boolean prop, printing `<span className="x" span />` on most
		// rows of most trees — a skeleton that lies about the API is worse than none.
		for (const p of patterns) {
			const { tree } = skeletonize(p.code)
			expect(tree, p.name).not.toMatch(/"\s+(span|div|p|a|main|section|h1|h2|h3|li|nav|label)\s+\/>/)
		}
	})

	it("collapses repeated siblings instead of printing them out", () => {
		const { tree } = skeletonize(patterns.find((p) => p.name === "DashboardPage")!.code)
		// The bottom nav is five identical items; the sidebar no longer is (one carries a badge).
		expect(tree).toMatch(/<BottomNavItem \/>\s+×5/)
	})

	it("is reachable from the CLI with the fixture count reported", () => {
		const { data } = json(["pattern", "DashboardPage", "--skeleton"])
		expect(data.elidedFixtures).toBeGreaterThan(0)
		expect(data.tree).toContain("<AppShell />")
	})
})

describe("docs mirrors", () => {
	it("resolves a page for every component name, including the ones whose slug is not their name", () => {
		// Mirror slugs come from the component's directory, which can differ from
		// its name. An agent only ever has the name, so the name has to resolve.
		const slugs = new Set(json(["docs", "--list"]).data.docs.map((d: { slug: string }) => d.slug))
		const missing = registry.components
			.filter((c: { path: string }) => !slugs.has(c.path.split("/").pop()))
			.map((c: { name: string }) => c.name)
		expect(missing).toEqual([])
		// And the resolver really does take the name, not just the slug.
		expect(run(["docs", "EmptyState", "--json"]).code).toBe(0)
	})

	it("serves a mirror by the component's own name", () => {
		const { type, data } = json(["docs", "DataTable"])
		expect(type).toBe("docs.detail")
		expect(data.content).toContain("# DataTable")
	})

	it("names the doc a component page can actually be retrieved by", () => {
		// The `More:` footer is a literal command; if it prints a slug that 404s it
		// is worse than printing nothing.
		const suggested = run(["component", "EmptyState"]).out.match(/sable docs (\S+)/)?.[1]
		expect(suggested).toBeDefined()
		expect(run(["docs", suggested!, "--json"]).code).toBe(0)
	})
})

describe("search", () => {
	it("ranks an exact component name above prose matches", () => {
		const { data } = json(["search", "Badge"])
		expect(data.results[0].name).toBe("Badge")
		expect(data.results[0].retrieve).toBe("sable component Badge")
	})

	it("crosses kinds in one result set", () => {
		const kinds = new Set(json(["search", "grid"]).data.results.map((r: { kind: string }) => r.kind))
		expect(kinds.size).toBeGreaterThan(1)
	})

	it("fails with a code rather than an empty list", () => {
		const err = JSON.parse(run(["search", "zzzznotathing", "--json"]).out)
		expect(err.code).toBe("ERR_NO_RESULTS")
	})
})

describe("utilities", () => {
	it("finds the relative-surface utilities by what someone would type", () => {
		// The reason utilities are searchable at all: "well" used to return the
		// `muted` token, and agents hand-mixed the colour `sable-well` computes.
		expect(json(["search", "well"]).data.results[0].name).toBe("sable-well")
		const hover = json(["search", "hover color on a surface"]).data.results
		expect(hover[0].name).toBe("sable-surface-interactive")
		expect(hover[0].retrieve).toBe("sable utility sable-surface-interactive")
		expect(json(["search", "nested radius"]).data.results.map((r: { name: string }) => r.name)).toContain("rounded-concentric-*")
	})

	it("still puts a component first when one is what the query names", () => {
		// Components before utilities: the well is the track BEHIND a segmented
		// control, not the control.
		expect(json(["search", "segmented"]).data.results[0].kind).toBe("component")
	})

	it("resolves the forms people actually type", () => {
		expect(json(["utility", "rounded-concentric-md/1"]).data.name).toBe("rounded-concentric-*")
		expect(json(["utility", "sable-selected:"]).data.kind).toBe("variant")
		expect(json(["utility", ".sable-well"]).data.family).toBe("relative surface")
		const err = JSON.parse(run(["utility", "sable-wel", "--json"]).out)
		expect(err.code).toBe("ERR_UNKNOWN_UTILITY")
		expect(err.suggestions).toContain("sable utility sable-well")
	})

	it("is in the manifest", () => {
		const names = json(["manifest"]).data.commands.map((c: { name: string }) => c.name)
		expect(names).toContain("utility")
	})
})
