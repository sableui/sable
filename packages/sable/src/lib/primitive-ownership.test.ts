import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * One owner per primitive.
 *
 * Every consolidation in the 0.65 review had the same cause: a second component
 * wrapped the same Base UI primitive (or react-day-picker) and then drifted from
 * the first. MultiSelect re-wrapped Combobox and lost its glide, density and
 * size ladder; DateTimePicker and DatePicker each kept a private copy of
 * Calendar's day grid, with a different "today" and different nav buttons;
 * Lightbox re-wrapped Dialog to change a scrim.
 *
 * So the import itself is the contract: a primitive is wrapped by its owner,
 * and anything else that needs it composes the owner — or extends it with a
 * prop (Combobox `multiple`, DatePicker `granularity`, DialogContent
 * `size="fullscreen"`). A second owner is a decision, recorded here with its
 * reason, not something that appears in a diff.
 */
const OWNERS: Record<string, { owners: string[]; why?: string }> = {
	"@base-ui/react/accordion": { owners: ["accordion"] },
	"@base-ui/react/alert-dialog": { owners: ["dialog"] },
	"@base-ui/react/avatar": {
		owners: ["avatar", "media-image"],
		why: "Both take Base UI's image-load status, not a copy of it. Avatar's frame is a circle with a size ladder and an initials tier; a cover is none of those, so MediaImage composes the primitive rather than restyling Avatar out of its shape.",
	},
	"@base-ui/react/checkbox": {
		owners: ["checkbox", "checkbox-card"],
		why: "Base UI has no card root; the card shell itself is shared (lib/selection-card).",
	},
	"@base-ui/react/checkbox-group": { owners: ["checkbox-card"] },
	"@base-ui/react/collapsible": { owners: ["collapsible"] },
	"@base-ui/react/combobox": { owners: ["combobox"] },
	"@base-ui/react/context-menu": { owners: ["context-menu"] },
	"@base-ui/react/dialog": { owners: ["dialog"] },
	"@base-ui/react/drawer": { owners: ["sheet"] },
	"@base-ui/react/field": { owners: ["form", "textarea"] },
	"@base-ui/react/fieldset": { owners: ["fieldset"] },
	"@base-ui/react/form": { owners: ["form"] },
	"@base-ui/react/input": { owners: ["input"] },
	"@base-ui/react/menu": { owners: ["menu"] },
	"@base-ui/react/meter": { owners: ["meter"] },
	"@base-ui/react/number-field": { owners: ["number-field"] },
	"@base-ui/react/otp-field": { owners: ["otp-field"] },
	"@base-ui/react/popover": { owners: ["popover"] },
	"@base-ui/react/preview-card": { owners: ["context-card"] },
	"@base-ui/react/progress": { owners: ["progress"] },
	"@base-ui/react/radio": {
		owners: ["radio", "radio-card", "theme-selector", "theme-switcher"],
		why: "Items inside Sable's RadioGroup: the theme pickers are radio items with a swatch body, not second groups.",
	},
	"@base-ui/react/radio-group": { owners: ["radio"] },
	"@base-ui/react/select": { owners: ["select"] },
	"@base-ui/react/separator": { owners: ["separator"] },
	"@base-ui/react/slider": { owners: ["slider"] },
	"@base-ui/react/switch": { owners: ["switch"] },
	"@base-ui/react/tabs": { owners: ["tabs"] },
	"@base-ui/react/toast": { owners: ["toast"] },
	"@base-ui/react/toggle": { owners: ["toggle"] },
	"@base-ui/react/toggle-group": { owners: ["toggle"] },
	"@base-ui/react/toolbar": { owners: ["toolbar"] },
	"@base-ui/react/tooltip": { owners: ["tooltip"] },
	"react-day-picker": { owners: ["calendar"], why: "DatePicker renders Calendar; type-only imports are fine." },
}

/** Helpers, not primitives: any component may use them. */
const UNOWNED = new Set(["@base-ui/react/use-render", "@base-ui/react/merge-props"])

const SRC = resolve(__dirname, "..")

function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name)
		if (statSync(path).isDirectory()) return sourceFiles(path)
		return /\.tsx?$/.test(name) && !/\.(test|meta)\.tsx?$/.test(name) ? [path] : []
	})
}

/** components/<folder>/… → folder; anything else → its path under src. */
function ownerOf(file: string): string {
	const rel = relative(SRC, file).replaceAll("\\", "/")
	return rel.startsWith("components/") ? rel.split("/")[1] : rel
}

function imports(): Array<{ module: string; owner: string; file: string }> {
	const out = []
	for (const file of sourceFiles(SRC)) {
		const text = readFileSync(file, "utf8")
		// Value imports only: `import type` carries no runtime wrapper.
		for (const m of text.matchAll(/^import\s+(?!type\s)(?:(?!^import\b)[\s\S])*?from\s+"(@base-ui\/react\/[a-z-]+|react-day-picker)"/gm)) {
			out.push({ module: m[1], owner: ownerOf(file), file: relative(SRC, file).replaceAll("\\", "/") })
		}
	}
	return out
}

describe("primitive ownership", () => {
	const found = imports()

	it("wraps each primitive only in its owner", () => {
		const strays = found
			.filter(({ module }) => !UNOWNED.has(module))
			.filter(({ module, owner }) => !OWNERS[module]?.owners.includes(owner))
			.map(({ module, file }) =>
				OWNERS[module]
					? `${file} wraps ${module}, owned by ${OWNERS[module].owners.join(" / ")} — compose or extend the owner`
					: `${file} wraps ${module}, which has no owner yet — add it to OWNERS in this test`,
			)
		expect(strays).toEqual([])
	})

	it("lists no owner that no longer wraps its primitive", () => {
		// A stale entry would quietly license a second wrapper later.
		const stale = Object.entries(OWNERS).flatMap(([module, { owners }]) =>
			owners
				.filter((owner) => !found.some((f) => f.module === module && f.owner === owner))
				.map((owner) => `${owner} no longer imports ${module}`),
		)
		expect(stale).toEqual([])
	})
})
