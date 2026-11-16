import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Every exported component names itself. About 180 did and 104 did not, so
 * React DevTools and error stacks showed `Banner` beside an anonymous Menu
 * item, and nothing said which was the convention. It is this one: each
 * `export function Name` is followed by `Name.displayName = "Name"`.
 */
const COMPONENTS = join(__dirname, "..", "components")

function sources(dir: string, out: string[] = []): string[] {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name)
		if (statSync(path).isDirectory()) {
			if (!name.startsWith(".")) sources(path, out)
		} else if (name.endsWith(".tsx") && !/\.(test|meta)\.tsx$/.test(name)) out.push(path)
	}
	return out
}

describe("displayName", () => {
	it("is set on every exported function component", () => {
		const missing: string[] = []
		for (const file of sources(COMPONENTS)) {
			const text = readFileSync(file, "utf8")
			for (const [, name] of text.matchAll(/^export function ([A-Z]\w*)/gm)) {
				if (!new RegExp(`^${name}\\.displayName = "${name}"`, "m").test(text)) {
					missing.push(`${relative(COMPONENTS, file).replaceAll("\\", "/")}: ${name}`)
				}
			}
		}
		expect(missing).toEqual([])
	})
})
