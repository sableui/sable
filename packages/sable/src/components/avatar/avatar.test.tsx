import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Avatar, AvatarGroup, AvatarGroupCount } from "./avatar"

describe("AvatarGroup", () => {
	it("is a labelled group", () => {
		render(
			<AvatarGroup aria-label="3 collaborators">
				<Avatar fallback="AC" />
				<Avatar fallback="ML" />
				<Avatar fallback="JL" />
			</AvatarGroup>,
		)
		const group = screen.getByRole("group", { name: "3 collaborators" })
		expect(group.children).toHaveLength(3)
	})

	it("collapses avatars past max into a +N count", () => {
		render(
			<AvatarGroup aria-label="5 people" max={2}>
				<Avatar fallback="A1" />
				<Avatar fallback="A2" />
				<Avatar fallback="A3" />
				<Avatar fallback="A4" />
				<Avatar fallback="A5" />
			</AvatarGroup>,
		)
		expect(screen.getByText("A2")).toBeTruthy()
		expect(screen.queryByText("A3")).toBeNull()
		const plus = screen.getByText("+3")
		expect(plus.getAttribute("aria-hidden")).toBe("true")
		expect(screen.getByText("and 3 more")).toBeTruthy()
	})

	it("counts against total when only some people are passed", () => {
		render(
			<AvatarGroup
				aria-label="12 attendees"
				total={12}
				countLabel={(n) => `and ${n} more attendees`}
			>
				<Avatar fallback="A1" />
				<Avatar fallback="A2" />
				<Avatar fallback="A3" />
			</AvatarGroup>,
		)
		expect(screen.getByText("+9")).toBeTruthy()
		expect(screen.getByText("and 9 more attendees")).toBeTruthy()
	})

	it("renders no count when everyone fits", () => {
		render(
			<AvatarGroup aria-label="2 people" max={3}>
				<Avatar fallback="A1" />
				<Avatar fallback="A2" />
			</AvatarGroup>,
		)
		expect(screen.queryByText(/more$/)).toBeNull()
	})

	it("with fit, shows only the avatars that fit and folds the rest into the count", () => {
		// jsdom has no layout: give every circle 32px, an 8px overlap (24px step),
		// and the group 90px — room for three circles, so two avatars + "+5".
		const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth")
		const left = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetLeft")
		const client = Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth")
		Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 32 })
		Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
			configurable: true,
			get(this: HTMLElement) {
				return Array.from(this.parentElement?.children ?? []).indexOf(this) * 24
			},
		})
		Object.defineProperty(Element.prototype, "clientWidth", { configurable: true, get: () => 90 })
		try {
			render(
				<AvatarGroup aria-label="7 attendees" total={7} fit>
					<Avatar fallback="MO" />
					<Avatar fallback="SR" />
					<Avatar fallback="JL" />
				</AvatarGroup>,
			)
			expect(screen.getByText("SR")).toBeTruthy()
			expect(screen.queryByText("JL")).toBeNull()
			expect(screen.getByText("+5")).toBeTruthy()
		} finally {
			if (width) Object.defineProperty(HTMLElement.prototype, "offsetWidth", width)
			if (left) Object.defineProperty(HTMLElement.prototype, "offsetLeft", left)
			if (client) Object.defineProperty(Element.prototype, "clientWidth", client)
		}
	})

	it("sizes every avatar from the group, overriding the child's own size", () => {
		render(
			<AvatarGroup aria-label="people" size="sm" max={1}>
				<Avatar fallback="A1" size="lg" />
				<Avatar fallback="A2" />
			</AvatarGroup>,
		)
		const group = screen.getByRole("group")
		for (const child of Array.from(group.children)) {
			expect(child.className).toContain("size-8")
			expect(child.className).not.toContain("size-12")
		}
	})

	it("rings children from the inherited --avatar-group-ring, set by surface", () => {
		render(
			<AvatarGroup aria-label="people" surface="card">
				<Avatar fallback="A1" />
			</AvatarGroup>,
		)
		const cls = screen.getByRole("group").className
		expect(cls).toContain("[--avatar-group-ring:var(--card)]")
		expect(cls).toContain("*:ring-[color:var(--avatar-group-ring,var(--background))]")
	})

	it("leaves the ring variable alone when surface is omitted", () => {
		render(
			<AvatarGroup aria-label="people">
				<Avatar fallback="A1" />
			</AvatarGroup>,
		)
		expect(screen.getByRole("group").className).not.toContain("[--avatar-group-ring:")
	})
})

