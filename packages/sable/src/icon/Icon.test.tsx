import { render } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { fallbackIconSet, reiconIconSet } from "../icon-sets/reicon"
import { Icon, MISSING_ICON_PROVIDER, missingIconMessage } from "./Icon"
import { ICON_ALIASES, ICON_NAMES, nearestIconNames, resolveIconAlias } from "./names"
import { IconProvider } from "./IconProvider"
import { composeIconSets } from "./compose"

describe("Icon sets and overrides", () => {
	it("renders the provider's Reicon set, including solid weights and labels", () => {
		for (const variant of ["regular", "solid"]) {
			const props = { name: "heart", variant, title: "Favorite", className: "text-primary", spin: true }
			expect(renderToStaticMarkup(<IconProvider set={reiconIconSet}><Icon {...props} /></IconProvider>)).toBe(
				renderToStaticMarkup(<>{reiconIconSet(props)}</>),
			)
		}
	})

	it("renders nothing without a provider, and warns once naming the fix", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
		try {
			const { container } = render(<><Icon name="heart" /><Icon name="search" /></>)
			expect(container.innerHTML).toBe("")
			render(<Icon name="gear" />)
			const calls = warn.mock.calls.filter(([message]) => message === MISSING_ICON_PROVIDER)
			// Once per page, however many icons render without a set.
			expect(calls).toHaveLength(1)
			expect(MISSING_ICON_PROVIDER).toContain('<IconProvider set={reiconIconSet}> from "@sableui/react/icons/reicon"')
		} finally {
			warn.mockRestore()
		}
	})

	it("lets a complete replacement set control glyphs and the default variant", () => {
		const replacement = ({ name, variant }: { name: string; variant: string }) => <span data-icon={name} data-weight={variant} />
		const { container } = render(<IconProvider set={replacement} defaultVariant="custom"><Icon name="search" /></IconProvider>)
		expect(container.querySelector('[data-icon="search"][data-weight="custom"]')).not.toBeNull()
		expect(container.querySelector("svg")).toBeNull()
	})

	it("allows additions to fall through to Reicon without overriding unknown names", () => {
		const additions = ({ name }: { name: string }) => name === "domain-icon" ? <span data-domain-icon /> : null
		const { container } = render(<IconProvider set={composeIconSets(additions, reiconIconSet)}><Icon name="domain-icon" /><Icon name="search" /><Icon name="unknown" /></IconProvider>)
		expect(container.querySelector("[data-domain-icon]")).not.toBeNull()
		expect(container.querySelectorAll("svg")).toHaveLength(1)
	})

	it("preserves the old export only as a Reicon alias, on the Reicon subpath", () => {
		expect(fallbackIconSet).toBe(reiconIconSet)
	})
})

describe("Icon names the set does not have", () => {
	const recorder = () => {
		const asked: string[] = []
		const set = ({ name }: { name: string }) => {
			asked.push(name)
			return name === "circle-check" || name === "gear" ? <span data-icon={name} /> : null
		}
		return { asked, set }
	}

	it("draws another library's spelling through the contract name", () => {
		const { asked, set } = recorder()
		const { container } = render(<IconProvider set={set}><Icon name="check-circle" /><Icon name="settings" /></IconProvider>)
		expect(container.querySelector('[data-icon="circle-check"]')).not.toBeNull()
		expect(container.querySelector('[data-icon="gear"]')).not.toBeNull()
		// The set is asked for the name first, so an app that maps "settings" itself wins.
		expect(asked.slice(0, 2)).toEqual(["check-circle", "circle-check"])
	})

	it("warns once per missing name in development, naming the nearest contract names", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
		try {
			const { set } = recorder()
			const { container } = render(
				<IconProvider set={set}>
					<Icon name="userz-missing" />
					<Icon name="userz-missing" />
					<Icon name="another-missing-glyph" />
				</IconProvider>,
			)
			expect(container.innerHTML).toBe("")
			const messages = warn.mock.calls.map(([m]) => String(m)).filter((m) => m.includes("resolved to nothing"))
			expect(messages).toHaveLength(2)
			expect(messages[0]).toBe(missingIconMessage("userz-missing"))
			expect(messages[0]).toContain("Nearest contract names:")
		} finally {
			warn.mockRestore()
		}
	})

	it("does not warn when a composed set falls through to one that has the name", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
		try {
			const first = () => null
			render(<IconProvider set={composeIconSets(first, reiconIconSet)}><Icon name="kanban" /></IconProvider>)
			expect(warn.mock.calls.filter(([m]) => String(m).includes("resolved to nothing"))).toHaveLength(0)
		} finally {
			warn.mockRestore()
		}
	})

	it("suggests names that share a word first", () => {
		expect(nearestIconNames("user-avatar")).toContain("user")
		expect(nearestIconNames("chevrons-down")[0]).toBe("chevron-down")
	})

	it("aliases only to contract names, never to itself", () => {
		for (const [alias, target] of Object.entries(ICON_ALIASES)) {
			expect(ICON_NAMES, `${alias} → ${target}`).toContain(target)
			expect(alias).not.toBe(target)
			// An alias must not shadow a real contract name.
			expect(ICON_NAMES as readonly string[], alias).not.toContain(alias)
		}
		expect(resolveIconAlias("gear")).toBeUndefined()
		expect(resolveIconAlias("menu")).toBe("bars")
	})
})
