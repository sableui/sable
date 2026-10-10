"use client";

import { type ComponentProps, createContext, type ReactNode, useContext } from "react"

/**
 * Density, as React context — because CSS alone cannot reach a portal.
 *
 * `data-density` on a `<Workspace>` scopes the whole control ladder by
 * redefining `--control-*`, `--button-radius`, `--tree-*` for its subtree. That
 * works perfectly for anything rendered inside it, and not at all for anything
 * rendered through a portal: a `MenuContent` or `SelectContent` mounts at the
 * document root, so it is not a DOM descendant of the workspace and inherits
 * nothing from it.
 *
 * Measured inside a compact `<Workspace>` before this existed:
 *
 *   token             workspace   popup
 *   --control-md      32px        40px      ← the comfortable ladder
 *   --control-xs      24px        28px
 *   --tree-column     18px        20px
 *   --button-radius   5px         (unset)   ← pills reappear inside a tool
 *
 * So every popup in a tool silently rendered at page-register sizes, and every
 * consuming app corrected it by hand at each call site (Glitch had 14 such
 * overrides, and had them inconsistent). When a system needs the same manual
 * correction at every call site, the default is missing a case.
 *
 * A `size` prop on the two most-noticed components would have patched the most
 * visible symptom — type — on two components, and left heights, radius and tree
 * geometry wrong on the rest. Context fixes the cause once, and cannot be
 * forgotten at a call site.
 */
export type Density = "compact" | "comfortable"

const DensityContext = createContext<Density>("comfortable")

/**
 * Low-level context provider. **You almost certainly want `<Density>` instead.**
 *
 * This only feeds the React side — the half that reaches portaled popups. It
 * renders no DOM, so it sets no `data-density`, so the CSS ladder in its subtree
 * does not change. Wrapping a form in it restyles the menus and leaves every
 * control the wrong height, which is exactly the trap a real consumer hit: the
 * name reads like "scope the density here", and it does half of that.
 *
 * Exported for the rare case where the element is already yours and you only need
 * the context. `<Workspace>` uses both halves.
 */
export const DensityProvider = DensityContext.Provider

/**
 * The density of the surface this component belongs to.
 *
 * Anchored portal surfaces use it to re-apply `data-density` on their own root,
 * reconnecting them to the scope their trigger lives in.
 */
export function useDensity(): Density {
	return useContext(DensityContext)
}

/**
 * Props an ANCHORED portal surface spreads onto its portaled root.
 *
 * "Anchored" is the operative word, and it is where the line is drawn: a popup
 * attached to a control (menu, select, popover, tooltip, context menu) is part of
 * that control's surface and inherits its register. A MODAL is not — a Dialog or
 * Sheet is a page-register surface even when a tool opened it, which is existing
 * documented behaviour and stays true. Do not spread this onto a modal.
 */
export function useAnchoredDensity(): { "data-density": Density } {
	return { "data-density": useDensity() }
}

/**
 * WHICH PORTALED SURFACES RE-ANCHOR, AND WHICH DELIBERATELY DO NOT.
 *
 * Recorded because the omission was the bug, and because `CommandMenu` did not
 * merely get forgotten — it is BUILT ON Dialog, and DESIGN.md's register section
 * says a modal resets to page register. So it inherited the wrong rule by
 * construction, from a sentence that is correct about dialogs and wrong about
 * palettes. A list of "these follow the register" is only half a contract; the
 * other half is naming what does not, and why, or the next component built on a
 * task surface inherits the same wrong answer just as quietly.
 *
 * FOLLOW the register (call `useAnchoredDensity`, and `useTypeTier` for text):
 *   Menu, ContextMenu, Popover, Tooltip, Select, Combobox, CommandMenu,
 *   SettingsMenu — and the conversation set: MessageScroller, Message, Bubble,
 *   Attachment, Marker, ChatComposer.
 *
 *   The conversation set is the interesting case, because a transcript is PROSE
 *   and the rule below sends prose surfaces to the page register. The
 *   distinguishing test is not "does it hold prose" but "does it take the
 *   screen". A Dialog does; a docked agent panel does not — it lives in a narrow
 *   column beside the work, permanently, which is the definition of chrome. A
 *   chat panel that renders at page-register type inside a compact tool is the
 *   same failure the palette was: the surface you use most is the one that does
 *   not look like the tool. Shipped that way in 0.45–0.47 and reported from a
 *   consuming app as "text feels too large", which is exactly how it looks.
 *
 *   They reach for `useTypeTier().prose` rather than `.body`: a transcript is
 *   read, not scanned, and `text-ui-md`'s 500 weight turns a paragraph into a
 *   wall of emphasis.
 *   These are chrome. They are summoned FROM a surface, they act ON it, and they
 *   are read at a glance while the work stays visible behind them — so they
 *   belong to the register of the thing that summoned them. A palette is the
 *   clearest case: the fastest way to do anything in a tool should not be the one
 *   surface that does not look like the tool.
 *
 * Do NOT follow it — page register always:
 *   Dialog (including fullscreen) and Sheet.
 *   These are task surfaces, not chrome. A modal takes the screen and the user's
 *   full attention for one job — an export, a confirmation, version history —
 *   and reading 11px type in a box that has covered the work is a false economy:
 *   the density that buys you a denser panel buys you nothing here, because
 *   nothing is competing for the space. They are also the surfaces most likely to
 *   hold prose, and the workspace register is explicitly a CHROME register.
 *
 *   A consumer who disagrees can wrap the dialog's content in `<Density
 *   value="compact">` — the escape hatch is one component and it is theirs to
 *   reach for, which is the right default direction for a decision this
 *   subjective.
 */

