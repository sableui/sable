import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
	COMPONENT_GROUPS,
	COMPONENT_TAXONOMY,
	componentLabel,
	componentSlug,
	componentsInGroup,
} from "./taxonomy"

const registry = JSON.parse(
	readFileSync(resolve(__dirname, "..", "..", "registry.json"), "utf8"),
)

describe("taxonomy", () => {
	it("files every component in the registry, and nothing that isn't one", () => {
		// Both directions. The forward direction is what four components failed
		// silently for four releases; the reverse catches a stale entry that would
		// render a nav link to nothing (it caught `Panel`, a subcomponent, on the
		// contract's first run).
		const shipped = new Set(registry.components.map((c: { name: string }) => c.name))
		const filed = new Set(Object.keys(COMPONENT_TAXONOMY))

		const unfiled = [...shipped].filter((n) => !filed.has(n as string))
		const stale = [...filed].filter((n) => !shipped.has(n))
		expect(unfiled, "shipped but unfiled").toEqual([])
		expect(stale, "filed but not shipped").toEqual([])
	})

	it("uses only declared groups and registers", () => {
		for (const [name, [group, register]] of Object.entries(COMPONENT_TAXONOMY)) {
			expect(COMPONENT_GROUPS, `${name} group`).toContain(group)
			expect(["page", "workspace", "either"], `${name} register`).toContain(register)
		}
	})

	it("emits group and register into registry.json for every component", () => {
		// The whole point: a consumer of the machine-readable catalog gets the
		// grouping. Before this it was a flat list of 100 with no sibling signal.
		for (const c of registry.components as { name: string; group?: string; register?: string }[]) {
			expect(c.group, `${c.name} has no group in registry.json`).toBeDefined()
			expect(c.register, `${c.name} has no register in registry.json`).toBeDefined()
		}
	})

	it("keeps register orthogonal to group", () => {
		// The defect the old taxonomy had: "Workspace" was a GROUP competing with
		// role groups, so a workspace form control had two valid homes and no rule
		// to pick. If register ever becomes derivable from group, the axes have
		// collapsed back together and the ambiguity returns.
		expect(COMPONENT_GROUPS).not.toContain("Workspace")

		const byGroup = new Map<string, Set<string>>()
		for (const [, [group, register]] of Object.entries(COMPONENT_TAXONOMY)) {
			if (!byGroup.has(group)) byGroup.set(group, new Set())
			byGroup.get(group)!.add(register)
		}
		// At least one group must mix registers, or the axes are redundant.
		const mixed = [...byGroup.values()].filter((s) => s.size > 1)
		expect(mixed.length).toBeGreaterThan(0)
	})

	it("keeps siblings together, on KIND rather than on co-occurrence", () => {
		const groupOf = (n: string) => COMPONENT_TAXONOMY[n]?.[0]
		// Switch and Toggle are documented as alternatives to each other.
		expect(groupOf("Toggle")).toBe(groupOf("Switch"))
		// OverflowMenu is the "more actions" button, filed with the actions it sits
		// beside (Button's main-action-with-options pattern), not with menus.
		expect(groupOf("OverflowMenu")).toBe(groupOf("Button"))
		// Three ways to reveal more content, previously in three groups.
		expect(groupOf("ShowMore")).toBe(groupOf("Pagination"))
		expect(groupOf("ShowMore")).toBe(groupOf("Pagination"))
		// Form vocabulary is filed by what it does, not by where it is used —
		// ColorField's own design note calls it "generic form vocabulary", and it
		// was nonetheless filed under a "Workspace" group before this contract.
		expect(groupOf("ColorField")).toBe("Forms")
		expect(groupOf("ScrubField")).toBe("Forms")
		// A reading of a value within a range is data, not loading.
		expect(groupOf("Meter")).toBe("Data display")
		// The selection controls stay together however the Forms split moves.
		for (const n of ["Checkbox", "Radio", "Switch", "Select", "Combobox", "Slider"])
			expect(groupOf(n), n).toBe("Selection")
	})

	it("sizes every group for scanning", () => {
		// The Oct 2026 review split Forms (27), Data Display (21) and Status (17)
		// because a reader could not find a checkbox or a spinner in them. A group
		// past 15 is a list, not a group; under 3 is a group nobody looks for.
		for (const group of COMPONENT_GROUPS) {
			const n = componentsInGroup(group).length
			expect(n, `${group} has ${n} members`).toBeGreaterThanOrEqual(3)
			expect(n, `${group} has ${n} members`).toBeLessThanOrEqual(15)
		}
	})

	it("orders groups and their members alphabetically", () => {
		// A–Z needs no learning: a reader finds "Status" or "Tooltip" by the
		// alphabet, not by knowing the system's reading order. Members sort by
		// the label shown in the nav, not the export name.
		const sorted = (xs: readonly string[]) => [...xs].sort((a, b) => a.localeCompare(b))
		expect([...COMPONENT_GROUPS]).toEqual(sorted(COMPONENT_GROUPS))
		for (const group of COMPONENT_GROUPS) {
			const labels = componentsInGroup(group).map(componentLabel)
			expect(labels, group).toEqual(sorted(labels))
		}
	})

	it("files only conversation-only components under Chat & AI", () => {
		// The one deliberate exception to grouping by kind, made for finding. It
		// stays narrow by rule: a member must have no meaning outside a
		// conversation. Generic pieces used in chats (Button, Avatar, Textarea,
		// Spinner) keep their kind's home — this list is the whole membership, so
		// adding to it is a decision someone has to make here, in review.
		expect(componentsInGroup("Chat & AI")).toEqual([
			"Attachment",
			"Bubble",
			"ChatComposer",
			"Marker",
			"Message",
			"MessageScroller",
			"StreamingText",
			"ThinkingOrb",
		])
	})

	it("does NOT group by co-occurrence, however tempting the graph looks", () => {
		// Two hypotheses the audit's crossing-link metric suggested, and that
		// re-measuring after the move disproved. Both are asserted in their
		// corrected form so the tempting version cannot quietly return.
		//
		// 1. StatusDot looks like it belongs with Toast/Banner. Moving
		//    them there took Data Display ↔ Status from 14 crossings to 21: they
		//    relate to Badge, Pill and Entity, which is a badge-shaped argument.
		expect(COMPONENT_TAXONOMY.StatusDot?.[0]).toBe(COMPONENT_TAXONOMY.Badge?.[0])
	})

	it("derives slugs and labels, with overrides only where they are shorter", () => {
		expect(componentSlug("PanelGroup")).toBe("panel-group")
		expect(componentSlug("Kbd")).toBe("kbd")
		expect(componentLabel("PanelGroup")).toBe("Panel Group")
		// An override must be SHORTER than the derived label, or it is just a
		// second copy of the name waiting to drift.
		for (const name of Object.keys(COMPONENT_TAXONOMY)) {
			const derived = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
			const label = componentLabel(name)
			// The one other legitimate override: casing an acronym ("Otp Field" →
			// "OTP Field"). Same letters, so it cannot drift from the name.
			if (label !== derived && label.toLowerCase() !== derived.toLowerCase())
				expect(label.length).toBeLessThan(derived.length)
		}
	})

	it("lists every group non-empty", () => {
		for (const group of COMPONENT_GROUPS) {
			const members = componentsInGroup(group)
			expect(members.length, `${group} is empty`).toBeGreaterThan(0)
		}
	})
})
