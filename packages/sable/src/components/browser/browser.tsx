import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"
import { Icon } from "../../icon/Icon"

export interface BrowserProps extends ComponentPropsWithRef<"div"> {
	/** Address shown in the centered address field. Omit for an empty field. */
	url?: string
	/**
	 * `raised` (default): the soft resting shadow, for a window among other
	 * content. `hero`: lifted well off the page (the top shadow step), for a
	 * product shot staged as a landing page's centrepiece. One hero per page;
	 * never a shadow-* className.
	 * @default "raised"
	 */
	elevation?: "raised" | "hero"
}

/**
 * Browser — a generic, current browser window around page content.
 *
 * One compact toolbar, as modern browsers draw it, without imitating any one
 * of them: neutral window controls, back / forward / reload, and a centered
 * address field with a lock. Theme tokens only — no vendor traffic-light
 * colours — so it sits in any preset. Presentational: the controls are drawn,
 * not interactive.
 */
export function Browser({ url, elevation = "raised", className, children, ...props }: BrowserProps) {
	return (
		<div
			data-elevation={elevation}
			className={cn("overflow-hidden rounded-xl border border-border bg-card", elevation === "hero" ? "shadow-xl" : "shadow-sm", className)}
			{...props}
		>
			<div aria-hidden className="grid h-11 grid-cols-[1fr_minmax(0,28rem)_1fr] items-center gap-3 border-b border-border px-3">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1.5">
						<span className="size-3 rounded-full bg-muted" />
						<span className="size-3 rounded-full bg-muted" />
						<span className="size-3 rounded-full bg-muted" />
					</div>
					<div className="hidden items-center gap-2.5 text-muted-foreground sm:flex">
						<Icon name="chevron-left" className="text-sm" />
						<Icon name="chevron-right" className="text-sm opacity-50" />
						<Icon name="refresh" className="text-sm" />
					</div>
				</div>
				<div className="flex h-7 min-w-0 items-center justify-center gap-1.5 rounded-md bg-muted px-3 text-muted-foreground">
					{url ? <Icon name="lock" className="shrink-0 text-xs" /> : null}
					<span className="truncate text-body-sm">{url ?? ""}</span>
				</div>
				<div />
			</div>
			<div className="bg-background">{children}</div>
		</div>
	)
}
Browser.displayName = "Browser"
