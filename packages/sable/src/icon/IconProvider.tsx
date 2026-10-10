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
 * Overrides Reicon for all <Icon> descendants. Components keep semantic names;
 * an app can supply a complete set or compose its additions with reiconIconSet.
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
