import { act, render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { axe } from "jest-axe"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { IconProvider } from "../../icon"
import { reiconIconSet } from "../../icon-sets/reicon"
import { Tree, TreeAddRow, TreeEmpty, TreeRow, TreeSection, treeIndent } from "./tree"

describe("treeIndent", () => {
	it("puts depth 0 on the rail and adds one indent step per level", () => {
		expect(treeIndent(0)).toBe("calc(var(--tree-rail) + var(--tree-indent) * 0)")
		expect(treeIndent(2)).toBe("calc(var(--tree-rail) + var(--tree-indent) * 2)")
	})

	it("resolves the inset through the density ladder rather than literal pixels", () => {
		// The whole point of returning calc() is that a data-density scope or a theme
		// retunes the tree without any consumer recomputing numbers. A px number here
		// would silently freeze the geometry at one density.
		expect(treeIndent(1)).toContain("var(--tree-rail)")
		expect(treeIndent(1)).toContain("var(--tree-indent)")
		expect(treeIndent(1)).not.toMatch(/\d+px/)
	})

	it("clamps a negative depth to the rail", () => {
		expect(treeIndent(-3)).toBe(treeIndent(0))
	})
})

describe("TreeRow", () => {
	it("indents by depth and keeps every row on the same grid", () => {
		render(
			<Tree>
				<TreeRow depth={0}>Parent</TreeRow>
				<TreeRow depth={1}>Child</TreeRow>
			</Tree>,
		)
		expect(screen.getByText("Parent").closest("div")).toHaveStyle({
			paddingInlineStart: treeIndent(0),
		})
		expect(screen.getByText("Child").closest("div")).toHaveStyle({
			paddingInlineStart: treeIndent(1),
		})
	})

	it("reserves both leading columns on a leaf, so names align with parents", () => {
		// This is the assertion that protects the alignment: a leaf that skips its
		// disclosure slot pulls its name one column left of every sibling.
		const { container } = render(<TreeRow depth={0}>Leaf</TreeRow>)
		const spans = [...container.querySelectorAll("span[aria-hidden]")]
		const columns = spans.filter(
			(el) => (el as HTMLElement).style.width === "var(--tree-column)",
		)
		expect(columns).toHaveLength(2)
	})

	it("exposes the disclosure as a labelled button and does not select when toggled", async () => {
		const onExpandedChange = vi.fn()
		const onClick = vi.fn()
		render(
			<TreeRow
				depth={0}
				expandable
				expanded
				toggleLabel="Backdrop"
				onExpandedChange={onExpandedChange}
				onClick={onClick}
			>
				Backdrop
			</TreeRow>,
		)
		const toggle = screen.getByRole("button", { name: "Collapse Backdrop" })
		expect(toggle).toHaveAttribute("aria-expanded", "true")

		await userEvent.click(toggle)
		expect(onExpandedChange).toHaveBeenCalledWith(false)
		// Collapsing a group must not change the selection.
		expect(onClick).not.toHaveBeenCalled()
	})

	it("gives the disclosure a target bigger than the glyph it draws", () => {
		// WCAG 2.5.8 wants 24x24. --tree-column is 20px comfortable and 18px
		// compact, so the drawn box cannot be the target: a centred pseudo-element
		// at --control-xs (28/24) takes the hit instead. jsdom does no layout, so
		// this asserts the structural claim — the box the button DRAWS in is still
		// the column, and the box it CATCHES in is the row height.
		render(
			<TreeRow depth={0} expandable expanded toggleLabel="Backdrop">
				Backdrop
			</TreeRow>,
		)
		const toggle = screen.getByRole("button", { name: "Collapse Backdrop" })
		expect(toggle).toHaveStyle({ width: "var(--tree-column)" })
		expect(toggle.className).toContain("before:size-(--control-xs)")
		// Centred on the glyph, or the target drifts off the mark it belongs to.
		expect(toggle.className).toContain("before:-translate-x-1/2")
		expect(toggle.className).toContain("before:-translate-y-1/2")
		// A positioned pseudo-element needs a positioned ancestor to resolve against.
		expect(toggle.className).toContain("relative")
	})

	it("keeps the enlarged target off the row's own geometry", () => {
		// The failure this guards against is fixing the target by growing the
		// button: --tree-column drives the indent step, so a bigger box would push
		// every name in the tree one column right.
		const { container } = render(
			<TreeRow depth={0} expandable expanded toggleLabel="Backdrop">
				Backdrop
			</TreeRow>,
		)
		const columns = [...container.querySelectorAll("button, span[aria-hidden]")].filter(
			(el) => (el as HTMLElement).style.width === "var(--tree-column)",
		)
		expect(columns).toHaveLength(2)
	})

	it("renders the icon and actions slots", () => {
		render(
			<TreeRow depth={0} icon={<span>kind</span>} actions={<button type="button">hide</button>}>
				Backdrop
			</TreeRow>,
		)
		expect(screen.getByText("kind")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "hide" })).toBeInTheDocument()
	})
})

