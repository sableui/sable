import { render } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { reiconIconSet } from "../icon-sets/reicon"
import { Icon } from "./Icon"
import { IconProvider } from "./IconProvider"
import { composeIconSets } from "./compose"
import { fallbackIconSet } from "./fallback-set"

describe("Icon defaults and overrides", () => {
	it("renders Reicon without provider setup, including solid weights and labels", () => {
		for (const variant of ["regular", "solid"]) {
			const props = { name: "heart", variant, title: "Favorite", className: "text-primary", spin: true }
			expect(renderToStaticMarkup(<Icon {...props} />)).toBe(renderToStaticMarkup(<>{reiconIconSet(props)}</>))
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

	it("preserves the old export only as a Reicon alias", () => {
		expect(fallbackIconSet).toBe(reiconIconSet)
	})
})