/**
 * Density — scope a subtree to a register. **This is the one you want.**
 *
 * Sets `data-density` on a real element (so the CSS ladder retunes) AND provides
 * the context (so portaled popups follow). Doing only one of those is the trap
 * `DensityProvider` is: half the mechanism, none of the warning.
 *
 * The case this exists for is a **mixed-register app**, which is more common than
 * the five forks in `llms.txt` imply. A product can be a tool on one route and a
 * document on another — Training Studio captions images in a workspace and
 * configures training in a scrolling form — and until now there was no documented
 * way to say so:
 *
 *   <Workspace>                      // compact
 *     <PanelGroup>
 *       <Panel label="Settings">
 *         <Density value="comfortable">   // a writing/config surface, page sizes
 *           <Textarea />
 *         </Density>
 *       </Panel>
 *     </PanelGroup>
 *   </Workspace>
 *
 * Use it sparingly. A whole tool that needs this everywhere is a tool built in the
 * wrong register; this is for the genuine island — a long-form text field, an
 * embedded settings form — not for opting out of a decision.
 */
export function Density({
	value,
	className,
	children,
	...props
}: { value: Density } & Omit<ComponentProps<"div">, "children"> & {
	children: ReactNode
}) {
	return (
		<DensityContext.Provider value={value}>
			<div data-density={value} className={className} {...props}>
				{children}
			</div>
		</DensityContext.Provider>
	)
}
Density.displayName = "Density"

/**
 * The type tier for the current density.
 *
 * The control ladder is CSS variables, so `data-density` retunes it for free.
 * Typography is not: `text-body-md` and `text-ui-md` are separate paired
 * utilities, so a component that hardcodes one does not respond to density at
 * all. That is why menus and selects rendered at 13px body type inside a tool
 * whose every other control was on the chrome tier — and why every consuming app
 * corrected it by hand at each call site.
 *
 * Both class names are returned as LITERALS on purpose. Tailwind scans source
 * text, so a computed name (`text-${tier}-md`) would never be generated.
 */
export function useTypeTier(): {
	/** Default UI text: `text-ui-md` in compact, `text-body-md` otherwise. */
	body: string
	/** Small caps/labels: `text-ui-micro` in compact, `text-label-xs` otherwise. */
	label: string
	/**
	 * Running text someone READS rather than scans — a chat message, a
	 * description, a rendered answer: `text-ui-body` in compact,
	 * `text-body-md` otherwise.
	 *
	 * Distinct from `body`, and the distinction is weight, not size. Both are
	 * 12px in compact, but `text-ui-md` is 500 — the weight a control label
	 * wants — while `text-ui-body` is 400. A paragraph set at control weight
	 * reads as a wall of emphasis.
	 */
	prose: string
	/**
	 * The quiet second line — timestamps, file sizes, status text:
	 * `text-ui-sm` in compact, `text-body-xs` otherwise.
	 */
	secondary: string
	/**
	 * Supporting copy — field help, card descriptions, empty-state bodies:
	 * `text-ui-sm` in compact, `text-body-sm` otherwise.
	 */
	supporting: string
	/**
	 * A control's own label — field labels, badges, menu rows, tabs:
	 * `text-ui-md` in compact, `text-label-md` otherwise.
	 */
	control: string
	/**
	 * The louder control label a button carries: `text-ui-md` in compact,
	 * `text-label-lg` otherwise.
	 */
	action: string
	/**
	 * A section or card title inside chrome: `text-ui-section` in compact,
	 * `text-title-sm` otherwise.
	 */
	heading: string
} {
	/*
	 * Every entry pairs a compact tier with the EXACT page utility the call
	 * sites already used. That is deliberate and load-bearing: the sweep that
	 * introduced most of these touched 33 components, and if a pairing drifted
	 * — `text-label-lg` quietly becoming `text-body-md` — every page-register
	 * surface in every consuming app would change weight with no failing test
	 * to catch it. Adding a tier means adding a pair, never remapping one.
	 */
	return useDensity() === "compact"
		? {
				body: "text-ui-md",
				label: "text-ui-micro",
				prose: "text-ui-body",
				secondary: "text-ui-sm",
				supporting: "text-ui-sm",
				control: "text-ui-md",
				action: "text-ui-md",
				heading: "text-ui-section",
			}
		: {
				body: "text-body-md",
				// Group labels. Was `text-label-xs` — the uppercase eyebrow — which put
				// tracked capitals in every menu, select and command list, against
				// the typography rule (no uppercase in UI chrome). Sentence-case
				// caption reads as a quiet heading without shouting.
				label: "text-caption",
				prose: "text-body-md",
				secondary: "text-body-xs",
				supporting: "text-body-sm",
				control: "text-label-md",
				action: "text-label-lg",
				heading: "text-title-sm",
			}
}