describe("TreeAddRow", () => {
	it("sits at the depth of the branch it adds to", () => {
		render(<TreeAddRow depth={1} label="Add effect" />)
		expect(screen.getByRole("button", { name: "Add effect" })).toHaveStyle({
			paddingInlineStart: treeIndent(1),
		})
	})

	it("reserves the disclosure column so its mark lands in the type column", () => {
		// The mark must be level with the kind-markers of its siblings. Reserving
		// only one column puts it in the disclosure column; reserving none puts it on
		// the rail; reserving both plus a third would push it into the name column.
		// Exactly one reserved slot, then the marked slot.
		const { container } = render(
			<IconProvider set={reiconIconSet}>
				<TreeAddRow depth={0} label="Add effect" />
			</IconProvider>,
		)
		const columns = [...container.querySelectorAll("span[aria-hidden]")].filter(
			(el) => (el as HTMLElement).style.width === "var(--tree-column)",
		)
		expect(columns).toHaveLength(2)
		expect(columns[0]?.querySelector("svg")).toBeNull() // disclosure slot: empty
		expect(columns[1]?.querySelector("svg")).not.toBeNull() // type slot: the mark
	})

	it("always carries a visible label, not a bare glyph", () => {
		render(<TreeAddRow depth={0} label="Add image" />)
		expect(screen.getByText("Add image")).toBeVisible()
	})

	it("uses the selected icon set for its add mark", () => {
		const { container } = render(
			<IconProvider set={({ name }) => <span data-icon={name} />}>
				<TreeAddRow depth={0} label="Add effect" />
			</IconProvider>,
		)
		expect(container.querySelector('[data-icon="plus"]')).not.toBeNull()
		expect(container.querySelector("svg")).toBeNull()
	})
})

describe("TreeEmpty", () => {
	it("keeps the message on the rail and on the row rhythm", () => {
		render(<TreeEmpty message="No images yet" />)
		const p = screen.getByText("No images yet")
		expect(p).toHaveStyle({ paddingInlineStart: treeIndent(0) })
		// h-(--control-xs) — an empty state that sets its own vertical padding
		// breaks the rhythm the rest of the panel keeps.
		expect(p.className).toContain("h-(--control-xs)")
	})

	it("starts a nested empty branch on its rows' edge via depth", () => {
		render(<TreeEmpty depth={1} message="No effects yet" />)
		expect(screen.getByText("No effects yet")).toHaveStyle({ paddingInlineStart: treeIndent(1) })
	})

	it("inherits the depth inside a subtree", () => {
		render(
			<TreeRow depth={0} subtree={<TreeEmpty message="No effects yet" />}>
				Backdrop
			</TreeRow>,
		)
		expect(screen.getByText("No effects yet")).toHaveStyle({ paddingInlineStart: treeIndent(1) })
	})

	it("slots the action rather than leaving it a sibling", () => {
		// The editorial rule the shape enforces: an empty section offers ONE way
		// forward. Prose plus an add row is two, and the prose carries no affordance.
		render(<TreeEmpty message="No images yet" action={<TreeAddRow depth={0} label="Add image" />} />)
		expect(screen.getByRole("button", { name: "Add image" })).toBeInTheDocument()
		expect(screen.getByText("No images yet")).toBeVisible()
	})

	it("drops the rail inset and marks itself when used as a drop region", () => {
		const { container } = render(<TreeEmpty dropTarget message="Drop an image" />)
		const root = container.firstElementChild as HTMLElement
		expect(root).toHaveAttribute("data-drop-target", "true")
		expect(root.className).toContain("border-dashed")
		// Centred inside its own frame, so the rail would fight it.
		expect(screen.getByText("Drop an image")).not.toHaveStyle({
			paddingInlineStart: "var(--tree-rail)",
		})
	})

	it("does not set data-drop-target when it is a plain empty state", () => {
		const { container } = render(<TreeEmpty message="Nothing here" />)
		expect(container.firstElementChild).not.toHaveAttribute("data-drop-target")
	})
})

