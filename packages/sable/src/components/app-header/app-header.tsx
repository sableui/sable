import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"

export interface AppHeaderProps
	extends Omit<ComponentPropsWithRef<"header">, "title"> {
	/** Leading slot — a back button, create action, or menu trigger. */
	leading?: ReactNode
	/** Center slot — the brand wordmark or the contextual page title. */
	title?: ReactNode
	/** Trailing slot — account menu, action buttons. */
	actions?: ReactNode
}

/**
 * AppHeader — the mobile top bar. Sticky at the top (so it stays in flow — no
 * separate spacer needed), hidden at `lg` where the Sidebar takes over. Grows
 * into the top safe-area (notch). A 3-column grid keeps the center title
 * optically centered regardless of the leading/trailing slot widths.
 *
 *   <AppHeader leading={<BackButton />} title="Notifications" actions={<AccountMenu />} />
 */
export function AppHeader({
	leading,
	title,
	actions,
	className,
	...props
}: AppHeaderProps) {
	return (
		<header
			className={cn(
				"sticky top-0 z-(--z-nav) w-full border-b border-border bg-background pt-[env(safe-area-inset-top,0px)] lg:hidden",
				className,
			)}
			{...props}
		>
			<div className="grid h-[var(--nav-height,56px)] grid-cols-[1fr_auto_1fr] items-center px-4">
				<div className="flex items-center justify-start gap-(--control-gap)">{leading}</div>
				{/* The ellipsis lives on an inner block: `text-overflow` never applies
				    to a flex container's anonymous text item, so a long title on the
				    flex cell itself clipped hard with no "…". */}
				<div className="flex min-w-0 items-center justify-center text-title-lg">
					<span className="min-w-0 truncate">{title}</span>
				</div>
				<div className="flex items-center justify-end gap-(--control-gap)">{actions}</div>
			</div>
		</header>
	)
}
AppHeader.displayName = "AppHeader"
