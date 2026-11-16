import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * A component's own words can be replaced (CONTRIBUTING.md → "Words a component
 * supplies"). The one place that rule silently breaks is a literal on the
 * element: `aria-label="Close"` cannot be translated, and spreading props over
 * it reaches only the root. Dialog, Banner, Pagination, Carousel, NumberField
 * and a dozen more shipped that way. The English default belongs in the
 * destructuring (`closeLabel = "Close"`), and the element reads the prop.
 *
 * A template is allowed when it only joins values (`${label}: ${summary}`);
 * one with words of its own (`Page ${n}`) is a hardcoded phrase.
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

/** Comments out, so a JSDoc example (`<Toggle aria-label="Bold">`) is not code. */
function code(src: string): string {
	return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1")
}

const LITERAL = /aria-label=(?:"([^"]*)"|\{\s*"([^"]*)"\s*\}|\{\s*`([^`]*)`\s*\})/g

function hasWords(template: string): boolean {
	return /[A-Za-z]{2,}/.test(template.replace(/\$\{[^}]*\}/g, ""))
}

describe("aria-label literals", () => {
	it("are never hardcoded on a component's element", () => {
		const offenders: string[] = []
		for (const file of sources(COMPONENTS)) {
			const text = code(readFileSync(file, "utf8"))
			for (const match of text.matchAll(LITERAL)) {
				const [whole, plain, quoted, template] = match
				if (template !== undefined && !hasWords(template)) continue
				if ((plain ?? quoted) === "") continue
				offenders.push(`${relative(COMPONENTS, file).replaceAll("\\", "/")}: ${whole}`)
			}
		}
		expect(offenders, "move the words to a `<role>Label` prop with an English default").toEqual([])
	})

	it("tells joined values from phrases", () => {
		expect(hasWords("${label}: ${summary}")).toBe(false)
		expect(hasWords("Page ${n}")).toBe(true)
		expect(code('a // aria-label="Close"\n/* aria-label="Bold" */b')).toBe("a \nb")
	})
})