describe("TreeSection", () => {
	it("puts the header on the rail, level with a depth-0 row", () => {
		render(
			<Tree>
				<TreeSection title="Layers">
					<TreeRow depth={0}>Backdrop</TreeRow>
				</TreeSection>
			</Tree>,
		)
		const header = screen.getByRole("heading", { name: "Layers" }).parentElement
		expect(header).toHaveStyle({ paddingInlineStart: "var(--tree-rail)" })
	})

	it("renders the title as a heading with its hint and action", () => {
		render(
			<TreeSection title="Document effects" hint="Applied to the composite" action={<span>2</span>}>
				<TreeRow depth={0}>Shift</TreeRow>
			</TreeSection>,
		)
		expect(screen.getByRole("heading", { name: "Document effects" })).toHaveAttribute(
			"title",
			"Applied to the composite",
		)
		expect(screen.getByText("2")).toBeInTheDocument()
	})
})

describe("TreeRow selection", () => {
	it("exposes selection to assistive tech, not only as a styling hook", () => {
		// data-selected is for CSS. A screen reader user asking "which layer am I
		// acting on?" needs an ARIA attribute, and aria-current is the one valid
		// on a plain div — aria-selected would need an owning role.
		render(<TreeRow selected>Background</TreeRow>)
		expect(screen.getByText("Background").closest("div")).toHaveAttribute("aria-current", "true")
	})

	it("leaves aria-current off an unselected row", () => {
		render(<TreeRow>Background</TreeRow>)
		expect(screen.getByText("Background").closest("div")).not.toHaveAttribute("aria-current")
	})

	it("drops only the accent bar under accent={false}, keeping fill and aria-current", () => {
		const { container: withBar } = render(<TreeRow selected>Background</TreeRow>)
		const { container: without } = render(
			<TreeRow selected accent={false}>
				Background
			</TreeRow>,
		)
		// Select on the bar's own fill: a row reserves an aria-hidden disclosure
		// slot too, so "any hidden span" would match whether or not the bar drew.
		expect(withBar.querySelector("span.bg-primary")).toBeInTheDocument()
		expect(without.querySelector("span.bg-primary")).not.toBeInTheDocument()
		// The fill and the ARIA state are the signal that must survive.
		expect(without.firstElementChild).toHaveClass("bg-panel-raised")
		expect(without.firstElementChild).toHaveAttribute("aria-current", "true")
	})
})

/* --- Tree view semantics and keyboard ------------------------------------
   The file-tree shape: nested via `subtree`, uncontrolled via defaultExpanded.
   src (open) > index.ts, components (closed) > button.tsx ; README.md
   Visible treeitems in order: src, index.ts, components, README.md */
function Files({ onOpen = () => {} }: { onOpen?: () => void }) {
	return (
		<Tree aria-label="Files">
			<TreeRow
				icon={<span>dir</span>}
				subtree={
					<>
						<TreeRow icon={<span>doc</span>}>index.ts</TreeRow>
						<TreeRow
							defaultExpanded={false}
							subtree={<TreeRow>button.tsx</TreeRow>}
							actions={<button type="button">More</button>}
						>
							components
						</TreeRow>
					</>
				}
			>
				src
			</TreeRow>
			<TreeRow onClick={onOpen}>README.md</TreeRow>
		</Tree>
	)
}

