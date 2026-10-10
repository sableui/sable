import { describe, expect, it } from "vitest"
import { cn } from "./cn"

describe("cn", () => {
	it("treats paired typography utilities as one group", () => {
		expect(cn("text-heading-1", "text-body-md")).toBe("text-body-md")
		// A UI tier must not be mistaken for a colour and drop the real colour.
		expect(cn("text-ui-md", "text-primary-foreground")).toBe("text-ui-md text-primary-foreground")
	})

	it("treats rounded-concentric-* as a border radius, in either order", () => {
		// A pill tab inside a card overrides its own rounded-sm with the frame's
		// concentric radius; unregistered, both survived and CSS order decided.
		expect(cn("rounded-sm px-3", "rounded-concentric-xl/2")).toBe("px-3 rounded-concentric-xl/2")
		expect(cn("rounded-concentric-xl/2", "rounded-md")).toBe("rounded-md")
		// Per-corner radii are a different group and survive.
		expect(cn("rounded-concentric-lg/1", "rounded-t-none")).toBe("rounded-concentric-lg/1 rounded-t-none")
	})
})
