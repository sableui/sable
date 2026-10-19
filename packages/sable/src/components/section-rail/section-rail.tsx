"use client"

import {
	type ComponentPropsWithRef,
	type MouseEvent,
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react"
import { cn } from "../../lib/cn"
import { HighlightGlide } from "../../lib/highlight-glide"
import { setRef } from "../../lib/refs"
import { useActiveSection } from "../../lib/use-active-section"
import { type MotionLevel, useMotionLevel } from "../../motion/MotionProvider"
import { SimpleTooltip, TooltipGroup } from "../tooltip"

export interface SectionRailSection {
	/** The section element's `id` — the rail links to `#id` and watches it. */
	id: string
	/** The section's name: the tooltip, and the link's accessible name. */
	label: string
}

export interface SectionRailProps extends Omit<ComponentPropsWithRef<"nav">, "children"> {
	/** The sections, in document order. */
	sections: readonly SectionRailSection[]
	/**
	 * The current section's id, when the parent decides it. Leave it unset and
	 * the rail follows the scroll itself.
	 */
	value?: string
	/** Called with the new id when the reader scrolls into a section or picks one. */
	onValueChange?: (id: string) => void
	/**
	 * Where the reading line sits, as a fraction of the viewport from its top.
	 * A section becomes current once its top crosses it.
	 * @default 0.35
	 */
	offset?: number
	/** The element that scrolls, when it is not the window. */
	root?: RefObject<HTMLElement | null>
	/**
	 * Which edge of the page the rail sits on. The labels open toward the
	 * content, on the other side.
	 * @default "left"
	 */
	side?: "left" | "right"
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the marker's glide, `off` stills
	 * it. It can only turn motion down — it never overrides a reader's
	 * reduce-motion setting.
	 */
	motion?: MotionLevel
}

/**
 * The keys that scroll a page. A picked section holds the marker until the
 * reader scrolls by hand — a smooth scroll (`scroll-behavior: smooth`) toward
 * it passes every section in between, and without the hold the marker would
 * step through each one instead of going straight there.
 */
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "])

/**
 * The marker, once: one bar that travels to the current section, the same
 * engine as SideNav's current-page fill. Each link still draws its own bar
 * when current, as the server-render and no-JS fallback; once the glide mounts
 * it marks the rail `data-glide` and that bar steps aside, leaving the dot's
 * place empty for the travelling one to land in.
 */
const GLIDE_HANDOFF = "[&[data-glide]_[data-active]>[data-section-rail-mark]]:opacity-0"
const GLIDE_MARK =
	"flex items-center justify-center motion-glide after:h-5 after:w-1 after:rounded-full after:bg-primary"

/**
 * SectionRail — a slim vertical rail of dots, one per section of a long page,
 * that shows where the reader is and jumps to any section. A bar marks the
 * current section and glides to the next as the page scrolls; hovering or
 * focusing a dot names its section in a tooltip that travels with the pointer.
 *
 *   <SectionRail
 *     sections={[{ id: "overview", label: "Overview" }, { id: "process", label: "Process" }]}
 *     className="fixed top-1/2 left-6 z-(--z-nav) -translate-y-1/2 max-lg:hidden"
 *   />
 *
 * It renders in flow; place it with layout classes. Picking a dot scrolls to
 * the section with the page's own `scroll-behavior` (instantly under reduced
 * motion) and, at page level, puts its id in the URL without adding a history
 * entry. Give sections a `scroll-mt-*` when a sticky header would cover them.
 */
export function SectionRail({
	sections,
	value,
	onValueChange,
	offset,
	root,
	side = "left",
	motion,
	className,
	"aria-label": ariaLabel = "Sections",
	ref,
	...props
}: SectionRailProps) {
	const rail = useRef<HTMLElement>(null)
	const setRail = useCallback(
		(node: HTMLElement | null) => {
			rail.current = node
			setRef(ref, node)
		},
		[ref],
	)
	const { enabled, attribute } = useMotionLevel(motion)
	const spied = useActiveSection(
		sections.map((section) => section.id),
		{ offset, root },
	)
	// A picked section, held while the scroll toward it runs.
	const [picked, setPicked] = useState<string | null>(null)
	const internal = picked ?? spied
	const active = value ?? internal

	const report = useRef(onValueChange)
	report.current = onValueChange
	const reported = useRef(internal)
	useEffect(() => {
		if (internal === null || internal === reported.current) return
		reported.current = internal
		report.current?.(internal)
	}, [internal])

	// Hold the pick until the reader scrolls on their own. Releasing when the
	// jump settles is not enough: near the end the scroller cannot bring a
	// section up to the reading line, and the spy would hand the marker to the
	// last section the moment the hold let go — the reader picks "Outcome" and
	// the rail says "What's next".
	useEffect(() => {
		if (picked === null) return
		const release = () => setPicked(null)
		const releaseOnKey = (event: KeyboardEvent) => {
			if (SCROLL_KEYS.has(event.key)) release()
		}
		const listeners = new AbortController()
		const options = { passive: true, signal: listeners.signal }
		window.addEventListener("wheel", release, options)
		window.addEventListener("touchstart", release, options)
		window.addEventListener("keydown", releaseOnKey, options)
		// A scrollbar drag: the press lands on the scroller, outside the rail.
		window.addEventListener(
			"pointerdown",
			(event) => {
				if (!(event.target instanceof Node && rail.current?.contains(event.target))) release()
			},
			options,
		)
		return () => listeners.abort()
	}, [picked])

	const jump = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
		if (event.defaultPrevented || event.button !== 0) return
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
		const section = document.getElementById(id)
		if (!section) return
		event.preventDefault()
		setPicked(id)
		// `auto` is the page's own `scroll-behavior`, so the jump feels like the
		// anchor it replaces; reduced motion makes it instant whatever the CSS says.
		const behavior: ScrollBehavior = enabled ? "auto" : "instant"
		const scroller = root?.current
		if (scroller) {
			// Only the root moves. scrollIntoView would scroll every scrolling
			// ancestor too, yanking the page to line the section up with the window.
			const margin = Number.parseFloat(getComputedStyle(section).scrollMarginTop) || 0
			const top = section.getBoundingClientRect().top - scroller.getBoundingClientRect().top - scroller.clientTop
			scroller.scrollTo({ top: scroller.scrollTop + top - margin, behavior })
		} else {
			section.scrollIntoView({ behavior, block: "start" })
			window.history.replaceState(window.history.state, "", `#${id}`)
		}
		// A keyboard activation (detail 0) moves focus into the section, as the
		// link it replaces would have, so the next Tab continues from there.
		if (event.detail === 0) {
			if (!section.hasAttribute("tabindex")) {
				section.setAttribute("tabindex", "-1")
				section.addEventListener("blur", () => section.removeAttribute("tabindex"), { once: true })
			}
			section.focus({ preventScroll: true })
		}
	}

	return (
		<nav
			ref={setRail}
			aria-label={ariaLabel}
			data-motion={attribute}
			className={cn(
				"relative flex w-fit flex-col rounded-full bg-muted py-2",
				GLIDE_HANDOFF,
				className,
			)}
			{...props}
		>
			<HighlightGlide follow="data-active" timing="selection" className={GLIDE_MARK} />
			<TooltipGroup motion={motion}>
				{sections.map((section) => {
					const current = section.id === active
					return (
						<SimpleTooltip
							key={section.id}
							content={section.label}
							side={side === "left" ? "right" : "left"}
						>
							<a
								href={`#${section.id}`}
								aria-label={section.label}
								aria-current={current ? "location" : undefined}
								data-active={current ? "" : undefined}
								onClick={(event) => jump(event, section.id)}
								className="group/rail-link relative flex h-(--control-sm) w-11 items-center justify-center rounded-full text-muted-foreground outline-none motion-interactive hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
							>
								<span
									aria-hidden
									data-section-rail-mark=""
									className="size-1 rounded-full bg-current motion-interactive group-hover/rail-link:scale-150 group-focus-visible/rail-link:scale-150 group-data-[active]/rail-link:h-5 group-data-[active]/rail-link:bg-primary"
								/>
							</a>
						</SimpleTooltip>
					)
				})}
			</TooltipGroup>
		</nav>
	)
}
SectionRail.displayName = "SectionRail"
