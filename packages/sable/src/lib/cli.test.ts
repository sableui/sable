import { execFileSync, spawnSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, relative, resolve } from "node:path"
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

describe("blocks", () => {
	it("lists every block, filters by family, and serves a skeleton and the source", () => {
		const list = json(["block", "--list"]).data
		expect(list.count).toBe(registry.blocks.items.length)
		const commerce = json(["block", "--list", "--family", "Commerce"]).data.blocks
		expect(commerce.length).toBeGreaterThan(0)
		expect(commerce.every((b: { family: string }) => b.family === "Commerce")).toBe(true)
		expect(json(["block", "SignInBlock", "--skeleton"]).data.tree).toContain("<Card ")
		const { data } = json(["block", "signinblock", "--code"])
		expect(data.imports).toContain('from "@sableui/react"')
		expect(data.code).toContain("export function SignInBlock(")
	})

	it("answers a misspelled block with its own error code and a near match", () => {
		const { out, code } = run(["block", "SignInBlok", "--json"])
		expect(code).toBe(1)
		const err = JSON.parse(out)
		expect(err.code).toBe("ERR_UNKNOWN_BLOCK")
		expect(err.suggestions.join(" ")).toContain("SignInBlock")
	})

	it("ranks blocks in search and resolves their doc mirrors by name", () => {
		const hits = json(["search", "pricing", "--type", "block"]).data.results
		expect(hits[0].name).toBe("PricingCardBlock")
		expect(hits[0].retrieve).toBe("sable block PricingCardBlock")
		expect(json(["docs", "PricingCardBlock"]).type).toBe("docs.detail")
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

	it("marks blocks, patterns and compositions as references, and behaviour as not", () => {
		const results = json(["search", "card"]).data.results as { kind: string; name: string; reference?: boolean; parts?: string }[]
		const byName = new Map(results.map((r) => [r.name, r]))
		expect(byName.get("Card")?.reference).toBeUndefined()
		expect(byName.get("ProductCardBlock")?.reference).toBe(true)
		const tile = json(["search", "MediaTile"]).data.results[0]
		expect(tile).toMatchObject({ name: "MediaTile", reference: true })
		expect(tile.parts).toContain("AspectBox")
		expect(run(["search", "MediaTile"]).out).toContain("◇ a reference layout")
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

/* ── Fixtures for commands that read the project they run in. ───────────────── */

const SABLE_CSS = '@import "tailwindcss";\n@import "@sableui/react/styles.css";\n@source "../node_modules/@sableui/react/dist/**/*.js";\n'
const CLEAN_APP = `import { Button, IconProvider } from "@sableui/react"
import { reiconIconSet } from "@sableui/react/icons/reicon"

export function App() {
	return (
		<IconProvider set={reiconIconSet}>
			<Button>Save</Button>
		</IconProvider>
	)
}
`

function project(app = CLEAN_APP): string {
	const root = mkdtempSync(join(tmpdir(), "sable-cli-"))
	mkdirSync(join(root, "src"))
	writeFileSync(
		join(root, "package.json"),
		JSON.stringify({ dependencies: { "@sableui/react": "*", react: "^19", "react-dom": "^19", tailwindcss: "^4" } }),
	)
	writeFileSync(join(root, "vite.config.ts"), 'export default { resolve: { dedupe: ["react", "react-dom"] } }\n')
	writeFileSync(join(root, "src", "styles.css"), SABLE_CSS)
	writeFileSync(join(root, "src", "App.tsx"), app)
	return root
}

function runIn(cwd: string, args: string[], input?: string): { out: string; err: string; code: number } {
	const r = spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: "utf8", input })
	return { out: r.stdout ?? "", err: r.stderr ?? "", code: r.status ?? 1 }
}

describe("global flags", () => {
	/**
	 * One realistic invocation per command. The test fails when a command is added
	 * without one, so the next command cannot ship rejecting `--dense` the way
	 * `learn` did ("Unknown flag: --dense" while --help listed it as global).
	 */
	const INVOCATIONS: Record<string, string[]> = {
		target: ["target", "ios"],
		preset: ["preset", "--check", "missing.json"],
		patch: ["patch", "--list"],
		sources: ["sources"],
		setup: ["setup", "--agent", "--dry-run"],
		manifest: ["manifest"],
		search: ["search", "button"],
		check: ["check", "src"],
		component: ["component", "Button"],
		pattern: ["pattern", "--list"],
		block: ["block", "--list"],
		layout: ["layout", "--list"],
		provider: ["provider", "--list"],
		token: ["token", "--list"],
		utility: ["utility", "--list"],
		docs: ["docs", "--list"],
		doctor: ["doctor"],
		grade: ["grade", "src"],
		learn: ["learn", "--search", "motion"],
		lint: ["lint", "src"],
		atlas: ["atlas", "--list"],
		prefer: ["prefer", "--list"],
		explore: ["explore", "--template"],
	}

	it("has an invocation for every command in the manifest", () => {
		const names = json(["manifest"]).data.commands.map((c: { name: string }) => c.name).sort()
		expect(Object.keys(INVOCATIONS).sort()).toEqual(names)
	})

	it("accepts every global flag on every command without changing its outcome", () => {
		const root = project()
		try {
			const extras = [["--dense"], ["--detail", "brief"], ["--json"], ["--json", "--dense"]]
			for (const args of Object.values(INVOCATIONS)) {
				const plain = runIn(root, args)
				for (const extra of extras) {
					const flagged = runIn(root, [...args, ...extra])
					const label = `sable ${[...args, ...extra].join(" ")}`
					expect(`${flagged.out}${flagged.err}`, label).not.toMatch(/Unknown flag|"type":"error","code":"ERR_BAD_FLAG"|ERR_BAD_FLAG:/)
					expect(flagged.code, `${label}\n${flagged.out}${flagged.err}`).toBe(plain.code)
				}
			}
		} finally {
			rmSync(root, { recursive: true, force: true })
		}
	}, 180_000)

	it("never takes the next word as the value of a switch", () => {
		// `--dense Button` used to parse as --dense=Button, leaving no component name.
		expect(run(["component", "--dense", "Button"]).out).toContain("Button")
		expect(json(["component", "--dense", "Button"]).data.name).toBe("Button")
	})

	it("still rejects a bad --detail value on a command that does not read it", () => {
		const err = JSON.parse(run(["manifest", "--detail", "everything", "--json"]).out)
		expect(err.code).toBe("ERR_BAD_FLAG")
	})

	it("re-emits a delegated command's JSON on one line under --dense", () => {
		const out = run(["learn", "--search", "motion", "--json", "--dense"]).out.trim()
		expect(out.split("\n")).toHaveLength(1)
		expect(JSON.parse(out).type).toBe("learn.list")
	})
})

describe("every public utility is retrievable", () => {
	/**
	 * The utility catalog is hand-written (src/utilities/utility-docs.ts) while the
	 * utilities live in styles.css, and `sable utility motion-icon-swap` once
	 * answered ERR_UNKNOWN_UTILITY for a recipe that ships. This asks the CLI for
	 * every `@utility` and `@custom-variant` styles.css declares, so a utility
	 * added without a doc fails here, not in an agent's session.
	 */
	const css = readFileSync(join(PKG_ROOT, "src", "styles.css"), "utf8")
	const declared = [
		...[...css.matchAll(/^[ \t]*@utility\s+([a-z][a-z0-9-]*(?:-\*)?)\s*\{/gm)].map((m) => m[1]),
		...[...css.matchAll(/^[ \t]*@custom-variant\s+([a-z][a-z0-9-]*)\s*[({]/gm)].map((m) => m[1]),
	]

	it("answers `sable utility <name>` for each, unless it is listed as internal", async () => {
		const { INTERNAL_UTILITIES } = await import("../utilities/utility-docs")
		const internal = new Set<string>(INTERNAL_UTILITIES)
		expect(declared.length).toBeGreaterThan(80)
		const missing = declared
			.filter((name) => !internal.has(name))
			.filter((name) => run(["utility", name.replace(/\*$/, "md"), "--json"]).code !== 0)
		expect(missing, "add a src/utilities/utility-docs.ts entry (or INTERNAL_UTILITIES with a reason)").toEqual([])
	}, 120_000)

	it("explains the motion recipes and the type tiers, not just their names", () => {
		const swap = json(["utility", "motion-icon-swap"]).data
		expect(swap.family).toBe("motion")
		expect(swap.intent).toMatch(/icon/i)
		expect(swap.example).toContain('className="motion-icon-swap"')
		const tier = json(["utility", "text-heading-1"]).data
		expect(tier.documentedIn).toBe("registry.json → tokens.typography")
		expect(tier.intent.length).toBeGreaterThan(0)
	})
})

describe("providers", () => {
	const NAMES = [
		"SableThemeProvider",
		"IconProvider",
		"MotionProvider",
		"ToastProvider",
		"TooltipProvider",
		"CodeHighlightProvider",
		"DensityProvider",
		"PresentationProvider",
	]

	it("lists every exported provider", () => {
		const listed = json(["provider", "--list"]).data.providers.map((p: { name: string }) => p.name)
		for (const name of NAMES) expect(listed, name).toContain(name)
	})

	it("answers `sable component <Provider>` with the provider instead of ERR_UNKNOWN_COMPONENT", () => {
		const { type, data } = json(["component", "SableThemeProvider"])
		expect(type).toBe("provider.detail")
		expect(data.import).toBe('import { SableThemeProvider } from "@sableui/react"')
		expect(data.props.map((p: { name: string }) => p.name)).toContain("defaultPreference")
		expect(data.examples[0].imports).toContain("SableThemeProvider")
	})

	it("serves props and examples for app-wide providers, and points owned ones at their component", () => {
		for (const name of ["SableThemeProvider", "IconProvider", "MotionProvider"]) {
			const { data } = json(["provider", name, "--detail", "full"])
			expect(data.required, name).toMatch(/^(Required|Optional)/)
			expect(data.placement, name).toBeTruthy()
			expect(data.props.length, name).toBeGreaterThan(0)
			expect(data.examples.length, name).toBeGreaterThan(0)
		}
		const toast = json(["provider", "ToastProvider"]).data
		expect(toast.partOf).toBe("Toast")
		expect(toast.contract).toBe("sable component Toast --props")
		expect(toast.examples.some((e: { code: string }) => e.code.includes("<ToastProvider"))).toBe(true)
	})

	it("is found by search and suggests a near match on a typo", () => {
		expect(json(["search", "MotionProvider"]).data.results[0].retrieve).toBe("sable provider MotionProvider")
		const err = JSON.parse(run(["provider", "IconProvidr", "--json"]).out)
		expect(err.code).toBe("ERR_UNKNOWN_PROVIDER")
		expect(err.suggestions.join(" ")).toContain("IconProvider")
	})
})

describe("package guides", () => {
	it("serves AGENTS.md, the file llms.txt sends agents to first, and the other package guides", () => {
		const cases = [
			["AGENTS", "AGENTS.md"],
			["agents", "AGENTS.md"],
			["AGENTS.md", "AGENTS.md"],
			["README", "README.md"],
			["CONTRIBUTING", "CONTRIBUTING.md"],
			["DESIGN", "DESIGN.md"],
		]
		for (const [slug, file] of cases) {
			const { type, data } = json(["docs", slug])
			expect(type, slug).toBe("docs.detail")
			expect(data.kind, slug).toBe("package")
			expect(data.content, slug).toBe(readFileSync(join(PKG_ROOT, file), "utf8"))
		}
		const slugs = json(["docs", "--list", "--kind", "package"]).data.docs.map((d: { slug: string }) => d.slug)
		expect(slugs).toContain("AGENTS")
	})

	it("lists the valid names when a doc is unknown", () => {
		const err = JSON.parse(run(["docs", "agentz", "--json"]).out)
		expect(err.code).toBe("ERR_UNKNOWN_DOC")
		const text = err.suggestions.join("\n")
		expect(text).toContain("sable docs AGENTS")
		expect(text).toContain("Package guides: AGENTS, README, CONTRIBUTING, DESIGN")
		expect(text).toContain("reviewing-a-design")
	})

	it("rejects an unknown --kind with the real kinds", () => {
		const err = JSON.parse(run(["docs", "--list", "--kind", "nope", "--json"]).out)
		expect(err.code).toBe("ERR_BAD_FLAG")
		expect(err.suggestions.join(" ")).toContain("--kind tasks")
	})
})

describe("sable check", () => {
	it("passes a wired, clean project and still lists the manual review", () => {
		const root = project()
		try {
			const r = runIn(root, ["check", "--json"])
			const { type, data } = JSON.parse(r.out)
			expect(type).toBe("check")
			expect(data.checks.map((c: { name: string }) => c.name)).toEqual(["doctor", "lint", "grade"])
			const summaries = JSON.stringify(data.checks.map((c: { name: string; summary: string }) => [c.name, c.summary]))
			expect(data.failed, summaries).toEqual([])
			expect(r.code).toBe(0)
			const steps = data.manualReview.map((m: { step: string }) => m.step).join(" ")
			expect(steps).toMatch(/design.*journey.*motion.*reduced motion.*reuse inventory.*learned/i)
			const text = runIn(root, ["check"]).out
			expect(text).toContain("✓ doctor, lint and grade pass")
			expect(text).toMatch(/1\. Review the rendered design/)
			expect(text).toMatch(/6\. Record what you learned/)
		} finally {
			rmSync(root, { recursive: true, force: true })
		}
	}, 60_000)

	it("fails with a non-zero exit and names each failing check", () => {
		const root = project('import { Button } from "@sableui/react"\nexport const App = () => <div className="bg-zinc-900"><Button>Go</Button></div>\n')
		try {
			const r = runIn(root, ["check", "src", "--json"])
			expect(r.code).toBe(1)
			const { data } = JSON.parse(r.out)
			expect(data.failed).toEqual(["doctor", "lint"])
			expect(data.checks[0].details.join(" ")).toContain("IconProvider")
			expect(data.checks[1].details.join(" ")).toContain("bg-zinc-900")
		} finally {
			rmSync(root, { recursive: true, force: true })
		}
	}, 60_000)

	it("notes, without failing, arrow keys handled by hand", () => {
		const app = CLEAN_APP.replace(
			/\n?$/,
			'\nexport const List = () => <ul onKeyDown={(e) => { if (e.key === "ArrowDown") e.preventDefault() }}><li>One</li></ul>\n',
		)
		const root = project(app)
		try {
			const { data } = JSON.parse(runIn(root, ["check", "--json"]).out)
			expect(data.failed).toEqual([])
			expect(data.inventory.surfaces).toMatchObject([{ file: "src/App.tsx", kind: "keyboard" }])
			expect(data.inventory.surfaces[0].consider).toContain("CommandMenu")
		} finally {
			rmSync(root, { recursive: true, force: true })
		}
	}, 60_000)

	it("lists app-owned surfaces for the reuse inventory without failing on them", () => {
		const app = CLEAN_APP.replace(/\n?$/, '\nexport const Note = () => <div className="rounded-lg border border-border p-4">Saved</div>\n')
		const root = project(app)
		try {
			const r = runIn(root, ["check", "--json"])
			const { data } = JSON.parse(r.out)
			expect(data.failed).toEqual([])
			expect(data.inventory.surfaces).toMatchObject([{ file: "src/App.tsx", tag: "div", kind: "surface" }])
			const text = runIn(root, ["check"]).out
			expect(text).toMatch(/App-owned surfaces, for the reuse inventory — 1\. Notes, not failures: .*keep yours\.\n\s+src\/App\.tsx:\d+ {2}<div> surface \(rounded-lg border border-border p-4\) → Sable has Card/)
			// After the result, before the manual steps that consume it.
			expect(text.indexOf("App-owned surfaces")).toBeGreaterThan(text.indexOf("[sable check] ✓"))
			expect(text.indexOf("App-owned surfaces")).toBeLessThan(text.indexOf("Write the reuse inventory"))
		} finally {
			rmSync(root, { recursive: true, force: true })
		}
	}, 60_000)

	it("reports a missing path as a failed check rather than crashing", () => {
		const root = project()
		try {
			const r = runIn(root, ["check", "app", "--json"])
			expect(r.code).toBe(1)
			expect(JSON.parse(r.out).data.failed).toEqual(["lint", "grade"])
		} finally {
			rmSync(root, { recursive: true, force: true })
		}
	}, 60_000)

	it("in Stop-hook mode, blocks with exit 2 and the failures on stderr, once", () => {
		const root = project('export const App = () => <div className="bg-zinc-900" />\n')
		try {
			const first = runIn(root, ["check", "--stop-hook"], JSON.stringify({ hook_event_name: "Stop", stop_hook_active: false }))
			expect(first.code).toBe(2)
			expect(first.err).toContain("bg-zinc-900")
			// Already continuing because of this hook: report, but let the agent stop.
			const again = runIn(root, ["check", "--stop-hook"], JSON.stringify({ hook_event_name: "Stop", stop_hook_active: true }))
			expect(again.code).toBe(0)
		} finally {
			rmSync(root, { recursive: true, force: true })
		}
		const clean = project()
		try {
			expect(runIn(clean, ["check", "--stop-hook"], "{}").code).toBe(0)
		} finally {
			rmSync(clean, { recursive: true, force: true })
		}
	}, 60_000)

	it("in Stop-hook mode, finds the project from CLAUDE_PROJECT_DIR and --root, not the shell's directory", () => {
		// The hook command carries no `cd` (PowerShell 5.1 has no `&&`), so it can
		// start anywhere; check must still judge the right project.
		const repo = mkdtempSync(join(tmpdir(), "sable-cli-repo-"))
		const app = project('export const App = () => <div className="bg-zinc-900" />\n')
		const elsewhere = mkdtempSync(join(tmpdir(), "sable-cli-elsewhere-"))
		try {
			const env = { ...process.env, CLAUDE_PROJECT_DIR: repo }
			const rootArg = relative(repo, app)
			const r = spawnSync(process.execPath, [BIN, "check", "--stop-hook", "--root", rootArg], { cwd: elsewhere, env, encoding: "utf8", input: "{}" })
			expect(r.status).toBe(2)
			expect(r.stderr).toContain("bg-zinc-900")
			const direct = spawnSync(process.execPath, [BIN, "check", "--stop-hook"], { cwd: elsewhere, env: { ...process.env, CLAUDE_PROJECT_DIR: app }, encoding: "utf8", input: "{}" })
			expect(direct.status).toBe(2)
		} finally {
			for (const dir of [repo, app, elsewhere]) rmSync(dir, { recursive: true, force: true })
		}
	}, 60_000)

	it("is in the manifest and --help", () => {
		expect(json(["manifest"]).data.commands.map((c: { name: string }) => c.name)).toContain("check")
		expect(run(["check", "--help"]).out).toContain("--stop-hook")
	})
})

describe("sable setup", () => {
	it("prints the Claude Code Stop hook without writing settings, and writes it with --hook", () => {
		const root = project()
		try {
			const printed = JSON.parse(runIn(root, ["setup", "--agent", "--target", "claude", "--json"]).out).data
			expect(printed.stopHook.installed).toBe(false)
			expect(printed.stopHook.settings.hooks.Stop[0].hooks[0].command).toContain("sable check --stop-hook")
			expect(existsSync(join(root, ".claude", "settings.json"))).toBe(false)
			expect(runIn(root, ["setup", "--agent", "--target", "claude", "--update", "--hook"]).code).toBe(0)
			const settings = JSON.parse(readFileSync(join(root, ".claude", "settings.json"), "utf8"))
			expect(settings.hooks.Stop[0].hooks[0].command).toContain("sable check --stop-hook")
			expect(runIn(root, ["setup", "--agent", "--target", "codex", "--hook"]).code).toBe(1)
		} finally {
			rmSync(root, { recursive: true, force: true })
		}
	}, 60_000)
})
