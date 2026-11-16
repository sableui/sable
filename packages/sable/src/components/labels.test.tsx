import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../test/render"
import { Attachment } from "./attachment/attachment"
import { Breadcrumbs } from "./breadcrumbs/breadcrumbs"
import { ChatComposer } from "./chat-composer/chat-composer"
import { CodeBlock } from "./code-block/code-block"
import { CommandMenuPanel } from "./command-menu/command-menu"
import { Dialog, DialogContent, DialogTitle } from "./dialog/dialog"
import { Feedback } from "./feedback/feedback"
import { Pagination } from "./pagination/pagination"
import { SearchInput } from "./search-input/search-input"
import { ShowMore } from "./show-more/show-more"
import { Video } from "./video/video"

/**
 * Every word a component supplies can be replaced (CONTRIBUTING.md → "Words a
 * component supplies"): one flat `<role>Label` prop per string, a function when
 * the string carries a value. Each case renders the English default and then a
 * translation, so a prop that is accepted but never reaches the element fails.
 */
describe("component-supplied labels", () => {
	it("Dialog: closeLabel names the built-in close at both sizes, and it keeps a touch target", () => {
		const { rerender } = renderWithProviders(
			<Dialog open>
				<DialogContent showCloseButton>
					<DialogTitle>Rename</DialogTitle>
				</DialogContent>
			</Dialog>,
		)
		const close = screen.getByRole("button", { name: "Close" })
		expect(close.className).toContain("pointer-coarse:before:size-[44px]")
		// `absolute` must win the merge over the target's `relative`, or the button
		// drops out of the corner into the flow.
		expect(close.className).toContain("absolute")
		expect(close.className).not.toMatch(/(^|\s)relative(\s|$)/)
		rerender(
			<Dialog open>
				<DialogContent size="fullscreen" closeLabel="Fermer">
					<DialogTitle>Photo</DialogTitle>
				</DialogContent>
			</Dialog>,
		)
		expect(screen.getByRole("button", { name: "Fermer" })).toBeInTheDocument()
	})

	it("Pagination: previous, next and each page", () => {
		renderWithProviders(
			<Pagination
				page={2}
				total={3}
				previousLabel="Page précédente"
				nextLabel="Page suivante"
				pageLabel={(page) => `Aller à la page ${page}`}
			/>,
		)
		expect(screen.getByRole("button", { name: "Page précédente" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Page suivante" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Aller à la page 2" })).toHaveAttribute("aria-current", "page")
	})

	it("Pagination: English defaults", () => {
		renderWithProviders(<Pagination page={1} total={2} />)
		expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled()
		expect(screen.getByRole("button", { name: "Page 2" })).toBeInTheDocument()
	})

	it("CodeBlock: copy and copied, in every layout", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined)
		Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true, writable: true })
		const { rerender } = renderWithProviders(<CodeBlock code="pnpm add x" prompt="$" />)
		expect(screen.getByRole("button", { name: "Copy command" }).className).toContain("pointer-coarse:before:size-[44px]")
		rerender(<CodeBlock code="const a = 1" filename="a.ts" copyLabel="Copier" copiedLabel="Copié" />)
		await userEvent.click(screen.getByRole("button", { name: "Copier" }))
		expect(await screen.findByRole("status")).toHaveTextContent("Copié")
		rerender(<CodeBlock code="const a = 1" />)
		expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument()
	})

	it("ChatComposer: the attach button", () => {
		renderWithProviders(<ChatComposer onSend={() => {}} onAttach={() => {}} attachLabel="Joindre un fichier" />)
		expect(screen.getByRole("button", { name: "Joindre un fichier" })).toBeInTheDocument()
	})

	it("SearchInput: the clear button", () => {
		renderWithProviders(<SearchInput defaultValue="ab" clearLabel="Effacer" />)
		expect(screen.getByRole("button", { name: "Effacer" })).toBeInTheDocument()
	})

	it("CommandMenu: the field, the clear button and the result count", async () => {
		renderWithProviders(
			<CommandMenuPanel
				items={[
					{ id: "a", label: "Ouvrir", group: "Fichier", onSelect: () => {} },
					{ id: "b", label: "Fermer", group: "Fichier", onSelect: () => {} },
				]}
				searchLabel="Rechercher une commande"
				clearLabel="Effacer"
				resultCountLabel={(count) => `${count} résultat(s)`}
			/>,
		)
		const field = screen.getByRole("combobox", { name: "Rechercher une commande" })
		await userEvent.type(field, "Ouv")
		expect(screen.getByRole("button", { name: "Effacer" })).toBeInTheDocument()
		expect(await screen.findByText("1 résultat(s)")).toBeInTheDocument()
	})

	it("Video: the placeholder play button", () => {
		renderWithProviders(<Video onRequestPlay={() => {}} playLabel="Lire la vidéo" />)
		expect(screen.getByRole("button", { name: "Lire la vidéo" })).toBeInTheDocument()
	})

	it("ShowMore: the toggle's two states", async () => {
		const height = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(400)
		renderWithProviders(
			<ShowMore collapsedHeight={40} moreLabel="Afficher plus" lessLabel="Afficher moins">
				<p>Long</p>
			</ShowMore>,
		)
		const toggle = await screen.findByRole("button", { name: "Afficher plus" })
		await userEvent.click(toggle)
		expect(screen.getByRole("button", { name: "Afficher moins" })).toBe(toggle)
		height.mockRestore()
	})

	it("Feedback: the rating row", async () => {
		renderWithProviders(<Feedback ratingLabel="Note" />)
		await userEvent.click(screen.getByRole("button", { name: "Feedback" }))
		expect(await screen.findByRole("group", { name: "Note" })).toBeInTheDocument()
	})

	it("Breadcrumbs and Attachment", () => {
		renderWithProviders(
			<>
				<Breadcrumbs aria-label="Fil d'Ariane" />
				<Attachment name="rapport.pdf" status="uploading" uploadingLabel="Envoi de rapport.pdf" />
			</>,
		)
		expect(screen.getByRole("navigation", { name: "Fil d'Ariane" })).toBeInTheDocument()
		expect(screen.getByRole("progressbar", { name: "Envoi de rapport.pdf" })).toBeInTheDocument()
	})
})
