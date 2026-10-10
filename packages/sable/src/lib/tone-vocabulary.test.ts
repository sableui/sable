import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { BADGE_TONES } from "../components/badge/badge.variants"
import { STATUS_TONES } from "./status-tone"

/*
 * One vocabulary for meaning. Every surface that says what something MEANS
 * takes `tone`, from one list; `variant` / `appearance` say how it is DRAWN and
 * never carry a tone name. Before this, the same idea was spelled `variant`
 * (Banner, Note), `type` (Toast), `tone` (InlineStatus) and `fill` (Banner's
 * emphasis), with an `error` alias accepted by two components and rejected by
 * the rest — the drift that made status surfaces hard to swap for each other.
 */

const registry = JSON.parse(readFileSync(join(__dirname, "../../registry.json"), "utf8")) as {
	components: { name: string; props?: { name: string; type?: string }[] }[]
}
const values = (type = "") => [...type.matchAll(/"([a-z-]+)"/g)].map((m) => m[1])

/** `primary` is the brand accent for an indicator's fill (a meter, a count bubble) — not a severity. */
const ACCENT_TONE = "primary"
/** Button's `variant="destructive"` is the danger-action emphasis tier, a Button convention. */
const VARIANT_EXCEPTIONS: Record<string, string[]> = { Button: ["destructive"] }

describe("tone vocabulary", () => {
	it("keeps the status tones a subset of Badge's tones", () => {
		for (const tone of STATUS_TONES) expect(BADGE_TONES).toContain(tone)
	})

	it("takes every documented `tone` value from the shared list", () => {
		const allowed = new Set<string>([...BADGE_TONES, ACCENT_TONE])
		const offenders = registry.components.flatMap((c) =>
			(c.props ?? [])
				.filter((p) => p.name === "tone")
				.flatMap((p) => values(p.type).filter((v) => !allowed.has(v)).map((v) => `${c.name}: tone "${v}"`)),
		)
		expect(offenders).toEqual([])
	})

	it("never spells a tone as `variant` or `appearance`", () => {
		const tones = new Set<string>(BADGE_TONES.filter((t) => t !== "neutral"))
		const offenders = registry.components.flatMap((c) =>
			(c.props ?? [])
				.filter((p) => p.name === "variant" || p.name === "appearance")
				.flatMap((p) =>
					values(p.type)
						.filter((v) => tones.has(v) && !(VARIANT_EXCEPTIONS[c.name] ?? []).includes(v))
						.map((v) => `${c.name}: ${p.name} "${v}" is a tone — use tone="${v}"`),
				),
		)
		expect(offenders).toEqual([])
	})

	it("has no `error` alias on a severity prop", () => {
		// Severity props only. An upload's `status: "error"` is a lifecycle state,
		// and Toast's `type` is the toast API's event kind (toast.error(),
		// toast.promise({ error }), alongside "loading"), not a tone.
		const offenders = registry.components.flatMap((c) =>
			(c.props ?? [])
				.filter((p) => ["tone", "variant", "appearance"].includes(p.name) && values(p.type).includes("error"))
				.map((p) => `${c.name}.${p.name}`),
		)
		expect(offenders).toEqual([])
	})
})
