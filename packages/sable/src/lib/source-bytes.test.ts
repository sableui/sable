import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Source is text. An edit made through a non-raw string (Python's "\b", a
 * pasted "\0") writes the control byte itself: two tests carried a literal
 * backspace where a regex meant `\b`, so their `not.toMatch` could never fail,
 * and a raw NUL made git treat message-scroller.tsx as binary. Write the escape
 * (`\b`, `"\u0000"`), never the byte. Tab, LF and CR are the only ones allowed.
 */
const SRC = join(__dirname, "..")
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/

function files(dir: string, out: string[] = []): string[] {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name)
		if (statSync(path).isDirectory()) {
			if (!name.startsWith(".")) files(path, out)
		} else if (/\.(tsx?|css|md|mjs)$/.test(name)) out.push(path)
	}
	return out
}

describe("source bytes", () => {
	it("holds no control characters", () => {
		const offenders = files(SRC).flatMap((file) =>
			readFileSync(file, "utf8")
				.split("\n")
				.flatMap((line, i) => (CONTROL.test(line) ? [`${relative(SRC, file).replaceAll("\\", "/")}:${i + 1}`] : [])),
		)
		expect(offenders).toEqual([])
	})
})
