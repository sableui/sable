"use client";

import { useRender } from "@base-ui/react/use-render"
import { createContext, useContext } from "react"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { HighlightGlide } from "../../lib/highlight-glide"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"
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
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the glide, `off` stills it. It
	 * can only turn motion down — it never overrides a reader's reduce-motion
	 * setting.
	 * @default "full"
	 */
	motion?: MotionLevel
}

/**
 * The current-page fill, once, travelling to whichever row is active instead
 * of one row's fill switching off and another's on — the same engine and
 * hand-off as ToggleGroup's segmented fill. It lands on the active row on
 * first paint and glides only when the current page changes in place (a
 * sub-nav inside a persistent layout). Each row keeps its own
 * `data-[active]` fill as the server-render and no-JS fallback; once the glide
 * has mounted it marks the nav `data-glide` and this clears the row's fill,
 * keeping its ink. A nav whose page remounts on navigation simply shows the
 * fill on the new row, with nothing to glide from.
 */
const GLIDE_HANDOFF = "[&[data-glide]_[data-active]]:bg-transparent"
const GLIDE_FILL: Record<SideNavActiveVariant, string> = {
	content: "rounded-sm bg-accent motion-glide",
	sidebar: "rounded-sm bg-sidebar-accent motion-glide",
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
	motion,
	children,
	...props
}: SideNavProps) {
	return (
		<SideNavContext.Provider value={{ size, activeVariant }}>
			<nav
				data-motion={motionAttribute(motion)}
				className={cn("flex flex-col gap-0.5", GLIDE_HANDOFF, className)}
				{...props}
			>
				<HighlightGlide follow="data-active" timing="selection" className={GLIDE_FILL[activeVariant]} />
				{children}
			</nav>
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
