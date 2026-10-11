import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"
import { StatusIcons } from "./status-icons"

export interface PhoneProps extends ComponentPropsWithRef<"div"> {
	/**
	 * Draw a status bar (time, signal, battery) across the top of the screen.
	 * Off for a bare screen, e.g. framing a screenshot that already has one.
	 * @default true
	 */
	statusBar?: boolean
	/**
	 * Draw the camera pill and home indicator over the screen. Turn it off when
	 * the content draws its own system chrome, e.g. an iOS prototype document
	 * framed in an iframe, so the device does not show two of each.
	 * @default true
	 */
	systemChrome?: boolean
}

/**
 * Phone — a current smartphone frame around mobile content.
 *
 * Drawn to the proportions of a current 6.3" iPhone (a 402×874pt screen in a
 * 71.9×150mm body) without copying its details: a titanium band, a thin black
 * bezel, a screen whose corners are concentric with the body, a small island, a
 * home indicator, and side buttons. Every measurement is a share of the frame's
 * own width (container units), so the device keeps its proportions at any size
 * and does not change with the density scale: hardware is not spaced like UI.
 * The body is a fixed titanium (the same in every preset and mode); the
 * screen is a page ground that follows the theme. Content scrolls inside the
 * screen and starts below the status bar.
 */
export function Phone({ statusBar = true, systemChrome = true, className, children, ...props }: PhoneProps) {
	return (
		<div
			className={cn(
				// Hardware is the one surface no preset or mode repaints: a titanium
				// body and band, not a theme's scrim (`overlay` is translucent in some
				// presets, which drew a grey, see-through phone).
				// design-lint-disable-next-line inline-color -- fixed device material, deliberately unthemed
				"@container relative mx-auto w-[280px] [--phone-body:oklch(18%_0.004_265)] [--phone-band:oklch(48%_0.006_265)]",
				className,
			)}
			{...props}
		>
			{/* Side buttons sit just outside the band: action and volume on the start
			    edge; side button and camera control on the end edge. */}
			<span aria-hidden className="absolute -start-[0.6cqi] top-[18%] h-[4.5%] w-[0.8cqi] rounded-s-full bg-(--phone-band)" />
			<span aria-hidden className="absolute -start-[0.6cqi] top-[25.5%] h-[7%] w-[0.8cqi] rounded-s-full bg-(--phone-band)" />
			<span aria-hidden className="absolute -start-[0.6cqi] top-[34%] h-[7%] w-[0.8cqi] rounded-s-full bg-(--phone-band)" />
			<span aria-hidden className="absolute -end-[0.6cqi] top-[27%] h-[10.5%] w-[0.8cqi] rounded-e-full bg-(--phone-band)" />
			<span aria-hidden className="absolute -end-[0.4cqi] top-[55%] h-[6%] w-[0.6cqi] rounded-e-full bg-(--phone-band)" />
			{/* Bezel 3.7cqi, so the screen is 92.6% of the width; the screen radius is
			    ~15.5% of the screen and the body's is the screen's plus the bezel, so
			    the two stay concentric. The inset ring is the titanium band: dark
			    hardware on a dark page reads by its edge, as a real phone does. */}
			<div className="relative rounded-[18cqi] bg-(--phone-body) p-[3.7cqi] shadow-xl ring-[0.5cqi] ring-(--phone-band) ring-inset">
				{/* clip-path as well as overflow-hidden: Chrome does not clip a
				    backdrop-filter child (a blurred BottomNav) to a rounded
				    overflow-hidden parent, and its square corners poked past the
				    screen's curve. A clip-path does clip it. */}
				<div className="relative aspect-[402/874] overflow-hidden rounded-[14.3cqi] bg-background text-foreground [clip-path:inset(0_round_14.3cqi)]">
					<div className={cn("h-full overflow-auto overscroll-contain scrollbar-hidden", statusBar && "pt-[14.3cqi]")}>
						{children}
					</div>
					{/* Solid, not blurred: Chrome does not clip a backdrop-filter child to a
					    rounded overflow-hidden parent, so a blurred bar squared the corners.
					    Time and icons each centre in the space beside the island, on its midline. */}
					{statusBar ? (
						<div
							aria-hidden
							className="absolute inset-x-0 top-0 grid h-[14.3cqi] grid-cols-[1fr_19cqi_1fr] grid-rows-[8cqi] content-start items-center bg-background px-[4cqi] pt-[2.6cqi]"
						>
							<span className="justify-self-center text-label-md tabular-nums">9:41</span>
							<span />
							<StatusIcons className="flex items-center gap-[1.15cqi] justify-self-center [&_svg]:h-[2.8cqi] [&_svg]:w-auto" />
						</div>
					) : null}
					{systemChrome ? (
						<>
							{/* Island, centred over the status bar. */}
							<span aria-hidden className="absolute inset-x-0 top-[2.6cqi] mx-auto h-[8cqi] w-[19cqi] rounded-full bg-(--phone-body)" />
							{/* Home indicator. */}
							<span aria-hidden className="absolute inset-x-0 bottom-[1.85cqi] mx-auto h-[1.15cqi] min-h-1 w-[35%] rounded-full bg-foreground" />
						</>
					) : null}
				</div>
			</div>
		</div>
	)
}
Phone.displayName = "Phone"
