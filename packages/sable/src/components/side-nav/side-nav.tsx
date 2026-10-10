"use client";

import { useRender } from "@base-ui/react/use-render"
import { createContext, useContext } from "react"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { sideNavItemIconVariants, sideNavItemVariants } from "./side-nav.variants"

/**
 * Density of a SideNav and its items.
 * - `md` (default) — the lightweight in-content sub-nav (label-md, 20px icon box).
 * - `lg` — chrome-weight: a larger label + icon box and roomier rows, for a rail
 *   that pairs visually with the app `Sidebar` (e.g. a settings sub-nav rendered
 *   flush against it rather than floating inside the content column).
 */
export type SideNavSize = "md" | "lg"
export type SideNavActiveVariant = "content" | "sidebar"

const SideNavContext = createContext<{
	size: SideNavSize
	activeVariant: SideNavActiveVariant
}>({
	size: "md",
	activeVariant: "content",
})

export interface SideNavProps extends ComponentPropsWithRef<"nav"> {
	/** Density shared by all items in the nav. Default `md`. */
	size?: SideNavSize
	/**
	 * Active-state token vocabulary. `content` uses regular surface tokens for
	 * local rails; `sidebar` matches the app Sidebar for sub-navs inside chrome.
	 */
	activeVariant?: SideNavActiveVariant
}

/**
 * SideNav — a lightweight, in-content vertical navigation list: the settings /
 * docs sub-nav that sits inside the content region (often the left column of a
 * `SplitPane`), distinct from the full-height app-chrome `Sidebar`. Router-agnostic
 * items, an optional grouped layout, and a subtle active state on the regular
 * surface tokens (no sidebar chrome). Pass `size="lg"` for a chrome-weight rail
 * that visually matches a `Sidebar`; pass `activeVariant="sidebar"` when the
 * rail itself sits on the Sidebar surface and should use sidebar active tokens.
 *
 *   <SideNav>
 *     <SideNavItem label="Profile" active render={<Link to="/settings/profile" />} />
 *     <SideNavItem label="Account" render={<Link to="/settings/account" />} />
 *   </SideNav>
 */
export function SideNav({
	className,
	size = "md",
	activeVariant = "content",
	...props
}: SideNavProps) {
	return (
		<SideNavContext.Provider value={{ size, activeVariant }}>
			<nav className={cn("flex flex-col gap-0.5", className)} {...props} />
		</SideNavContext.Provider>
	)
}
SideNav.displayName = "SideNav"

export interface SideNavGroupProps extends ComponentPropsWithRef<"div"> {
	/** Optional section heading above the group's items (sentence-case caption). */
	label?: ReactNode
}

/** A labelled section within a SideNav — for grouping settings into areas. */
export function SideNavGroup({
	label,
	className,
	children,
	...props
}: SideNavGroupProps) {
	return (
		<div className={cn("flex flex-col gap-0.5", className)} {...props}>
			{label ? (
				<div className="px-3 pt-3 pb-1 text-caption text-muted-foreground">
					{label}
				</div>
			) : null}
			{children}
		</div>
	)
}
SideNavGroup.displayName = "SideNavGroup"

export interface SideNavItemProps
	extends Omit<ComponentPropsWithRef<"button">, "title"> {
	/** Row label. */
	label: ReactNode
	/** Optional leading icon. */
	icon?: ReactNode
	/** Marks the current sub-section — accent fill + `aria-current="page"`. */
	active?: boolean
	/** Trailing badge (e.g. a count), pushed to the row end. */
	badge?: ReactNode
	/** Density override — defaults to the enclosing `SideNav`'s `size`. */
	size?: SideNavSize
	/**
	 * Active-state vocabulary override. Defaults to the enclosing SideNav's
	 * activeVariant.
	 */
	activeVariant?: SideNavActiveVariant
	/** Render as another element, e.g. `render={<Link to="/x" />}`. */
	render?: useRender.RenderProp
}

/**
 * A single SideNav row. Router-agnostic via `render`; lighter than a `SidebarItem`
 * (in-content surface tokens, smaller type), with a muted resting state that lifts
 * to the accent surface when `active`. Inherits `size` from the enclosing `SideNav`
 * unless overridden per item.
 */
export function SideNavItem({
	label,
	icon,
	active,
	badge,
	size,
	activeVariant,
	render,
	className,
	...props
}: SideNavItemProps) {
	const context = useContext(SideNavContext)
	const resolvedSize = size ?? context.size
	const resolvedActiveVariant = activeVariant ?? context.activeVariant
	return useRender({
		render: render ?? <button type="button" />,
		props: {
			...props,
			"data-active": active ? "" : undefined,
			"aria-current": active ? "page" : undefined,
			className: cn(
				sideNavItemVariants({
					size: resolvedSize,
					activeVariant: resolvedActiveVariant,
				}),
				className,
			),
			children: (
				<>
					{icon ? (
						<span className={sideNavItemIconVariants({ size: resolvedSize })}>
							{icon}
						</span>
					) : null}
					<span className="min-w-0 flex-1 truncate">{label}</span>
					{badge ? <span className="ms-auto shrink-0">{badge}</span> : null}
				</>
			),
		},
		defaultTagName: "button",
	})
}
SideNavItem.displayName = "SideNavItem"
