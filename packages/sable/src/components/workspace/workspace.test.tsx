import { describe, expect, it } from "vitest"
import { renderWithProviders } from "../../test/render"
import { Workspace, WorkspaceBar, WorkspaceCanvas } from "./workspace"

const bar = <WorkspaceBar data-testid="toolbar">Bar</WorkspaceBar>
const status = <footer data-testid="status">Status</footer>
const nav = <nav data-testid="nav">Nav</nav>

/** Every combination of the three optional slots. */
const combos = [false, true].flatMap((toolbar) =>
	[false, true].flatMap((statusBar) => [false, true].map((bottomNav) => ({ toolbar, statusBar, bottomNav }))),
)

describe("Workspace slots", () => {
	it.each(combos)("gives the body the only flexible row (toolbar %o)", ({ toolbar, statusBar, bottomNav }) => {
		const { container } = renderWithProviders(
			<Workspace
				toolbar={toolbar ? bar : undefined}
				statusBar={statusBar ? status : undefined}
				bottomNav={bottomNav ? nav : undefined}
			>
				<WorkspaceCanvas>Canvas</WorkspaceCanvas>
			</Workspace>,
		)
		const root = container.querySelector("[data-density]") as HTMLElement
		// A flex column, not a track list counted from the props: whichever slots
		// render, the body is the one row that grows, so it can never land in an
		// `auto` track and push the status bar off the bottom.
		expect(root.className).toContain("flex-col")
		expect(root.className).not.toMatch(/grid-rows-/)
		const grows = [...root.children].filter((el) => el.classList.contains("flex-1"))
		expect(grows).toHaveLength(1)
		const body = root.querySelector("[data-workspace-body]")
		expect(grows[0]).toBe(body)
		expect(body?.className).toContain("min-h-0")

		// Slots keep their order: toolbar, body, status bar, bottom nav.
		const order = [...root.children]
			.map((el) =>
				el.matches("[data-testid=toolbar]")
					? "toolbar"
					: el.hasAttribute("data-workspace-body")
						? "body"
						: el.matches("[data-testid=status]")
							? "status"
							: el.hasAttribute("data-workspace-bottom-nav")
								? "nav"
								: null,
			)
			.filter(Boolean)
		expect(order).toEqual(
			[toolbar && "toolbar", "body", statusBar && "status", bottomNav && "nav"].filter(Boolean),
		)
	})

	it("reserves the bottom nav's height below lg and drops the row above it", () => {
		const { container } = renderWithProviders(
			<Workspace bottomNav={nav}>
				<WorkspaceCanvas>Canvas</WorkspaceCanvas>
			</Workspace>,
		)
		const row = container.querySelector("[data-workspace-bottom-nav]") as HTMLElement
		expect(row.className).toContain("lg:hidden")
		expect(row.className).toContain("shrink-0")
		expect(row.className).toContain("var(--nav-height,56px)")
		expect(row.querySelector("[data-testid=nav]")).not.toBeNull()
	})
})
