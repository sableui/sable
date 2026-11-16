import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Every module that needs the client says so.
 *
 * Sable builds one output module per source module and keeps each module's
 * `"use client"` directive (tsup.config.ts: no Rollup pass, so esbuild leaves
 * the directive at the top of the emitted file). The directive therefore has to
 * be in the SOURCE: a module that never had one ships without one. Button,
 * Card, Input, Dialog and some 40 others shipped that way, so a Next.js Server
 * Component that rendered `<Button>` ran `useState` on the server and threw.
 *
 * A module needs the directive when it calls a hook, creates a context, puts an
 * event handler on an element, or hands a function (a `render` or `className`
 * callback) to a Base UI part. Comments, strings and template literals are
 * stripped first, so documentation that names `useMotion()` does not count.
 */
const SRC = join(__dirname, "..")

/**
 * Blocks and patterns are copy-in source owned outside this gate's first pass.
 * These still need the directive; the list may only shrink. Remove a name the
 * moment its file gains `"use client"` (the test fails on a stale entry).
 */
const PENDING = new Set<string>([])

function sources(dir: string, out: string[] = []): string[] {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name)
		if (statSync(path).isDirectory()) {
			if (name === "test" || name.startsWith(".")) continue
			sources(path, out)
		} else if (/\.tsx?$/.test(name) && !/\.(test|meta|variants|d)\.tsx?$/.test(name)) out.push(path)
	}
	return out
}

/** Drop comments, strings and template literals, keeping the code around them. */
function stripNonCode(src: string): string {
	let out = ""
	let i = 0
	while (i < src.length) {
		const c = src[i]
		const next = src[i + 1]
		// An apostrophe inside a word ("Don't" in JSX text) opens no string.
		const inWord = c === "'" && /\w/.test(src[i - 1] ?? "")
		if (c === "/" && next === "/" && src[i - 1] !== ":") {
			while (i < src.length && src[i] !== "\n") i++
		} else if (c === "/" && next === "*") {
			const end = src.indexOf("*/", i + 2)
			i = end === -1 ? src.length : end + 2
		} else if ((c === '"' || c === "'" || c === "`") && !inWord) {
			i++
			while (i < src.length && src[i] !== c) {
				if (src[i] === "\\") i++
				i++
			}
			i++
			out += '""'
		} else {
			out += c
			i++
		}
	}
	return out
}

const DIRECTIVE = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*["']use client["']/

const NEEDS_CLIENT: [string, RegExp][] = [
	["calls a hook", /(?<![\w.$])(?:React\.)?use[A-Z]\w*\s*(?:<[^>()]*>)?\s*\(/],
	["creates a context", /\bcreateContext\s*[<(]/],
	["sets an event handler", /\son[A-Z]\w*=\{/],
	["passes a function prop", /\s(?:render|className)=\{\s*(?:\([^)]*\)|\w+)\s*=>/],
]

function reasonFor(file: string): string | null {
	const code = stripNonCode(readFileSync(file, "utf8"))
	for (const [reason, pattern] of NEEDS_CLIENT) if (pattern.test(code)) return reason
	return null
}

describe('"use client"', () => {
	const files = sources(SRC)

	it("is present on every module that needs the client", () => {
		const missing: string[] = []
		for (const file of files) {
			const rel = relative(SRC, file).replaceAll("\\", "/")
			if (PENDING.has(rel)) continue
			if (DIRECTIVE.test(readFileSync(file, "utf8"))) continue
			const reason = reasonFor(file)
			if (reason) missing.push(`${rel} (${reason})`)
		}
		expect(missing, `add "use client" as the first statement of:\n${missing.join("\n")}`).toEqual([])
	})

	it("keeps the pending list honest", () => {
		const stale = [...PENDING].filter((rel) => {
			const file = join(SRC, rel)
			try {
				return DIRECTIVE.test(readFileSync(file, "utf8")) || reasonFor(file) === null
			} catch {
				return true
			}
		})
		expect(stale, "remove these from PENDING: they no longer need it or already have it").toEqual([])
	})

	it("recognises what it gates", () => {
		expect(stripNonCode('const a = "useState(" // useEffect(\n/* useMemo( */ b')).toBe('const a = "" \n b')
		expect(NEEDS_CLIENT[0][1].test(stripNonCode("const [a] = useState(0)"))).toBe(true)
		expect(NEEDS_CLIENT[0][1].test(stripNonCode("const x = obj.useThing()"))).toBe(false)
		expect(NEEDS_CLIENT[3][1].test(" render={(props, state) => null}")).toBe(true)
		expect(DIRECTIVE.test('/** doc */\n"use client"\n')).toBe(true)
		expect(DIRECTIVE.test('import x from "y"\n"use client"\n')).toBe(false)
	})
})
