import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
// @ts-expect-error Plain JS tool shipped with the CLI.
import { sableModules, sourcesCheck, sourcesCss } from "../../scripts/sources.mjs"

let pkg: string
let app: string
const put = (root: string, file: string, text: string) => {
	mkdirSync(dirname(join(root, file)), { recursive: true })
	writeFileSync(join(root, file), text)
}

beforeEach(() => {
	pkg = mkdtempSync(join(tmpdir(), "sable-pkg-"))
	app = mkdtempSync(join(tmpdir(), "sable-app-"))
	// A published package in miniature: barrels, a part that imports a helper,
	// a lazy module, docs metadata, and a component nobody imports.
	put(pkg, "package.json", JSON.stringify({ exports: { ".": { default: "./dist/index.js" }, "./blocks": { default: "./dist/blocks/index.js" } } }))
	put(pkg, "dist/index.js", 'export * from "./components/card/index.js";\nexport * from "./components/tabs/index.js";\nimport { Art } from "./components/art/art.js";\nexport { Art };\n')
	put(pkg, "dist/components/card/index.js", 'import { Card, CardTitle } from "./card.js";\nimport { cardMeta } from "./card.meta.js";\nexport { Card, CardTitle, cardMeta };\n')
	put(pkg, "dist/components/card/card.js", 'import { cn } from "../../lib/cn.js";\nexport function Card() { return "rounded-xl" }\nexport function CardTitle() {}\n')
	put(pkg, "dist/components/card/card.meta.js", 'export const cardMeta = { code: "<Card className=\\"p-24\\" />" }\n')
	put(pkg, "dist/components/tabs/index.js", 'export { Tabs } from "./tabs.js";\n')
	put(pkg, "dist/components/tabs/tabs.js", "export function Tabs() {}\n")
	put(pkg, "dist/components/art/art.js", 'export const Art = () => import("./renderer.js")\n')
	put(pkg, "dist/components/art/renderer.js", "export const draw = 1\n")
	put(pkg, "dist/lib/cn.js", "export function cn() {}\n")
	put(pkg, "dist/blocks/index.js", 'export { SignIn } from "./sign-in.js";\n')
	put(pkg, "dist/blocks/sign-in.js", 'import { Card } from "../components/card/index.js";\nexport function SignIn() {}\n')
})
afterEach(() => {
	rmSync(pkg, { recursive: true, force: true })
	rmSync(app, { recursive: true, force: true })
})

const rel = (files: string[]) => files.map((f) => f.slice(pkg.length + 1).split("\\").join("/"))

describe("sable sources", () => {
	it("follows each imported name to its module and everything that module imports, leaving docs metadata out", () => {
		put(app, "src/App.tsx", 'import { CardTitle, type Tabs } from "@sableui/react"\nimport type { X } from "@sableui/react"\n')
		const { modules, unresolved } = sableModules(pkg, [join(app, "src/App.tsx")])
		expect(unresolved).toEqual([])
		expect(rel(modules)).toEqual(["dist/components/card/card.js", "dist/lib/cn.js"])
	})

	it("follows a lazy import, a subpath entry and a re-export through an import", () => {
		put(app, "src/App.tsx", 'import { Art } from "@sableui/react"\nimport { SignIn } from "@sableui/react/blocks"\n')
		const { modules } = sableModules(pkg, [join(app, "src/App.tsx")])
		expect(rel(modules)).toEqual(expect.arrayContaining(["dist/components/art/renderer.js", "dist/blocks/sign-in.js", "dist/components/card/card.js"]))
		expect(rel(modules)).not.toContain("dist/components/tabs/tabs.js")
	})

	it("covers all of Sable when an import can't be traced", () => {
		put(app, "src/App.tsx", 'import * as Sable from "@sableui/react"\nimport { Nope } from "@sableui/react"\n')
		const { css, unresolved } = sourcesCss(pkg, app, "src/sable-sources.css")
		expect(unresolved).toContain("Nope from @sableui/react")
		expect(css).toMatch(/@source "[^"]*dist\/\*\*\/\*\.\{js,mjs\}";/)
	})

	it("fails doctor once the app imports a module the generated file does not list", () => {
		put(app, "src/App.tsx", 'import { Card } from "@sableui/react"\n')
		const { css } = sourcesCss(pkg, app, "src/sable-sources.css")
		const file = { path: join(app, "src/sable-sources.css"), text: css }
		expect(sourcesCheck(pkg, app, [file])[0]).toMatchObject({ status: "pass" })
		put(app, "src/More.tsx", 'import { Tabs } from "@sableui/react"\n')
		const [check] = sourcesCheck(pkg, app, [file])
		expect(check.status).toBe("fail")
		expect(check.detail).toContain("components/tabs/tabs.js")
	})

	it("notes, without failing, a stylesheet that scans all of Sable", () => {
		const [check] = sourcesCheck(pkg, app, [{ path: join(app, "src/app.css"), text: '@source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";' }])
		expect(check).toMatchObject({ status: "info", name: "css:size" })
	})

	it("warns when the whole-package @source is still there beside the generated file", () => {
		put(app, "src/App.tsx", 'import { Card } from "@sableui/react"\n')
		const { css } = sourcesCss(pkg, app, "src/sable-sources.css")
		const generated = { path: join(app, "src/sable-sources.css"), text: css }
		const main = { path: join(app, "src/app.css"), text: '@import "./sable-sources.css";\n@source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";' }
		const [check] = sourcesCheck(pkg, app, [main, generated])
		expect(check).toMatchObject({ status: "warn", name: "css:sources" })
		expect(check.detail).toContain("trims nothing")
	})

	it("does not take a single-module @source or an exclusion for the whole package", () => {
		put(app, "src/App.tsx", 'import { Card } from "@sableui/react"\n')
		const { css } = sourcesCss(pkg, app, "src/sable-sources.css")
		const generated = { path: join(app, "src/sable-sources.css"), text: css }
		const extra = {
			path: join(app, "src/routes.css"),
			text: '@source "../node_modules/@sableui/react/dist/components/tabs/tabs.js";\n@source not "../node_modules/@sableui/react/dist/blocks";',
		}
		const [check] = sourcesCheck(pkg, app, [extra, generated])
		expect(check.status).not.toBe("warn")
	})
})