describe("Tree — ARIA tree view", () => {
	it("is a tree of treeitems with level, expansion and selection state", () => {
		render(<Files />)
		expect(screen.getByRole("tree", { name: "Files" })).toBeInTheDocument()
		expect(screen.getAllByRole("treeitem")).toHaveLength(4)
		const src = screen.getByRole("treeitem", { name: "src" })
		expect(src).toHaveAttribute("aria-expanded", "true")
		expect(src).toHaveAttribute("aria-level", "1")
		const index = screen.getByRole("treeitem", { name: "index.ts" })
		expect(index).toHaveAttribute("aria-level", "2")
		expect(index).toHaveAttribute("aria-selected", "false")
		expect(index).not.toHaveAttribute("aria-expanded")
		expect(screen.getByRole("treeitem", { name: "components" })).toHaveAttribute(
			"aria-expanded",
			"false",
		)
	})

	it("names a treeitem by its own label, not its action buttons", () => {
		render(<Files />)
		expect(screen.getByRole("treeitem", { name: "components" })).toHaveAccessibleName(
			"components",
		)
	})

	it("maps selection to aria-selected inside a Tree, aria-current outside", () => {
		render(
			<Tree aria-label="Layers">
				<TreeRow selected>Inside</TreeRow>
			</Tree>,
		)
		render(<TreeRow selected>Outside</TreeRow>)
		const inside = screen.getByRole("treeitem", { name: "Inside" })
		expect(inside).toHaveAttribute("aria-selected", "true")
		expect(inside).not.toHaveAttribute("aria-current")
		expect(screen.getByText("Outside").closest("div")).toHaveAttribute("aria-current", "true")
	})

	it("inherits depth from the parent row and keeps the indent invariant", () => {
		render(<Files />)
		expect(screen.getByRole("treeitem", { name: "index.ts" })).toHaveStyle({
			paddingInlineStart: treeIndent(1),
		})
	})

	it("labels a section as a group inside a tree", () => {
		render(
			<Tree aria-label="Panel">
				<TreeSection title="Layers">
					<TreeRow>Backdrop</TreeRow>
					<TreeAddRow label="Add image" />
				</TreeSection>
			</Tree>,
		)
		expect(screen.getByRole("group", { name: "Layers" })).toBeInTheDocument()
		expect(screen.getByRole("treeitem", { name: "Add image" })).toHaveAttribute(
			"aria-level",
			"1",
		)
	})
})

