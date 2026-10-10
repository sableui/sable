import { describe, expect, it, vi } from "vitest"
import { fireEvent, renderWithProviders, screen } from "../../test/render"
import { Attachment } from "./index"

/**
 * The claim worth locking down here is the stretched trigger. The obvious
 * implementation — wrap the card in a `<button>` — nests the remove control
 * inside the open control: invalid HTML, one tab stop where there should be
 * two, and a click on "remove" that also opens the file. These tests assert the
 * shape that avoids it.
 */
describe("Attachment", () => {
	it("renders the trigger as a sibling of the actions, not their ancestor", () => {
		renderWithProviders(
			<Attachment
				name="proposal.pdf"
				onOpen={() => undefined}
				actions={
					<button type="button" aria-label="Remove proposal.pdf">
						x
					</button>
				}
			/>,
		)
		const open = screen.getByRole("button", { name: "Open proposal.pdf" })
		const remove = screen.getByRole("button", { name: "Remove proposal.pdf" })
		expect(open.contains(remove)).toBe(false)
		expect(remove.contains(open)).toBe(false)
	})

	it("opens on the card and removes on the action, never both", () => {
		const onOpen = vi.fn()
		const onRemove = vi.fn()
		renderWithProviders(
			<Attachment
				name="proposal.pdf"
				onOpen={onOpen}
				actions={
					<button type="button" aria-label="Remove" onClick={onRemove}>
						x
					</button>
				}
			/>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Remove" }))
		expect(onRemove).toHaveBeenCalledTimes(1)
		expect(onOpen).not.toHaveBeenCalled()

		fireEvent.click(screen.getByRole("button", { name: "Open proposal.pdf" }))
		expect(onOpen).toHaveBeenCalledTimes(1)
	})

	it("adds no trigger — and no tab stop — when there is nothing to open", () => {
		renderWithProviders(<Attachment name="proposal.pdf" />)
		expect(screen.queryByRole("button")).toBeNull()
	})

	it("keeps the filename selectable when the card is not a trigger", () => {
		const { container, rerender } = renderWithProviders(
			<Attachment name="proposal.pdf" />,
		)
		const nameOf = () =>
			document.querySelector("[data-slot=attachment-name]")?.parentElement
		expect(nameOf()?.className).not.toContain("pointer-events-none")

		// With a trigger, the label has to stop swallowing its clicks.
		rerender(<Attachment name="proposal.pdf" onOpen={() => undefined} />)
		expect(nameOf()?.className).toContain("pointer-events-none")
		expect(container).toBeTruthy()
	})

	it("takes a custom label for the trigger", () => {
		renderWithProviders(
			<Attachment
				name="proposal.pdf"
				onOpen={() => undefined}
				openLabel="Preview the proposal"
			/>,
		)
		expect(
			screen.getByRole("button", { name: "Preview the proposal" }),
		).toBeInTheDocument()
	})

	it("names the upload bar, and goes indeterminate without a number", () => {
		const { rerender } = renderWithProviders(
			<Attachment name="clip.mov" status="uploading" progress={62} />,
		)
		const bar = screen.getByRole("progressbar", { name: "Uploading clip.mov" })
		expect(bar).toHaveAttribute("aria-valuenow", "62")

		rerender(<Attachment name="clip.mov" status="uploading" />)
		expect(
			screen.getByRole("progressbar", { name: "Uploading clip.mov" }),
		).not.toHaveAttribute("aria-valuenow")
	})

	it("shows no bar once the transfer is done", () => {
		renderWithProviders(<Attachment name="clip.mov" />)
		expect(screen.queryByRole("progressbar")).toBeNull()
	})

	it("carries failure in text as well as colour", () => {
		const { container } = renderWithProviders(
			<Attachment
				name="clip.mov"
				status="error"
				meta="Upload failed — over the 50 MB limit"
			/>,
		)
		expect(
			screen.getByText("Upload failed — over the 50 MB limit"),
		).toBeInTheDocument()
		expect((container.firstElementChild as HTMLElement).dataset.status).toBe(
			"error",
		)
	})

	it("describes a media thumbnail and leaves a card thumbnail decorative", () => {
		renderWithProviders(
			<Attachment variant="media" name="cover.png" thumbnail="/c.png" />,
		)
		expect(screen.getByAltText("cover.png")).toBeInTheDocument()

		const { container } = renderWithProviders(
			<Attachment name="cover.png" thumbnail="/c.png" />,
		)
		// Beside a visible filename, describing the crop again would say it twice.
		expect(container.querySelector("img")).toHaveAttribute("alt", "")
	})

	it("truncates the stem and keeps the extension", () => {
		renderWithProviders(<Attachment name="quarterly-report-final.pdf" />)
		const name = document.querySelector("[data-slot=attachment-name]")
		expect(name).toHaveAttribute("title", "quarterly-report-final.pdf")
		const [stem, ext] = Array.from(name?.children ?? [])
		expect(stem.textContent).toBe("quarterly-report-final")
		expect(stem.className).toContain("truncate")
		expect(ext.textContent).toBe(".pdf")
		expect(ext.className).toContain("shrink-0")
	})

	it("floats actions over a media tile instead of pushing them out of it", () => {
		renderWithProviders(
			<Attachment
				variant="media"
				name="cover.png"
				thumbnail="/x.png"
				actions={<button type="button">Remove</button>}
			/>,
		)
		const wrap = screen.getByRole("button", { name: "Remove" }).parentElement
		expect(wrap?.className).toContain("absolute")
	})

	it("insets the trigger's focus ring so the card's clipping cannot hide it", () => {
		renderWithProviders(<Attachment name="a.pdf" onOpen={() => undefined} />)
		expect(screen.getByRole("button", { name: "Open a.pdf" }).className).toContain(
			"focus-visible:ring-inset",
		)
	})
})
