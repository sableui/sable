import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterAll, describe, expect, it } from "vitest"

const PKG_ROOT = resolve(__dirname, "..", "..")
const BIN = join(PKG_ROOT, "bin", "sable-lint.mjs")
const registry = JSON.parse(readFileSync(join(PKG_ROOT, "registry.json"), "utf8"))
const contractSrc = readFileSync(
	join(PKG_ROOT, "src", "themes", "_contract.ts"),
	"utf8",
)

/** The same reader the build scripts use, so all three see identical arrays. */
function readArray(name: string): string[] {
	const start = contractSrc.indexOf(`${name} = [`)
	const body = contractSrc
		.slice(start, contractSrc.indexOf("]", start))
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/(^|[^:])\/\/[^\n]*/g, "$1")
	return [...body.matchAll(/"([^"]+)"/g)].map((m) => m[1])
}

/**
 * `sable-lint` is the bin consumers run against their own app. It cannot read
 * `_contract.ts` — that file isn't published — so it reconstructs the token
 * vocabulary from `registry.json`, which is. These tests pin that reconstruction.
 *
 * The failure this guards against is silent and nasty: if the registry's shape
 * drifted, the consumer linter would validate against a vocabulary that is merely
 * *plausible* and would either miss real typos or flag correct tokens, in someone
 * else's codebase, with no signal here.
 */
describe("consumer lint contract", () => {
	it("reconstructs SEMANTIC_TOKENS exactly from registry.json", () => {
		const fromRegistry = registry.tokens.semantic.map((t: { name: string }) => t.name)
		expect(new Set(fromRegistry)).toEqual(new Set(readArray("SEMANTIC_TOKENS")))
	})

	it("reconstructs MOTION_TOKENS exactly from registry.json", () => {
		// The registry stores durations/easings as bare names; the contract stores
		// full token names. The bin reassembles them, and this asserts the assembly
		// rule is right rather than merely reasonable-looking.
		const m = registry.tokens.motion
		const fromRegistry = [
			...m.durations.map((d: string) => `motion-duration-${d}`),
			...m.easings.map((e: string) => `motion-ease-${e}`),
			m.scale,
		]
		expect(new Set(fromRegistry)).toEqual(new Set(readArray("MOTION_TOKENS")))
	})
})

const tmp = mkdtempSync(join(tmpdir(), "sable-lint-"))
afterAll(() => rmSync(tmp, { recursive: true, force: true }))

function lint(source: string, args: string[] = []) {
	writeFileSync(join(tmp, "sample.tsx"), source)
	try {
		const out = execFileSync(process.execPath, [BIN, tmp, ...args], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		})
		return { code: 0, out }
	} catch (e) {
		const err = e as { status: number; stdout: string; stderr: string }
		return { code: err.status, out: err.stdout + err.stderr }
	}
}