describe("Tree — uncontrolled expansion", () => {
	it("hides a collapsed row's subtree and opens it from the disclosure", async () => {
		render(<Files />)
		expect(screen.queryByText("button.tsx")).not.toBeInTheDocument()
		const components = screen.getByRole("treeitem", { name: "components" })
		// Inside a tree the disclosure is a pointer target only — the treeitem
		// carries aria-expanded, so the button is hidden from assistive tech.
		const toggle = components.querySelector("[data-tree-toggle]") as HTMLElement
		expect(toggle).toHaveAttribute("aria-hidden", "true")
		expect(toggle).toHaveAttribute("tabindex", "-1")
		await userEvent.click(toggle)
		expect(components).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByRole("treeitem", { name: "button.tsx" })).toBeInTheDocument()
	})

	it("toggles an expandable row with no onClick when the row is activated", async () => {
		render(<Files />)
		const src = screen.getByRole("treeitem", { name: "src" })
		await userEvent.click(screen.getByText("src"))
		expect(src).toHaveAttribute("aria-expanded", "false")
		expect(screen.queryByText("index.ts")).not.toBeInTheDocument()
	})

	it("still reports changes to onExpandedChange when uncontrolled", async () => {
		const onExpandedChange = vi.fn()
		render(
			<TreeRow
				defaultExpanded={false}
				onExpandedChange={onExpandedChange}
				toggleLabel="Group"
				subtree={<TreeRow>Child</TreeRow>}
			>
				Group
			</TreeRow>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Expand Group" }))
		expect(onExpandedChange).toHaveBeenCalledWith(true)
		expect(screen.getByText("Child")).toBeInTheDocument()
	})

	it("defers to `expanded` when controlled", async () => {
		const onExpandedChange = vi.fn()
		render(
			<TreeRow
				expanded={false}
				onExpandedChange={onExpandedChange}
				toggleLabel="Group"
				subtree={<TreeRow>Child</TreeRow>}
			>
				Group
			</TreeRow>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Expand Group" }))
		expect(onExpandedChange).toHaveBeenCalledWith(true)
		// The parent did not flip `expanded`, so nothing opens.
		expect(screen.queryByText("Child")).not.toBeInTheDocument()
	})
})

describe("Tree — roving tabindex", () => {
	it("keeps exactly one treeitem in the tab order", () => {
		render(<Files />)
		const [first, ...rest] = screen.getAllByRole("treeitem")
		expect(first).toHaveAttribute("tabindex", "0")
		for (const item of rest) expect(item).toHaveAttribute("tabindex", "-1")
	})

	it("seeds the tab stop on the selected row", () => {
		render(
			<Tree aria-label="Layers">
				<TreeRow>One</TreeRow>
				<TreeRow selected>Two</TreeRow>
			</Tree>,
		)
		expect(screen.getByRole("treeitem", { name: "Two" })).toHaveAttribute("tabindex", "0")
	})

	it("moves the tab stop with focus", async () => {
		render(<Files />)
		const src = screen.getByRole("treeitem", { name: "src" })
		src.focus()
		await userEvent.keyboard("{ArrowDown}")
		const index = screen.getByRole("treeitem", { name: "index.ts" })
		expect(index).toHaveFocus()
		expect(index).toHaveAttribute("tabindex", "0")
		expect(src).toHaveAttribute("tabindex", "-1")
	})

	it("re-seeds the tab stop when the row holding it is collapsed away", async () => {
		render(<Files />)
		screen.getByRole("treeitem", { name: "index.ts" }).focus()
		const src = screen.getByRole("treeitem", { name: "src" })
		await userEvent.click(src.querySelector("[data-tree-toggle]") as HTMLElement)
		const tabbable = screen.getAllByRole("treeitem").filter((el) => el.tabIndex === 0)
		expect(tabbable).toHaveLength(1)
	})
})

describe("Tree — keyboard navigation", () => {
	it("ArrowDown/ArrowUp walk the visible rows", async () => {
		render(<Files />)
		screen.getByRole("treeitem", { name: "src" }).focus()
		await userEvent.keyboard("{ArrowDown}{ArrowDown}")
		expect(screen.getByRole("treeitem", { name: "components" })).toHaveFocus()
		await userEvent.keyboard("{ArrowUp}")
		expect(screen.getByRole("treeitem", { name: "index.ts" })).toHaveFocus()
	})

	it("Home/End jump to the first and last visible row", async () => {
		render(<Files />)
		screen.getByRole("treeitem", { name: "index.ts" }).focus()
		await userEvent.keyboard("{End}")
		expect(screen.getByRole("treeitem", { name: "README.md" })).toHaveFocus()
		await userEvent.keyboard("{Home}")
		expect(screen.getByRole("treeitem", { name: "src" })).toHaveFocus()
	})

	it("ArrowRight expands a collapsed row, then steps to its first child", async () => {
		render(<Files />)
		const components = screen.getByRole("treeitem", { name: "components" })
		components.focus()
		await userEvent.keyboard("{ArrowRight}")
		expect(components).toHaveAttribute("aria-expanded", "true")
		expect(components).toHaveFocus()
		await userEvent.keyboard("{ArrowRight}")
		expect(screen.getByRole("treeitem", { name: "button.tsx" })).toHaveFocus()
	})

	it("ArrowLeft steps to the parent, then collapses it", async () => {
		render(<Files />)
		const components = screen.getByRole("treeitem", { name: "components" })
		components.focus()
		await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowLeft}")
		expect(components).toHaveFocus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(components).toHaveAttribute("aria-expanded", "false")
		expect(screen.queryByText("button.tsx")).not.toBeInTheDocument()
	})

	it("ArrowLeft on a collapsed row skips earlier siblings to reach the parent", async () => {
		render(<Files />)
		screen.getByRole("treeitem", { name: "components" }).focus()
		await userEvent.keyboard("{ArrowLeft}")
		expect(screen.getByRole("treeitem", { name: "src" })).toHaveFocus()
	})

	it("Enter activates a row; Space toggles a row with no onClick", async () => {
		const onOpen = vi.fn()
		render(<Files onOpen={onOpen} />)
		screen.getByRole("treeitem", { name: "README.md" }).focus()
		await userEvent.keyboard("{Enter}")
		expect(onOpen).toHaveBeenCalledOnce()
		const src = screen.getByRole("treeitem", { name: "src" })
		src.focus()
		await userEvent.keyboard(" ")
		expect(src).toHaveAttribute("aria-expanded", "false")
	})

	it("leaves keys pressed in a row's own controls alone", async () => {
		render(<Files />)
		const more = screen.getByRole("button", { name: "More" })
		more.focus()
		await userEvent.keyboard("{ArrowDown}")
		expect(more).toHaveFocus()
	})
})

