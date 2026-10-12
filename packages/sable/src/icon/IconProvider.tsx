"use client";

import { createContext, useContext, useMemo } from "react"
import type { ReactNode } from "react"
import type { IconSet, IconVariant } from "./registry"

export interface IconContextValue {
	set: IconSet | null
	defaultVariant: IconVariant
}

const IconContext = createContext<IconContextValue>({
	set: null,
	defaultVariant: "regular",
})

export interface IconProviderProps {
	/** The icon set to render with. */
	set: IconSet
	/** Variant used when an `<Icon>` doesn't specify one. Default "regular". */
	defaultVariant?: IconVariant
	children: ReactNode
}

/**
 * Supplies the icon set every <Icon> descendant renders with. Required: there
 * is no built-in fallback, so mount it once at the app root —
 * `<IconProvider set={reiconIconSet}>` with `reiconIconSet` from
 * "@sableui/react/icons/reicon", another complete set, or your additions
 * composed over Reicon with composeIconSets(appExtras, reiconIconSet).
 */
export function IconProvider({
	set,
	defaultVariant = "regular",
	children,
}: IconProviderProps) {
	const value = useMemo<IconContextValue>(
		() => ({ set, defaultVariant }),
		[set, defaultVariant],
	)
	return <IconContext.Provider value={value}>{children}</IconContext.Provider>
}

export function useIconSet(): IconContextValue {
	return useContext(IconContext)
}
