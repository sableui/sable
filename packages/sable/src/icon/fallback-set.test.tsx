import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Icon } from "./Icon"
import { fallbackIconSet } from "./fallback-set"

/** Compatibility alias and no-provider contract coverage. */
const contractNames: string[] = JSON.parse(
	readFileSync(resolve(__dirname, "..", "..", "registry.json"), "utf8"),
).iconContract.names

describe("Reicon compatibility alias", () => {
	it("covers every name in the icon contract", () => {
		const missing = contractNames.filter(
			(name) => fallbackIconSet({ name, variant: "regular" }) == null,
		)
		expect(missing, `fallbackIconSet is missing: ${missing.join(", ")}`).toEqual([])
	})

	it("renders real geometry for every contract name, not an empty frame", () => {
		// A registered-but-empty entry passes the coverage check above while still
		// rendering an invisible icon, so assert each one actually draws something.
		const empty: string[] = []
		for (const name of contractNames) {
			const { container, unmount } = render(<Icon name={name} />)
			const svg = container.querySelector("svg")
			if (!svg || svg.children.length === 0) empty.push(name)
			unmount()
		}
		expect(empty, `these contract icons render no geometry: ${empty.join(", ")}`).toEqual([])
	})

	it("returns null for a name outside the contract", () => {
		// The provider contract: unknown names resolve to null so a consumer's
		// richer set can be detected as absent rather than crashing.
		expect(fallbackIconSet({ name: "definitely-not-an-icon", variant: "regular" })).toBeNull()
	})
})
