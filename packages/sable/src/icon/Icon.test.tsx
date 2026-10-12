import { render } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { fallbackIconSet, reiconIconSet } from "../icon-sets/reicon"
import { Icon, MISSING_ICON_PROVIDER } from "./Icon"
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