describe("Tree — selectionFollowsFocus", () => {
	/** A layers list: each row selects on click, Shift extends from the anchor. */
	function Layers({ follows = true }: { follows?: boolean }) {
		const names = ["Title", "Photo", "Grain"]
		const [selected, setSelected] = useState<string[]>(["Title"])
		const [anchor, setAnchor] = useState("Title")
		const select = (name: string, shift: boolean) => {
			if (!shift) {
				setSelected([name])
				setAnchor(name)
				return
			}
			const [a, b] = [names.indexOf(anchor), names.indexOf(name)].sort((x, y) => x - y)
			setSelected(names.slice(a, b + 1))
		}
		return (
			<Tree aria-label="Layers" aria-multiselectable selectionFollowsFocus={follows}>
				{names.map((name) => (
					<TreeRow key={name} selected={selected.includes(name)} onClick={(e) => select(name, e.shiftKey)}>
						{name}
					</TreeRow>
				))}
				<TreeAddRow label="Add layer" onClick={() => setSelected(["added"])} />
			</Tree>
		)
	}
	const isSelected = (name: string) => screen.getByRole("treeitem", { name }).getAttribute("aria-selected") === "true"

	it("selects the row the arrows land on, and Shift+Arrow extends through the row's own onClick", async () => {
		render(<Layers />)
		screen.getByRole("treeitem", { name: "Title" }).focus()
		await userEvent.keyboard("{ArrowDown}")
		expect(screen.getByRole("treeitem", { name: "Photo" })).toHaveFocus()
		expect([isSelected("Title"), isSelected("Photo")]).toEqual([false, true])
		await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}")
		expect([isSelected("Photo"), isSelected("Grain")]).toEqual([true, true])
	})

	it("moves without selecting on Ctrl+Arrow, and never clicks an add row", async () => {
		render(<Layers />)
		screen.getByRole("treeitem", { name: "Title" }).focus()
		await userEvent.keyboard("{Control>}{ArrowDown}{/Control}")
		expect(screen.getByRole("treeitem", { name: "Photo" })).toHaveFocus()
		expect(isSelected("Title")).toBe(true)
		await userEvent.keyboard("{End}")
		expect(screen.getByRole("treeitem", { name: "Add layer" })).toHaveFocus()
		expect(isSelected("Title")).toBe(true)
	})

	it("only focuses a row that opts out with selectOnFocus={false}, which Enter still activates", async () => {
		// Glitch's artboard rows switch the active artboard and expand on click;
		// arrowing past one reshaped the tree under the cursor.
		const onArtboard = vi.fn()
		render(
			<Tree aria-label="Layers" selectionFollowsFocus>
				<TreeRow onClick={() => undefined}>Title</TreeRow>
				<TreeRow selectOnFocus={false} onClick={onArtboard}>
					Artboard 2
				</TreeRow>
			</Tree>,
		)
		screen.getByRole("treeitem", { name: "Title" }).focus()
		await userEvent.keyboard("{ArrowDown}")
		expect(screen.getByRole("treeitem", { name: "Artboard 2" })).toHaveFocus()
		expect(onArtboard).not.toHaveBeenCalled()
		await userEvent.keyboard("{Enter}")
		expect(onArtboard).toHaveBeenCalledOnce()
	})

	it("only moves focus without it", async () => {
		render(<Layers follows={false} />)
		screen.getByRole("treeitem", { name: "Title" }).focus()
		await userEvent.keyboard("{ArrowDown}")
		expect(screen.getByRole("treeitem", { name: "Photo" })).toHaveFocus()
		expect(isSelected("Title")).toBe(true)
	})
})