describe("Avatar outside a group", () => {
	it("keeps its own size", () => {
		const { container } = render(<Avatar fallback="AM" size="lg" />)
		expect((container.firstChild as HTMLElement).className).toContain("size-12")
	})
})

describe("Avatar portrait sizes", () => {
	it("renders xl at 96px and 2xl at 160px, with initials on the matching tier", () => {
		const xl = render(<Avatar fallback="LV" size="xl" />).container.firstChild as HTMLElement
		expect(xl.className).toContain("size-24")
		expect(xl.className).toContain("text-heading-2")
		const xxl = render(<Avatar fallback="LV" size="2xl" />).container.firstChild as HTMLElement
		expect(xxl.className).toContain("size-40")
		expect(xxl.className).toContain("text-display-lg")
	})

	// At row scale a StatusDot is about a quarter of the circle; left unscaled
	// on a 160px portrait it shrinks to a speck.
	it("scales the status indicator with the portrait, and only there", () => {
		const slot = (size: "lg" | "xl" | "2xl") => {
			const { container } = render(<Avatar fallback="LV" size={size} status={<span />} />)
			return container.querySelector<HTMLElement>("[data-slot=avatar-status]")!.className
		}
		expect(slot("lg")).not.toMatch(/scale-/)
		expect(slot("xl")).toContain("scale-200")
		expect(slot("2xl")).toContain("scale-250")
	})

	it("keeps the art fallback filling the portrait", () => {
		const { container } = render(<Avatar variant="art" fallback="LV" alt="Lena Vale" size="2xl" />)
		const art = container.querySelector<HTMLElement>('[data-slot="gradient-art"]')
		expect(art).toHaveTextContent("LV")
		expect(art?.className).toContain("size-full")
	})
})

describe("AvatarGroupCount", () => {
	it("shows +N and reads a custom label", () => {
		render(<AvatarGroupCount count={4} label="and 4 more reviewers" />)
		expect(screen.getByText("+4").getAttribute("aria-hidden")).toBe("true")
		expect(screen.getByText("and 4 more reviewers").className).toContain("sr-only")
	})
})

describe("Avatar status", () => {
	it("pins the indicator outside the clipped circle, ringed in the surface colour", () => {
		render(<Avatar fallback="NR" alt="Nova Reed" status={<span data-testid="dot" />} />)
		const slot = screen.getByTestId("dot").parentElement as HTMLElement
		expect(slot.dataset.slot).toBe("avatar-status")
		expect(slot.className).toContain("absolute")
		expect(slot.className).toContain("*:ring-2")
		const anchor = slot.parentElement as HTMLElement
		expect(anchor.dataset.slot).toBe("avatar-status-anchor")
		// The indicator is a sibling of the clipping root, not inside it.
		expect(anchor.firstElementChild?.className).toContain("overflow-hidden")
		expect(anchor.firstElementChild?.contains(slot)).toBe(false)
	})

	it("renders no anchor without a status", () => {
		const { container } = render(<Avatar fallback="AM" />)
		expect(container.querySelector("[data-slot=avatar-status-anchor]")).toBeNull()
	})
})

describe("Avatar without an image", () => {
	it("is named by alt instead of reading out the initials", () => {
		render(<Avatar fallback="AM" alt="Alex Morgan" />)
		expect(screen.getByRole("img", { name: "Alex Morgan" })).toBeTruthy()
	})
})

describe("Avatar art fallback", () => {
	const art = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-slot="gradient-art"]')

	it("paints the initials over art and keeps the name from alt", () => {
		const { container } = render(<Avatar variant="art" fallback="MO" alt="Mara Okafor" />)
		expect(art(container)).toHaveTextContent("MO")
		expect(screen.getByRole("img", { name: "Mara Okafor" })).toBeTruthy()
	})

	it("gives each person their own art, and keeps it wherever they appear", () => {
		const paint = (fallback: string, alt: string) => art(render(<Avatar variant="art" fallback={fallback} alt={alt} />).container)?.style.background
		// Seeded by the initials, so a decorative repeat (alt="") matches the named avatar.
		expect(paint("AL", "Ada Lovelace")).toBe(paint("AL", ""))
		expect(paint("AL", "Ada Lovelace")).not.toBe(paint("MO", "Mara Okafor"))
	})

	it("stays neutral by default", () => {
		const { container } = render(<Avatar fallback="MO" alt="Mara Okafor" />)
		expect(art(container)).toBeNull()
	})
})