describe("sable-lint bin", () => {
	it("keeps semantic focus ink at its tested opacity", () => {
		const faded = lint('export const A = () => <button className="motion-interactive focus-visible:ring-2 focus-visible:ring-ring/40">Open</button>')
		expect(faded.code).toBe(1)
		expect(faded.out).toContain("faded-focus-ring")
		const full = lint('export const A = () => <button className="motion-interactive focus-visible:ring-2 focus-visible:ring-ring">Open</button>')
		expect(full.code).toBe(0)
	})

	it("lints a single file path, not only a folder", () => {
		// `sable lint src/app.tsx` threw ENOTDIR: the walker read every target as a
		// directory. A named file is linted as given.
		// Its own folder: the other tests lint the whole shared temp folder.
		const own = mkdtempSync(join(tmpdir(), "sable-lint-file-"))
		writeFileSync(join(own, "one.tsx"), `export const A = () => <div className="border-lime-500" />`)
		let out = ""
		let code = 0
		try {
			out = execFileSync(process.execPath, [BIN, join(own, "one.tsx")], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
		} catch (e) {
			const err = e as { status: number; stdout: string; stderr: string }
			code = err.status
			out = err.stdout + err.stderr
		}
		expect(out).not.toContain("ENOTDIR")
		expect(code).toBe(1)
		expect(out).toContain("palette-ref")
		rmSync(own, { recursive: true, force: true })
	})

	it("catches palette steps that do not follow the theme", () => {
		// `border-orange-500` shipped in a converted app for weeks, painting stock
		// Tailwind orange under every theme. Orange is generated from the theme now,
		// so it is fine; a theme's internal ramp and the families Sable switched off
		// are what still paint the wrong thing (or nothing).
		const r = lint(`export const A = () => <div className="border-lime-500 text-(--purple-heart-700)" />`)
		expect(r.code).toBe(1)
		expect(r.out).toContain("palette-ref")
		expect(r.out).toContain("border-lime-500")
		expect(r.out).toContain("--purple-heart-700")
	})

	it("lets an app use the generated palette", () => {
		const r = lint(`export const A = () => <div className="border-orange-500 bg-blue-100 text-blue-800 bg-tone-1-100 text-(--neutral-700)" />`)
		expect(r.out).not.toContain("palette-ref")
	})

	it("passes clean code that uses semantic tokens", () => {
		const r = lint(
			`export const A = () => <div className="bg-card text-muted-foreground rounded-md" />`,
		)
		expect(r.code).toBe(0)
		expect(r.out).toContain("clean")
	})

	it("does not police the package's internal rules on consumer code", () => {
		// `self-import` is scope: "package". Importing @sableui/react is precisely
		// what a consumer is supposed to do — flagging it would make the bin useless
		// on the first file of every real app.
		const r = lint(`import { Button } from "@sableui/react"\nexport const A = () => <Button />`)
		expect(r.code).toBe(0)
	})

	it("honours a reasoned disable, and rejects a reasonless one", () => {
		const withReason = lint(
			`// design-lint-disable-next-line palette-ref -- vendor logo spec\nexport const A = () => <div className="bg-orange-500" />`,
		)
		expect(withReason.code).toBe(0)

		const without = lint(
			`// design-lint-disable-next-line palette-ref\nexport const A = () => <div className="bg-orange-500" />`,
		)
		expect(without.code).toBe(1)
		expect(without.out).toContain("directive-reason")
	})

	it("catches a raw z-index that joins the global layer order", () => {
		// The rule DESIGN.md stated from 0.17.0 and nothing checked until 0.44.0 —
		// by which point fourteen of Sable's OWN portaled surfaces wrote `z-50`
		// while --z-overlay sat declared and used by nothing.
		const bare = lint(`export const A = () => <div className="fixed z-50" />`)
		expect(bare.code).toBe(1)
		expect(bare.out).toContain("raw-z-index")
		expect(bare.out).toContain("z-50")

		const arbitrary = lint(`export const A = () => <div className="fixed z-[9999]" />`)
		expect(arbitrary.code).toBe(1)
		expect(arbitrary.out).toContain("raw-z-index")
	})

	it("leaves local stacking alone — the scale starts at 30 for that reason", () => {
		// z-0/z-10/z-20 order things inside one component's own box (an arrow over
		// its slide). Flagging those would make the rule noise, and noise is how a
		// contract rule gets disabled wholesale.
		const r = lint(
			`export const A = () => <div className="relative z-10"><span className="z-0" /></div>`,
		)
		expect(r.code).toBe(0)
	})

	it("accepts the named layer steps", () => {
		const r = lint(
			`export const A = () => <div className="fixed z-(--z-overlay)"><i className="z-(--z-toast)" /></div>`,
		)
		expect(r.code).toBe(0)
	})

	it("skips paths under --ignore", () => {
		const src = `export const P = ["#8C9B82"]`
		expect(lint(src).code).toBe(1)
		expect(lint(src, ["--ignore", "**/sample.tsx"]).code).toBe(0)
	})

	it("sees .html — the file the tool was blind to", () => {
		// Reported from a real conversion: `bg-zinc-950 text-zinc-100` sat on <body>
		// in index.html while sable-lint said "✓ 29 files clean — the contract
		// holds." The walker only yielded .ts/.tsx/.js/.jsx. That gap landed hardest
		// on converting-an-app.md, which is largely about migrating an app's CSS.
		writeFileSync(join(tmp, "index.html"), `<body class="bg-zinc-950 text-zinc-100">x</body>`)
		const r = lint(`export const A = () => null`)
		rmSync(join(tmp, "index.html"))
		expect(r.code).toBe(1)
		expect(r.out).toContain("index.html")
		expect(r.out).toContain("bg-zinc-950")
	})

	it("lints .css but exempts custom-property DECLARATIONS, not references", () => {
		// The distinction that makes the rule usable on a stylesheet at all: a
		// consumer's own theme file is where colour literals legitimately live, so
		// `--brand-500: oklch(…)` is authoring. Borrowing a palette step by
		// reference, or a raw literal in an ordinary rule, is still a violation.
		writeFileSync(
			join(tmp, "theme.css"),
			`:root { --brand-500: oklch(0.7 0.2 250); }\n.card { color: #ffffff; border-color: var(--zinc-700); }`,
		)
		const r = lint(`export const A = () => null`)
		rmSync(join(tmp, "theme.css"))
		expect(r.out).not.toContain("--brand-500")
		expect(r.out).toContain("--zinc-700")
		expect(r.out).toContain("#ffffff")
	})

	/* ── static-interactive: the one PRESCRIPTIVE rule. ───────────────────────
	 * Every other motion rule fires on motion that is present and wrong, so a
	 * component that simply snaps between states cleared the whole contract —
	 * which is exactly what an agent writes, because an agent writes what is
	 * checked. These pin the boundary: it has to fire on the real case and stay
	 * quiet everywhere a fix would be wrong, or it gets disabled wholesale. */
	it("catches an element styled for pointer states with no motion", () => {
		const r = lint(
			`export const A = () => <div className="bg-card hover:bg-accent" />`,
		)
		expect(r.code).toBe(1)
		expect(r.out).toContain("static-interactive")
	})

	it("passes once the recipe is there", () => {
		const r = lint(
			`export const A = () => <div className="text-muted-foreground motion-interactive hover:text-foreground" />`,
		)
		expect(r.code).toBe(0)
	})

	it("sees a hover state many lines below the tag it belongs to", () => {
		// The reason this rule reads whole files instead of lines: a real JSX tag
		// spans a dozen attributes, and the class string that says "I react to a
		// pointer" is never on the same line as the tag name.
		const r = lint(
			[
				`export const A = () => (`,
				`  <button`,
				`    type="button"`,
				`    aria-label="Close"`,
				`    onClick={() => {}}`,
				`    className="rounded-md p-2 hover:bg-accent"`,
				`  />`,
				`)`,
			].join("\n"),
		)
		expect(r.code).toBe(1)
		expect(r.out).toContain("static-interactive")
	})

	it("reads a media-query variant as a media query, not a hover state", () => {
		// `hover:none` inside the brackets is a device capability; nothing here
		// reacts to a pointer, so there is no state change for motion to carry.
		expect(lint(`export const A = () => <div className="opacity-0 [@media(hover:none)]:opacity-100" />`).code).toBe(0)
		expect(lint(`export const A = () => <div className="[@media(hover:hover)]:underline" />`).code).toBe(0)
		// …while the group/peer forms of a real pointer state still count.
		const r = lint(`export const A = () => <span className="opacity-0 group-hover/row:opacity-100" />`)
		expect(r.code).toBe(1)
		expect(r.out).toContain("static-interactive")
	})

	it("points a display-only hover at an opacity swap, not motion-interactive", () => {
		// The e2e case: a row's play icon hidden on hover-capable devices. Fair to
		// flag, but the generic fix (motion-interactive) cannot animate display.
		const r = lint(
			`export const A = () => <span className="[@media(hover:hover)]:group-hover/row:hidden" />`,
		)
		expect(r.code).toBe(1)
		expect(r.out).toContain("static-interactive")
		expect(r.out).toContain("opacity-0 group-hover:opacity-100")
		// A colour change still gets the ordinary recipe advice.
		expect(lint(`export const A = () => <div className="hover:text-foreground" />`).out).not.toContain("opacity-0 group-hover")
	})

	it("points a hand-rolled hover reveal at reveal-on-hover, and accepts the utility", () => {
		// The Undertow e2e build wrote `[@media(hover:hover)]:opacity-0
		// group-hover:opacity-100` twice. motion-interactive would have smoothed it
		// and left the action invisible on every phone; the utility is right on both.
		const r = lint(`export const A = () => <span className="opacity-0 group-hover:opacity-100" />`)
		expect(r.code).toBe(1)
		expect(r.out).toContain("reveal-on-hover")
		// It carries motion-interactive's transition list, so it counts as a recipe.
		expect(lint(`export const A = () => <span className="reveal-on-hover hover:text-foreground" />`).code).toBe(0)
		expect(lint(`export const A = () => <div className="group"><span className="reveal-on-hover" /></div>`).code).toBe(0)
	})

	it("leaves Sable components alone — they bring their own motion", () => {
		// Flagging <Button className="hover:…"> would teach people to bolt a second
		// recipe onto a component that already has one, and two transitions fighting
		// over the same property is worse than the snap.
		const r = lint(
			`export const A = () => <Button className="hover:text-foreground">x</Button>`,
		)
		expect(r.code).toBe(0)
	})

	it("flags a state painted with a fixed surface, and points at the recipe", () => {
		const r = lint(`export const A = () => <div className="motion-interactive hover:bg-muted" />`)
		expect(r.code).toBe(1)
		expect(r.out).toContain("surface-hover")
		expect(r.out).toContain("sable-surface-interactive")
	})

	it("accepts the surface-relative recipe and an opacity step on the same surface", () => {
		expect(lint(`export const A = () => <div className="sable-surface-interactive motion-interactive" />`).code).toBe(0)
		expect(lint(`export const A = () => <div className="bg-popover/90 motion-interactive hover:bg-popover" />`).code).toBe(0)
	})

	it("does not double-report with transition-colors", () => {
		// Same element, same fix. Reporting both just makes the output look like the
		// rule set is nagging.
		const r = lint(
			`export const A = () => <div className="transition-colors hover:bg-accent" />`,
		)
		expect(r.out).toContain("transition-colors")
		expect(r.out).not.toContain("static-interactive")
	})

	it("honours a reasoned disable on the tag's own line", () => {
		const r = lint(
			`// design-lint-disable-next-line static-interactive -- text-decoration is discrete\nexport const A = () => <a className="hover:underline" />`,
		)
		expect(r.code).toBe(0)
	})

	it("does not flag an anti-pattern that a comment merely NAMES", () => {
		// The recurring failure: a codebase that fixed something properly leaves a
		// comment saying so, and the comment names the thing it removed. Sable's own
		// doc comment describing the transition-colors rule tripped that rule, and a
		// consuming app's note that a stray z-[60] had been measured and deleted was
		// reported as a live raw-z-index. In both the linter flagged the evidence
		// that the work was done — which is how a team decides the tool cries wolf.
		const r = lint(
			[
				"/* There was a `z-[60]` here and it never did anything — measured",
				"   under both themes before deleting it. Also dropped the bare",
				"   `transition-colors` in favour of the motion-interactive recipe,",
				"   and the `animate-pulse` that --motion-scale could not freeze. */",
				'export const A = () => <div className="fixed z-(--z-toast)" />',
			].join("\n"),
		)
		expect(r.code).toBe(0)
	})

	it("still flags the same patterns in real class strings", () => {
		// The other half of the pair: opting these rules out of comments must not
		// opt them out of code.
		const r = lint(`export const A = () => <div className="fixed z-50 transition-colors" />`)
		expect(r.code).toBe(1)
		expect(r.out).toContain("raw-z-index")
		expect(r.out).toContain("transition-colors")
	})

	it("validates tokens against the installed contract, not a guess", () => {
		const r = lint(`export const A = () => <div className="bg-tone-notareal" />`)
		expect(r.code).toBe(1)
		expect(r.out).toContain("unknown-token")
	})

	it("knows the derived colours, a status colour's mark among them", () => {
		const r = lint(`export const A = () => <div className="bg-tone-warning-mark/15 bg-tone-1-mark" />`)
		expect(r.out).not.toContain("unknown-token")
	})

	/* ── native-ui-import: iOS screens are Sable; Konsta is chrome only. ───── */
	it("catches a direct Konsta import in an iOS prototype", () => {
		for (const src of [
			`import { Toggle, ListInput } from "konsta/react"\nexport const A = () => <Toggle />`,
			`import { App } from 'konsta'\nexport const A = () => <App />`,
		]) {
			const r = lint(src)
			expect(r.code, src).toBe(1)
			expect(r.out, src).toContain("native-ui-import")
		}
	})

	it("allows the adapter's chrome", () => {
		const r = lint(`import { NativeApp, IosPage } from "@sableui/react/ios"\nexport const A = () => <NativeApp><IosPage /></NativeApp>`)
		expect(r.out).not.toContain("native-ui-import")
	})

	/* ── shadcn-leftover: a migration is done when the old stack is gone. ──── */
	it("catches leftover shadcn and Radix imports and asChild", () => {
		for (const src of [
			`import * as Dialog from "@radix-ui/react-dialog"\nexport const A = () => <Dialog.Root />`,
			`import { Button } from "@/components/ui/button"\nexport const A = () => <Button />`,
			`import { Check } from "lucide-react"\nexport const A = () => <Check />`,
			`import { toast } from "sonner"\nexport const A = () => null`,
			`import { Drawer } from "vaul"\nexport const A = () => <Drawer.Root />`,
			`import { DialogTrigger, Button } from "@sableui/react"\nexport const A = () => <DialogTrigger asChild><Button>Edit</Button></DialogTrigger>`,
		]) {
			const r = lint(src)
			expect(r.code, src).toBe(1)
			expect(r.out, src).toContain("shadcn-leftover")
		}
	})

	it("does not flag render, prose about asChild, or Sable imports", () => {
		const r = lint(
			`import { DialogTrigger, Button } from "@sableui/react"\n` +
				`// shadcn wrote <DialogTrigger asChild>; Sable uses render.\n` +
				`export const A = () => <DialogTrigger render={<Button />}>Edit</DialogTrigger>\n` +
				`export const note = "replace asChild with render"`,
		)
		expect(r.out).not.toContain("shadcn-leftover")
	})

	/* ── hand-rolled-control: use the component Sable ships. ─────────────────
	 * Sable's own Customize panel was a row of role="radio" buttons with no
	 * arrow keys, a native range and a native colour input, and nothing could
	 * say so. These pin what it catches and what it must leave alone. */
	it("catches a hand-built radio group and names the component", () => {
		const r = lint(
			`export const A = () => <div role="radiogroup"><button role="radio" aria-checked /></div>`,
		)
		expect(r.code).toBe(1)
		expect(r.out).toContain("hand-rolled-control")
		expect(r.out).toContain("RadioGroup")
	})

	it("catches native range, colour and select controls", () => {
		for (const src of [
			`export const A = () => <input type="range" />`,
			`export const A = () => <input type="color" />`,
			`export const A = () => <select><option /></select>`,
		]) {
			const r = lint(src)
			expect(r.out, src).toContain("hand-rolled-control")
		}
	})

	it("leaves Sable components and plain inputs alone", () => {
		const r = lint(
			`export const A = () => <><Radio role="radio" /><input type="text" /><Slider /></>`,
		)
		expect(r.out).not.toContain("hand-rolled-control")
	})

	it("accepts the escape hatch with a reason", () => {
		const r = lint(
			`// design-lint-disable-next-line hand-rolled-control -- 2D pad, no Sable equivalent
export const A = () => <div role="slider" />`,
		)
		expect(r.out).not.toContain("hand-rolled-control")
	})

	/* ── floating-surface: a floating surface is popover, not the page. ────
	 * Sable's Customize inspector floated over the canvas on bg-background,
	 * which sits BELOW the cards it hovered over in every dark mode. */
	it("catches a floating surface painted with the page ground", () => {
		const r = lint(
			`export const A = () => <aside className="fixed right-4 rounded-md bg-background shadow-lg ring-1 ring-border" />`,
		)
		expect(r.code).toBe(1)
		expect(r.out).toContain("floating-surface")
	})

	it("passes a floating popover surface and a raised sticky header", () => {
		const r = lint(
			`export const A = () => <><aside className="fixed bg-popover border border-border-floating shadow-lg" /><header className="sticky top-0 bg-background shadow-sm" /></>`,
		)
		expect(r.out).not.toContain("floating-surface")
	})

	it("catches a floating surface on bg-card, and the full border on anything floating", () => {
		// Dialog, Sheet and Toast shipped on bg-card with border-border.
		const fill = lint(`export const A = () => <div className="fixed rounded-lg bg-card p-6 shadow-lg" />`)
		expect(fill.out).toContain("bg-card + floating shadow")
		const edge = lint(`export const A = () => <div className="rounded-md border border-border bg-popover shadow-md" />`)
		expect(edge.out).toContain("border-border + floating shadow")
		const ring = lint(`export const A = () => <aside className="bg-popover ring-1 ring-border shadow-xl" />`)
		expect(ring.out).toContain("ring-border + floating shadow")
	})

	/* ── lookalike-control: a raw element in a component's clothes. ──────────
	 * The docs header was a <button> wearing the search field's shell, and
	 * every styling rule passed it because every class was a semantic token. */
	it("catches a raw element dressed as a field or a button", () => {
		const field = lint(
			`export const A = () => <button className="flex h-8 rounded-sm border border-input bg-card px-2.5 motion-interactive">Search</button>`,
		)
		expect(field.out).toContain("lookalike-control")
		expect(field.out).toContain("field shell")
		// The shell's current outline token is caught the same way.
		const current = lint(`export const A = () => <div className="flex h-8 rounded-sm border border-field-border bg-field px-2.5">Search</div>`)
		expect(current.out).toContain("field shell (border-field-border)")
		const fill = lint(`export const A = () => <a href="/x" className="rounded-full bg-primary px-4 text-primary-foreground">Go</a>`)
		expect(fill.out).toContain("use Button")
		const sized = lint(`export const A = () => <button className="h-(--control-md) rounded-sm px-3">Save</button>`)
		expect(sized.out).toContain("sized as a control")
	})

	it("leaves components, text links and native fields to their own rules", () => {
		const r = lint(
			`export const A = () => <><Button className="bg-secondary">Ok</Button><a href="/x" className="text-foreground underline">Read</a><Input className="border-input" /></>`,
		)
		expect(r.out).not.toContain("lookalike-control")
	})

	/* ── Assembly lookalikes: grid, card, avatar, media frame. ─────────────
	 * An e2e build assembled all four from utilities and tokens; they passed
	 * lint, a 100/100 grade and the visual review, and only a source audit
	 * found them. Each rule is pinned on the true positive AND on every
	 * near-miss it must leave alone, because a lookalike rule that fires on a
	 * form layout or a text link teaches people to disable it. */
	describe("lookalike-grid", () => {
		it("catches an auto-fill track and names minItemWidth", () => {
			const r = lint(
				`export const A = ({ items }) => <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">{items.map((i) => <Card key={i} />)}</div>`,
			)
			expect(r.code).toBe(1)
			expect(r.out).toContain('lookalike-grid')
			expect(r.out).toContain('<Grid minItemWidth="10rem" gap={2}>')
		})

		it("catches responsive columns over mapped items and spells the cols map", () => {
			const r = lint(
				`export const A = ({ artists }) => (\n\t<div className="grid grid-cols-2 md:grid-cols-4 gap-3">\n\t\t{artists.map((a) => (\n\t\t\t<a key={a.id} href={a.href}>{a.name}</a>\n\t\t))}\n\t</div>\n)`,
			)
			expect(r.out).toContain("raw grid over mapped items → <Grid cols={{ base: 2, md: 4 }} gap={1.5}>")
		})

		it("catches three or more repeated components, one column below the breakpoint", () => {
			const r = lint(
				`export const A = () => <div className="grid gap-6 md:grid-cols-2"><Chart a /><Chart b /><Chart c /></div>`,
			)
			expect(r.out).toContain("raw grid over repeated items → <Grid cols={{ base: 1, md: 2 }} gap={3}>")
		})

		it.each([
			["a form layout (fields, no mapping)", `<div className="grid grid-cols-2 gap-4"><Field /><Field /><Field /><Field /></div>`],
			["a grid with no columns", `<div className="grid gap-4">{items.map((i) => <Card key={i} />)}</div>`],
			["a non-uniform track", `<div className="grid grid-cols-[auto_1fr] gap-2">{rows.map((r) => <Row key={r} />)}</div>`],
			["a single column", `<div className="grid grid-cols-1 gap-2">{rows.map((r) => <Row key={r} />)}</div>`],
			["a container-query column change", `<div className="grid grid-cols-2 @md:grid-cols-4">{rows.map((r) => <Row key={r} />)}</div>`],
			["a list element (Grid renders a div)", `<ul className="grid grid-cols-3 gap-4">{items.map((i) => <li key={i} />)}</ul>`],
			["a definition list on an auto-fill track", `<dl className="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))]">{x}</dl>`],
			["a widget role", `<div role="img" className="grid grid-cols-5 gap-2">{steps.map((s) => <span key={s} />)}</div>`],
			["children placed by span", `<div className="grid grid-cols-1 md:grid-cols-12"><Cell className="md:col-span-3" /><Cell className="md:col-span-6" /><Cell className="md:col-span-3" /></div>`],
			["a map nested in one child", `<div className="grid gap-4 md:grid-cols-2"><Panel />{meta.a11y ? <Panel>{meta.a11y.map((a) => <li key={a} />)}</Panel> : null}</div>`],
			["repeated bare wrappers", `<div className="grid gap-4 md:grid-cols-3"><div /><div /><div /></div>`],
			["Sable's Grid", `<Grid cols={{ base: 2, md: 4 }}>{items.map((i) => <Card key={i} />)}</Grid>`],
			["a code sample in a template literal", "<CodeBlock code={`<div className=\"grid grid-cols-2 md:grid-cols-4\">{items.map((i) => <Card />)}</div>`} />"],
		])("leaves %s alone", (_, jsx) => {
			expect(lint(`export const A = ({ items, rows, steps, meta, x }) => ${jsx}`).out).not.toContain("lookalike-grid")
		})

		it("honours a reasoned disable", () => {
			const r = lint(
				`export const A = ({ items }) => (\n\t// design-lint-disable-next-line lookalike-grid -- a 7-day calendar grid with its own keyboard model\n\t<div className="grid grid-cols-7">{items.map((i) => <Day key={i} />)}</div>\n)`,
			)
			expect(r.out).not.toContain("lookalike-grid")
		})
	})

	describe("lookalike-card", () => {
		it("catches a link, a router Link and a button dressed as a card", () => {
			const a = lint(`export const A = () => <a href="/x" className="block rounded-lg border bg-card p-4 hover:border-border-strong motion-interactive">Album</a>`)
			expect(a.out).toContain("lookalike-card")
			expect(a.out).toContain("<a> dressed as a card (rounded-lg border bg-card) → <Card render={<a href=… />}>")
			const link = lint(`import { Link } from "react-router"\nexport const A = () => <Link to="/x" className="rounded-xl border p-5">Album</Link>`)
			expect(link.out).toContain("<Card render={<Link to=… />}>")
			const button = lint(`export const A = () => <button type="button" className="rounded-md bg-popover p-3 text-start">Pick</button>`)
			expect(button.out).toContain("<Card render={<button />}>")
		})

		it.each([
			["a text link", `<a href="/x" className="text-foreground underline">Read</a>`],
			["a nav row (radius and padding, no surface)", `<a href="/x" className="flex items-center rounded-md px-2 py-1.5 sable-surface-interactive motion-interactive">Home</a>`],
			["a pill", `<a href="/x" className="rounded-full border px-3 py-1">Tag</a>`],
			["a chip-sized link (padding under a card's)", `<a href="/x" className="rounded-md border px-2 py-1">file.pdf</a>`],
			["a button fill (lookalike-control's)", `<a href="/x" className="rounded-md border bg-primary p-3">Go</a>`],
			["the element given to Card's render prop", `<Card render={<a href="/x" className="rounded-lg border bg-card p-4" />}>Album</Card>`],
			["a render function's element", `<Radio render={({ className, ...props }) => <button {...props} className="rounded-md border p-4" />} />`],
		])("leaves %s alone", (_, jsx) => {
			expect(lint(`export const A = () => ${jsx}`).out).not.toContain("lookalike-card")
		})

		it("leaves a Link the file takes from Sable", () => {
			const r = lint(`import { Link } from "@sableui/react"\nexport const A = () => <Link href="/x" className="rounded-lg border p-4">x</Link>`)
			expect(r.out).not.toContain("lookalike-card")
		})
	})

	describe("form-required-error", () => {
		it("catches a required Field with an error inside a Form that validates for you", () => {
			const r = lint(`export const A = ({ e }) => <Form onSubmit={save}><Field label="Subject" required error={e.subject}><Input /></Field></Form>`)
			expect(r.out).toContain("form-required-error")
			expect(r.out).toContain("<Form noValidate> or messages={{ valueMissing }}")
		})

		it.each([
			["a Form with noValidate", `<Form noValidate onSubmit={save}><Field label="Subject" required error={e.subject}><Input /></Field></Form>`],
			["a required Field without error", `<Form onSubmit={save}><Field label="Subject" required messages={{ valueMissing: "Enter one." }}><Input /></Field></Form>`],
			["required={false}", `<Form onSubmit={save}><Field label="Subject" required={false} error={e.subject}><Input /></Field></Form>`],
			["a Field outside any Form", `<form><Field label="Subject" required error={e.subject}><Input /></Field></form>`],
		])("leaves %s alone", (_, jsx) => {
			expect(lint(`export const A = ({ e }) => ${jsx}`).out).not.toContain("form-required-error")
		})
	})

	describe("lookalike-avatar", () => {
		it("catches a round fixed-size box holding art, an image or initials, and a round image", () => {
			const art = lint(`export const A = ({ a }) => <div className="size-16 shrink-0 overflow-hidden rounded-full"><GradientArt seed={a.name} /></div>`)
			expect(art.out).toContain('<div> rounded-full size-16 holding GradientArt → <Avatar variant="art" fallback="…">')
			const img = lint(`export const A = ({ a }) => <span className="h-10 w-10 overflow-hidden rounded-full"><img src={a.src} alt="" /></span>`)
			expect(img.out).toContain("holding an image → <Avatar src alt fallback>")
			const initials = lint(`export const A = () => <div className="grid size-12 place-items-center rounded-full bg-muted">AM</div>`)
			expect(initials.out).toContain("holding initials")
			const computed = lint(`export const A = ({ a }) => <div className="size-[52px] rounded-full bg-muted">{a.name.charAt(0)}</div>`)
			expect(computed.out).toContain("lookalike-avatar")
			const self = lint(`export const A = ({ a }) => <img src={a.src} alt={a.name} className="size-8 rounded-full object-cover" />`)
			expect(self.out).toContain("<img> rounded-full size-8 holding an image")
		})

		it.each([
			["a status dot", `<span className="size-2 rounded-full bg-success" />`],
			["an icon in a circle", `<div className="grid size-8 place-items-center rounded-full bg-muted"><Icon name="music" /></div>`],
			["a round box with no fixed size", `<span className="rounded-full bg-muted px-3"><img src="/a.png" alt="" /></span>`],
			["a full-size circle", `<div className="size-full overflow-hidden rounded-full"><img src="/a.png" alt="" /></div>`],
			["AvatarRoot", `<AvatarRoot className="size-16"><AvatarImage src="/a.png" /></AvatarRoot>`],
			["a word in a circle", `<div className="size-12 rounded-full">Online</div>`],
		])("leaves %s alone", (_, jsx) => {
			expect(lint(`export const A = () => ${jsx}`).out).not.toContain("lookalike-avatar")
		})
	})

	describe("agent-initials", () => {
		it.each([
			[`<Avatar size="sm" fallback="AI" />`],
			[`<Avatar fallback={"Bot"} alt="Assistant" />`],
			[`<Avatar variant="art" fallback='GPT' />`],
		])("catches an agent drawn as initials: %s", (jsx) => {
			expect(lint(`export const A = () => ${jsx}`).out).toContain("agent-initials")
		})

		it.each([
			["a person's initials", `<Avatar fallback="AM" alt="Alex Morgan" />`],
			["initials that start with AI", `<Avatar fallback="AIX" />`],
			["the agent avatar", `<AgentAvatar size="sm" />`],
		])("leaves %s alone", (_, jsx) => {
			expect(lint(`export const A = () => ${jsx}`).out).not.toContain("agent-initials")
		})
	})

	describe("lookalike-media-frame", () => {
		it("catches a ratio frame around art or an image and names the ratio", () => {
			const art = lint(`export const A = ({ a }) => <div className="aspect-square overflow-hidden rounded-md"><GradientArt seed={a.title} /></div>`)
			expect(art.out).toContain("<div> aspect-square overflow-hidden around <GradientArt> → <AspectBox ratio={1}>")
			const img = lint(`export const A = ({ a }) => <figure className="aspect-[4/5] overflow-hidden rounded-xl"><img src={a.cover} alt="" className="size-full object-cover" /></figure>`)
			expect(img.out).toContain("<AspectBox ratio={4 / 5}>")
		})

		it.each([
			["a ratio box with no media (a pad)", `<div className="relative aspect-[2/1] overflow-hidden rounded-md sable-well"><span className="absolute size-4" /></div>`],
			["a frame without clipping", `<div className="aspect-video rounded-lg"><img src="/a.png" alt="" /></div>`],
			["an image sized by its own aspect class", `<img src="/a.png" alt="" className="aspect-square w-full overflow-hidden rounded-md object-cover" />`],
			["AspectBox", `<AspectBox ratio={1} className="rounded-md"><GradientArt seed="x" /></AspectBox>`],
		])("leaves %s alone", (_, jsx) => {
			expect(lint(`export const A = () => ${jsx}`).out).not.toContain("lookalike-media-frame")
		})

		it("reports a round fixed-size frame once, as an avatar", () => {
			const r = lint(`export const A = () => <div className="aspect-square size-12 overflow-hidden rounded-full"><img src="/a.png" alt="" /></div>`)
			expect(r.out).toContain("lookalike-avatar")
			expect(r.out).not.toContain("lookalike-media-frame")
		})
	})

	it("lists the lookalike rules as new in 0.7.0 for an upgrading app", () => {
		const r = lint("", ["--since", "0.6.2"])
		for (const id of ["lookalike-grid", "lookalike-card", "lookalike-avatar", "lookalike-media-frame"]) expect(r.out).toContain(`● ${id}  (new in 0.7.0)`)
	})

	/* ── hand-derived-surface: mixing ink into a surface by hand. ───────────
	 * The relative-surface utilities compute exactly this; a hand-written
	 * color-mix is how an agent shows it skipped them. */
	it("catches ink hand-mixed into a surface, in a class or a style", () => {
		const cls = lint(
			`export const A = () => <div className="bg-[color-mix(in_oklab,var(--foreground)_7%,var(--popover))]" />`,
		)
		expect(cls.out).toContain("hand-derived-surface")
		const style = lint(
			`export const A = () => <div style={{ background: "color-mix(in oklab, var(--foreground) 8%, var(--card))" }} />`,
		)
		expect(style.out).toContain("hand-derived-surface")
	})

	it("leaves a theme hook's derived value alone, in a stylesheet or an arbitrary property", () => {
		const css = join(tmp, "theme.css")
		writeFileSync(css, ":root {\n\t--theme-panel-field: color-mix(in oklch, var(--background) 91%, var(--foreground));\n\t--my-fill: color-mix(in oklch, var(--background) 91%, var(--foreground));\n}\n")
		try {
			const r = lint(`export const A = () => <div className="[--theme-panel-field-hover:color-mix(in_oklch,var(--background)_88%,var(--foreground))]" />`)
			// Only the non-hook declaration is reported.
			expect(r.out.match(/hand-derived-surface/g)?.length).toBe(1)
			expect(r.out).toContain("theme.css:3")
		} finally {
			rmSync(css)
		}
	})

	it("leaves the utilities and other colour mixes alone", () => {
		const r = lint(
			`export const A = () => <div className="sable-well bg-hairline" style={{ color: "color-mix(in oklab, var(--primary) 50%, transparent)" }} />`,
		)
		expect(r.out).not.toContain("hand-derived-surface")
	})

	it("leaves a hover shadow on a resting card alone", () => {
		const r = lint(
			`export const A = () => <a className="rounded-lg border border-border bg-card motion-interactive hover:shadow-md" />`,
		)
		expect(r.out).not.toContain("floating-surface")
	})
	/* ── clickable-static: a click handler on a non-control. ─────────────────
	 * Mouse-only: no focus, no Enter/Space, no role. */
	it("catches onClick on a div, and leaves role-owned rows and Button alone", () => {
		const div = lint(`export const A = ({ go }: { go: () => void }) => <div className="p-2" onClick={go}>Open</div>`)
		expect(div.out).toContain("clickable-static")
		const option = lint(
			`export const A = ({ go }: { go: () => void }) => <div role="option" aria-selected={false} onClick={go}>Row</div>`,
		)
		expect(option.out).not.toContain("clickable-static")
		const button = lint(`export const A = ({ go }: { go: () => void }) => <Button variant="ghost" onClick={go}>Open</Button>`)
		expect(button.out).not.toContain("clickable-static")
	})

	/* ── hand-written-fade: an edge fade masked by hand. ─────────────────────
	 * Scroller owns the edge fade (only on the side with more, following scroll). */
	it("catches a hand-written mask gradient", () => {
		const cls = lint(`export const A = () => <div className="overflow-auto [mask-image:linear-gradient(to_bottom,black_80%,transparent)]" />`)
		expect(cls.out).toContain("hand-written-fade")
		const style = lint(
			`export const A = () => <div style={{ maskImage: "linear-gradient(to right, black 80%, transparent)" }} />`,
		)
		expect(style.out).toContain("hand-written-fade")
	})

	/* ── hand-rolled-control: meters, progress bars and separators by role. ── */
	it("catches a hand-rolled meter, progress bar or separator", () => {
		expect(lint(`export const A = () => <div role="progressbar" aria-valuenow={4} />`).out).toContain("use Progress")
		expect(lint(`export const A = () => <div role="meter" aria-valuenow={4} />`).out).toContain("use Meter")
		expect(lint(`export const A = () => <hr className="border-border" />`).out).toContain("use Separator")
	})
})

/* ── Restyling and hand-tuned spacing. Each rule names the variant or
 * utility that replaces the override, and each leaves layout classes alone. ── */
describe("variants over overrides", () => {
	it("catches a destructive menu row coloured by className", () => {
		const r = lint(`export const A = () => <MenuItem className="text-destructive" onClick={() => {}}>Delete</MenuItem>`)
		expect(r.out).toContain("destructive-item-ink")
		expect(r.out).toContain('variant="destructive"')
		const ctx = lint(`export const A = () => <ContextMenuItem className={cn("gap-2", "data-[highlighted]:text-destructive")}>Delete</ContextMenuItem>`)
		expect(ctx.out).toContain("destructive-item-ink")
		const ok = lint(`export const A = () => <MenuItem variant="destructive" className="gap-2">Delete</MenuItem>`)
		expect(ok.out).not.toContain("destructive-item-ink")
	})

	it("catches a look-changing class on Button, Pill or Badge, and allows layout", () => {
		expect(lint(`export const A = () => <Button variant="outline" className="rounded-full">Sign in</Button>`).out).toContain("component-restyle")
		expect(lint(`export const A = () => <Pill className={cn("border", x && "bg-card")}>Tag</Pill>`).out).toContain("component-restyle")
		expect(lint(`export const A = () => <Badge className="hover:shadow-md">New</Badge>`).out).toContain("component-restyle")
		const layout = lint(`export const A = () => <Button variant="floating" className="absolute end-2 top-2 w-full shrink-0 mt-4">Go</Button>`)
		expect(layout.out).not.toContain("component-restyle")
	})

	it("catches hand-set edge padding on table cells", () => {
		expect(lint(`export const A = () => <TableHead className="pl-6">Name</TableHead>`).out).toContain("table-edge-padding")
		expect(lint(`export const A = () => <TableCell className="text-end pe-6">3</TableCell>`).out).toContain("table-edge-padding")
		expect(lint(`export const A = () => <TableCell className="py-3 text-end">3</TableCell>`).out).not.toContain("table-edge-padding")
	})

	it("catches a fixed bleed on a popup separator", () => {
		expect(lint(`export const A = () => <MenuSeparator className="-mx-1" />`).out).toContain("popup-separator-bleed")
		expect(lint(`export const A = () => <div className="-mx-1 my-1 h-px bg-border" />`).out).toContain("popup-separator-bleed")
		expect(lint(`export const A = () => <div className="popup-bleed my-1 h-px bg-border" />`).out).not.toContain("popup-separator-bleed")
	})
})

describe("fixed-spacing (package scope)", () => {
	type Hit = { ruleId: string; match: string }
	type LintModule = {
		makeRules: (c: { semanticTokens: Set<string>; motionTokens: Set<string> }) => unknown[]
		lintText: (text: string, rules: unknown[], ctx?: object) => Hit[]
	}
	const run = async (src: string) => {
		const path = join(PKG_ROOT, "scripts", "lint-rules.mjs")
		const mod = (await import(/* @vite-ignore */ path)) as LintModule
		const rules = mod.makeRules({ semanticTokens: new Set(), motionTokens: new Set() })
		return mod.lintText(src, rules).filter((v) => v.ruleId === "fixed-spacing").map((v) => v.match)
	}

	it("catches rem and px padding, gaps and insets off the spacing scale", async () => {
		expect(await run(`const v = "p-[1.5rem] px-[12px] gap-[0.5rem] -mt-[6px]"`)).toEqual([
			"p-[1.5rem]",
			"px-[12px]",
			"gap-[0.5rem]",
			"-mt-[6px]",
		])
		expect(await run(`const s = { padding: "12px", "--card-p": "1.5rem" }`)).toHaveLength(2)
	})

	it("leaves the scale, hairlines, em values and positional offsets alone", async () => {
		expect(
			await run(`const v = "p-4 gap-2 p-[var(--card-p,--spacing(6))] mt-[1px] pt-[0.23em] top-[-6px] w-[12rem]"`),
		).toEqual([])
		expect(consumerSkips()).toBe(true)
	})
})

/** fixed-spacing is package-only: an app's arbitrary values are its own business. */
function consumerSkips() {
	return lint(`export const A = () => <div className="p-[1.5rem]" />`).out.includes("fixed-spacing") === false
}

/* ── label-contrast: labels on brand and status fills, read from the app's stylesheet. ──
 * The app's override is measured against the installed theme, because the case
 * that ships is a retuned `--primary` with the theme's label left in place. */
describe("label-contrast", () => {
	function lintCss(css: string) {
		writeFileSync(join(tmp, "brand.css"), css)
		try {
			return lint(`export const A = () => null`)
		} finally {
			rmSync(join(tmp, "brand.css"))
		}
	}

	it("catches a retuned primary that keeps a label which no longer reads, and offers the pair", () => {
		const r = lintCss(`:root {\n\t--primary: oklch(65.2% 0.235 32.9);\n}\n`)
		expect(r.code).toBe(1)
		expect(r.out).toContain("label-contrast")
		expect(r.out).toContain("brand.css:2")
		expect(r.out).toMatch(/--primary-foreground on --primary is 3\.\d\d:1/)
		expect(r.out).toMatch(/try --primary: oklch\(5\d\.\d% /)
	})

	it("fixes a dark-mode failure by keeping the colour's ink, not flipping it", () => {
		// The Ember case: the light red takes white, so dark mode brings the fill
		// down to white rather than lifting it under dark ink.
		const r = lintCss(`:root { --primary: oklch(55% 0.2 30); --primary-foreground: oklch(98.5% 0.01 30); }\n.dark { --primary: oklch(70% 0.18 30); --primary-foreground: oklch(20% 0.03 30); }\n`)
		expect(r.out).toMatch(/dark: --primary-foreground on --primary .* try --primary: oklch\(5\d\.\d% [\d.]+ 30\.0\); --primary-foreground: oklch\(98\.5%/)
		expect(r.out).not.toMatch(/light: --primary-foreground/)
	})

	it("passes a pair that reads in both modes", () => {
		const r = lintCss(`:root { --primary: oklch(55% 0.2 260); --primary-foreground: oklch(98% 0 0); }\n`)
		expect(r.out).not.toContain("label-contrast")
	})

	it("lets the app keep its choice with a reason on the record", () => {
		const r = lintCss(
			`:root {\n\t--primary: oklch(72% 0.17 30);\n\t/* design-lint-disable-next-line label-contrast -- brand book: near-black on coral */\n\t--primary-foreground: oklch(20% 0.02 30);\n}\n`,
		)
		expect(r.out).not.toContain("label-contrast —")
	})

	it("ignores tokens the app does not touch", () => {
		const r = lintCss(`:root { --radius: 4px; --background: oklch(99% 0 0); }\n`)
		expect(r.out).not.toContain("label-contrast")
	})
})

/* ── status-text-drift: a retuned status fill whose text stays on the theme's colour. ──
 * Since 0.6, text, borders and rings read `--<status>-text`; setting only the
 * fill splits a red button from a red error message. */
describe("status-text-drift", () => {
	function lintCss(css: string) {
		writeFileSync(join(tmp, "status.css"), css)
		try {
			return lint(`export const A = () => null`)
		} finally {
			rmSync(join(tmp, "status.css"))
		}
	}

	it("catches a retuned fill whose text is left on the theme's colour", () => {
		const r = lintCss(`:root {\n\t--destructive: oklch(55% 0.22 20);\n\t--destructive-foreground: oklch(98% 0 0);\n}\n`)
		expect(r.out).toContain("status-text-drift")
		expect(r.out).toContain("status.css:2")
		expect(r.out).toContain("--destructive is set without --destructive-text (light and dark)")
	})

	it("names the one mode the text is missing from", () => {
		// The fill on :root reaches both modes; the text was set for dark only.
		const r = lintCss(`:root { --success: oklch(50% 0.12 160); }\n.dark { --success-text: oklch(72% 0.12 160); }\n`)
		expect(r.out).toContain("--success is set without --success-text (light)")
		expect(r.out).not.toContain("(light and dark)")
	})

	it("counts an app's :root text in dark mode too, as the cascade does", () => {
		const r = lintCss(`:root { --success: oklch(50% 0.12 160); --success-text: oklch(45% 0.12 160); }\n.dark { --success: oklch(60% 0.12 160); }\n`)
		expect(r.out).not.toContain("status-text-drift")
	})

	it("passes when the text moves with the fill, in the same theme", () => {
		const r = lintCss(`[data-sable-theme="ember"] { --tone-warning: oklch(70% 0.14 70); --tone-warning-text: oklch(52% 0.12 65); }\n`)
		expect(r.out).not.toContain("status-text-drift")
	})

	it("does not count another theme's text", () => {
		const r = lintCss(`[data-sable-theme="ember"] { --tone-info: oklch(60% 0.12 250); }\n[data-sable-theme="prism"] { --tone-info-text: oklch(45% 0.12 250); }\n`)
		expect(r.out).toContain("--tone-info is set without --tone-info-text")
	})
})

describe("label-contrast on status fills", () => {
	it("catches a dark destructive retuned too light for the theme's white label", () => {
		// The theme's dark destructive takes white; its text lives in
		// --destructive-text, so the fix brings the fill down, not the label dark.
		writeFileSync(join(tmp, "status.css"), `.dark {\n\t--destructive: oklch(68% 0.2 25);\n}\n`)
		try {
			const r = lint(`export const A = () => null`)
			expect(r.out).toContain("status.css:2")
			const fill = Number(r.out.match(/try --destructive: oklch\(([\d.]+)%/)?.[1])
			expect(fill).toBeLessThan(62)
		} finally {
			rmSync(join(tmp, "status.css"))
		}
	})
})