describe("Tree — automated a11y", () => {
	it("has no axe violations", async () => {
		const { container } = render(<Files />)
		const results = await axe(container, { rules: { "color-contrast": { enabled: false } } })
		expect(results.violations).toEqual([])
	})
})

describe("Tree arrival on expand", () => {
	const animated = () =>
		screen.queryAllByRole("treeitem").filter((el) => el.classList.contains("motion-arrive"))

	function Folder({ motion }: { motion?: "subtle" }) {
		return (
			<Tree aria-label="Files" motion={motion}>
				<TreeRow
					toggleLabel="src"
					defaultExpanded={false}
					subtree={
						<>
							<TreeRow>a.ts</TreeRow>
							<TreeRow>b.ts</TreeRow>
							<TreeAddRow label="Add file" />
						</>
					}
				>
					src
				</TreeRow>
				<TreeRow toggleLabel="docs" subtree={<TreeRow>readme.md</TreeRow>}>
					docs
				</TreeRow>
			</Tree>
		)
	}

	it("shows rows that mount open at once — a tree that cascades on load is a title sequence", () => {
		render(<Folder />)
		expect(screen.getByText("readme.md")).toBeInTheDocument()
		expect(animated()).toHaveLength(0)
	})

	it("unfolds the rows a user's expand reveals, staggered in document order", async () => {
		const user = userEvent.setup()
		render(<Folder />)
		await user.click(screen.getByText("src"))
		const rows = animated()
		expect(rows.map((el) => el.textContent)).toEqual(["a.ts", "b.ts", "Add file"])
		// Raw stagger steps: the motion-arrive recipe multiplies them by both
		// policy factors, so reduced motion and `subtle` leave no dead wait.
		expect(rows.map((el) => el.style.getPropertyValue("--motion-arrive-delay"))).toEqual(["0ms", "18ms", "36ms"])
	})

	it("does not open an arrival under motion=\"subtle\"", async () => {
		const user = userEvent.setup()
		render(<Folder motion="subtle" />)
		expect(screen.getByRole("tree")).toHaveAttribute("data-motion", "subtle")
		await user.click(screen.getByText("src"))
		expect(screen.getByText("a.ts")).toBeInTheDocument()
		expect(animated()).toHaveLength(0)
	})
})

describe("Tree arrival cleanup", () => {
	it("drops the arrival once it has played, so re-showing a hidden tree cannot replay it", async () => {
		const user = userEvent.setup()
		render(
			<Tree aria-label="Files">
				<TreeRow toggleLabel="src" defaultExpanded={false} subtree={<TreeRow>a.ts</TreeRow>}>
					src
				</TreeRow>
			</Tree>,
		)
		await user.click(screen.getByText("src"))
		const row = screen.getByText("a.ts").closest("[role=treeitem]") as HTMLElement
		expect(row).toHaveClass("motion-arrive")
		// jsdom has no AnimationEvent, so the name is set on a plain event — and
		// React, finding no unprefixed animation support there, listens for the
		// WebKit-prefixed name, so both are sent.
		const end = (target: Element) => {
			for (const type of ["animationend", "webkitAnimationEnd"]) {
				const event = new Event(type, { bubbles: true })
				Object.defineProperty(event, "animationName", { value: "sable-arrive" })
				act(() => {
					target.dispatchEvent(event)
				})
			}
		}
		// A descendant's animation bubbling up is not the row's own.
		end(row.firstElementChild as HTMLElement)
		expect(row).toHaveClass("motion-arrive")
		end(row)
		expect(row).not.toHaveClass("motion-arrive")
		expect(row.style.getPropertyValue("--motion-arrive-delay")).toBe("")
	})
})
