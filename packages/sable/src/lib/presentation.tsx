"use client";

import { createContext, useContext } from "react"

/**
 * Presentation: what a piece of content is shown IN — a page, or a sheet that
 * slid up over one. The content is the same either way; who owns its actions
 * is not.
 *
 * On a page, a card's actions belong to the card: a short row at its trailing
 * edge, sized by the call site. In a sheet, the sheet is the surface, and its
 * actions belong to the sheet: full width, the primary on top, pinned to the
 * bottom where a thumb reaches them. A right-aligned pair of small buttons
 * floating mid-sheet reads as a web card dropped into a phone, which is what
 * the iOS canvas's Feedback sheet looked like.
 *
 * A `platform` or `variant` prop on every block would have pushed that
 * knowledge into each one, and been forgotten at the next. The container
 * already knows what it is, so it says so once: `IosSheet` and a bottom
 * `SheetContent` provide "sheet", and an action row (`CardFooter actions`,
 * `SheetFooter`) lays itself out from it. Nothing else reads it.
 *
 * React context crosses portals, so every surface that presents its own
 * content — a Dialog, a Popover, a side Sheet — declares "page" again. A
 * dialog opened from a bottom sheet is not a sheet, and its footer is a row.
 */
export type Presentation = "page" | "sheet"

const PresentationContext = createContext<Presentation>("page")

/** Declares what its subtree is presented in. Sheets provide it; a page needs nothing. */
export const PresentationProvider = PresentationContext.Provider

export function usePresentation(): Presentation {
	return useContext(PresentationContext)
}

/**
 * How many Cards enclose this point: 0 outside any card, 1 inside one. A sheet
 * owns the actions of the block it presents, not of every card nested in it,
 * so only the outermost flat Card bleeds into the sheet's padding and only its
 * own footer stacks. Internal; Card provides it.
 */
export const CardDepthContext = createContext(0)

/**
 * Set by an action row stacked for a sheet. A Button inside takes the bar's
 * height and full width whatever size the call site gave it: the size was
 * chosen for a row on a page, and a stack of mixed heights is not a bar.
 * Internal: an app opts in through `CardFooter actions` or `SheetFooter`.
 */
export const StackedActionsContext = createContext(false)
