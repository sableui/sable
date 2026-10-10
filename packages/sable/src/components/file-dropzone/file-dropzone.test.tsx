import { fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { FileDropzone, formatFileSize } from "./file-dropzone"

const file = (name: string, type: string, size = 10) =>
	new File([new Uint8Array(size)], name, { type })

function dropOn(target: Element, files: File[]) {
	const dataTransfer = { files, types: ["Files"], dropEffect: "none" }
	fireEvent.dragEnter(target, { dataTransfer })
	fireEvent.dragOver(target, { dataTransfer })
	fireEvent.drop(target, { dataTransfer })
}

describe("FileDropzone", () => {
	it("is a button that opens the picker, and accepts picked files", async () => {
		const user = userEvent.setup()
		const onFilesAccepted = vi.fn()
		const { container } = renderWithProviders(
			<FileDropzone onFilesAccepted={onFilesAccepted} />,
		)
		const button = screen.getByRole("button", { name: /drop a file here/i })
		const input = container.querySelector('input[type="file"]') as HTMLInputElement
		const click = vi.spyOn(input, "click")
		await user.click(button)
		expect(click).toHaveBeenCalled()

		await user.upload(input, file("a.png", "image/png"))
		expect(onFilesAccepted).toHaveBeenCalledWith([expect.objectContaining({ name: "a.png" })])
	})

	it("checks accept and maxSize on drop, and announces how to fix it", () => {
		const onFilesAccepted = vi.fn()
		const onFilesRejected = vi.fn()
		renderWithProviders(
			<FileDropzone
				multiple
				accept="image/*,.pdf"
				acceptLabel="an image or PDF"
				maxSize={100}
				onFilesAccepted={onFilesAccepted}
				onFilesRejected={onFilesRejected}
			/>,
		)
		const button = screen.getByRole("button")
		dropOn(button, [
			file("ok.png", "image/png"),
			file("notes.txt", "text/plain"),
			file("huge.pdf", "application/pdf", 500),
		])
		expect(onFilesAccepted).toHaveBeenCalledWith([expect.objectContaining({ name: "ok.png" })])
		const codes = onFilesRejected.mock.calls[0][0].map((r: { code: string }) => r.code)
		expect(codes).toEqual(["file-invalid-type", "file-too-large"])

		const status = screen.getByRole("status")
		expect(status).toHaveTextContent("Use an image or PDF instead.")
		expect(status).toHaveTextContent("Choose a smaller file.")
		expect(button).toHaveAttribute("aria-invalid", "true")
		expect(button.getAttribute("aria-describedby")).toContain(status.id)
	})

	it("keeps one file when not multiple", () => {
		const onFilesAccepted = vi.fn()
		const onFilesRejected = vi.fn()
		renderWithProviders(
			<FileDropzone onFilesAccepted={onFilesAccepted} onFilesRejected={onFilesRejected} />,
		)
		dropOn(screen.getByRole("button"), [file("a.png", "image/png"), file("b.png", "image/png")])
		expect(onFilesAccepted.mock.calls[0][0]).toHaveLength(1)
		expect(onFilesRejected.mock.calls[0][0][0].code).toBe("too-many-files")
	})

	it("renders its status region before there is anything to announce", () => {
		renderWithProviders(<FileDropzone />)
		expect(screen.getByRole("status")).toBeEmptyDOMElement()
	})

	it("marks the zone while a file is dragged over it", () => {
		renderWithProviders(<FileDropzone />)
		const button = screen.getByRole("button")
		fireEvent.dragEnter(button, { dataTransfer: { types: ["Files"], files: [] } })
		expect(button).toHaveAttribute("data-dragging")
		fireEvent.dragLeave(button, { dataTransfer: { types: ["Files"], files: [] } })
		expect(button).not.toHaveAttribute("data-dragging")
	})

	it("ignores drops while disabled", () => {
		const onFilesAccepted = vi.fn()
		renderWithProviders(<FileDropzone disabled onFilesAccepted={onFilesAccepted} />)
		dropOn(screen.getByRole("button"), [file("a.png", "image/png")])
		expect(onFilesAccepted).not.toHaveBeenCalled()
	})

	it("formats sizes the way people read them", () => {
		expect(formatFileSize(512)).toBe("512 B")
		expect(formatFileSize(10 * 1024 * 1024)).toBe("10 MB")
		expect(formatFileSize(2.4 * 1024 * 1024)).toBe("2.4 MB")
	})
})
