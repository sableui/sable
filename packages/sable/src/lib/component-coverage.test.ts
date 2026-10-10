import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

/*
 * No orphans in either direction.
 *
 * Every consolidation leaves debris: a removed component's docs page still
 * routed, a design note for a slug that no longer exists, a folder with no meta
 * (so it never reaches registry.json, llms or `sable search`, and an agent
 * cannot find it — and rebuilds it). This test makes both kinds of orphan a
 * failure instead of something a later audit stumbles on.
 */

const PKG = resolve(__dirname, "..", "..")
const DOCS = resolve(PKG, "..", "..", "apps", "docs", "src")
const folders = readdirSync(join(PKG, "src", "components"), { withFileTypes: true })
	.filter((d) => d.isDirectory() && !d.name.startsWith("."))
	.map((d) => d.name)

const app = readFileSync(join(DOCS, "App.tsx"), "utf8")
/** Route keys: `slug:` or `"slug":` followed by page(… */
const routes = new Set([...app.matchAll(/^\t(?:"([a-z0-9-]+)"|([a-z0-9]+)):\s*page\(/gm)].map((m) => m[1] ?? m[2]))
/** Every lazily imported component page. */
const routedPages = new Set([...app.matchAll(/import\("\.\/pages\/components\/(\w+)"\)/g)].map((m) => m[1]))

describe("component coverage", () => {
	it("gives every component folder a meta, so it reaches the registry", () => {
		const missing = folders.filter((f) => !existsSync(join(PKG, "src", "components", f, `${f}.meta.ts`)))
		expect(missing).toEqual([])
	})

	it("gives every component a docs route", () => {
		expect(folders.filter((f) => !routes.has(f))).toEqual([])
	})

	it("routes every component page, and every routed page exists", () => {
		const pages = readdirSync(join(DOCS, "pages", "components"))
			.filter((f) => f.endsWith("Page.tsx"))
			.map((f) => f.replace(/\.tsx$/, ""))
		expect(pages.filter((p) => !routedPages.has(p))).toEqual([])
		expect([...routedPages].filter((p) => !pages.includes(p))).toEqual([])
	})

	it("keeps no design note for a component that no longer exists", () => {
		const notes = readdirSync(join(DOCS, "content", "design-notes"))
			.filter((f) => f.endsWith(".ts") && f !== "index.ts")
			.map((f) => f.replace(/\.ts$/, ""))
		expect(notes.filter((n) => !folders.includes(n) && !routes.has(n))).toEqual([])
	})
})

describe("docs page titles", () => {
	it("title each component page with the component's nav label", async () => {
		// Typed by hand, a title misses a rename (RadioCard's page kept "RadioCard"
		// while every other page reads "Date Picker", "Notification Badge"…).
		const { componentLabel } = await import("./taxonomy")
		const registry = JSON.parse(readFileSync(join(PKG, "registry.json"), "utf8")) as { components: { name: string }[] }
		const wrong = registry.components.flatMap(({ name }) => {
			const file = join(DOCS, "pages", "components", `${name}Page.tsx`)
			if (!existsSync(file)) return []
			const source = readFileSync(file, "utf8")
			const title = /<PageHeader[\s\S]*?\btitle="([^"]+)"/.exec(source)?.[1]
			const eyebrow = /<PageHeader[\s\S]*?\beyebrow="([^"]+)"/.exec(source)?.[1]
			if (eyebrow && eyebrow !== "Components") return [`${name}Page: eyebrow "${eyebrow}" — every component page uses "Components"`]
			// The nav may shorten a long name to fit; the page can use either.
			const full = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
			const ok = title === componentLabel(name) || title === full
			return title && !ok ? [`${name}Page: "${title}" — expected "${componentLabel(name)}"`] : []
		})
		expect(wrong).toEqual([])
	})
})

describe("docs playgrounds", () => {
	it("names only documented props in each playground's controls", () => {
		// The playground drops a control it cannot find, silently. Renaming Note's
		// `variant` to `tone` left its playground with no controls at all, and
		// Banner's lost two — nothing failed. Every name must be a documented prop
		// or variant of the component.
		const registry = JSON.parse(readFileSync(join(PKG, "registry.json"), "utf8")) as {
			components: { name: string; props?: { name: string }[]; variants?: Record<string, string[]> }[]
		}
		const previews = readFileSync(join(DOCS, "lib", "previews.tsx"), "utf8")
		// One entry per `meta: xMeta`, up to the next one.
		const entries = previews.split(/(?=\bmeta: \w+Meta,)/).slice(1)
		const wrong = entries.flatMap((entry) => {
			const meta = /^meta: (\w+)Meta,/.exec(entry)?.[1]
			const only = /\bonly: \[([^\]]*)\]/.exec(entry)?.[1]
			if (!meta || only === undefined) return []
			const name = meta[0].toUpperCase() + meta.slice(1)
			const c = registry.components.find((x) => x.name === name)
			if (!c) return [`${name}: no such component`]
			const known = new Set([...(c.props ?? []).map((p) => p.name), ...Object.keys(c.variants ?? {})])
			return [...only.matchAll(/"([^"]+)"/g)]
				.map((m) => m[1])
				.filter((prop) => !known.has(prop))
				.map((prop) => `${name} playground: "${prop}" is not a documented prop`)
		})
		expect(wrong).toEqual([])
	})
})
