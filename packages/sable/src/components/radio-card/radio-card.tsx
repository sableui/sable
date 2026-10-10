import { Radio as RadioBase } from "@base-ui/react/radio"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { SELECTION_CARD_SHELL } from "../../lib/selection-card"
import { type RadioCardTone, radioCardToneClasses } from "./radio-card.variants"

/**
 * RadioCard — a selectable card option (radio-card) over Base UI's RadioGroup +
 * Radio. RadioGroup is the shared-state container; each RadioCard renders a
 * card (Radio.Root) holding a radio indicator, a title, and an optional
 * description. Pass an `icon` to switch to the richer two-dimensional card (icon
 * top-left, indicator top-right, copy below); pass a `tone` to give the selected
 * state a semantic colour identity (border + radio + icon glyph) instead of the
 * neutral primary. Base UI supplies the hidden native inputs, roving focus,
 * arrow-key navigation, ARIA radiogroup/radio wiring, form integration, and the
 * data-[checked] / data-disabled state attributes. We own the visual surface.
 *
 *   <RadioGroup defaultValue="collectible" className="grid sm:grid-cols-3">
 *     <RadioCard value="post" tone="standard" icon={<Icon name="plus" />}
 *       title="Standard" description="Share without minting" />
 *     <RadioCard value="collectible" tone="collectible" icon={<Icon name="gem" />}
 *       title="Collectible" description="Free to collect as NFT" />
 *     <RadioCard value="edition" tone="edition" icon={<Icon name="image-stack" />}
 *       title="Edition" description="Sell as NFT editions" />
 *   </RadioGroup>
 *
 * Controlled via value + onValueChange; uncontrolled via defaultValue.
 */
export type RadioCardProps = Omit<
	ComponentProps<typeof RadioBase.Root>,
	// `title` is Omitted because the native HTML title attr (string) collides
	// with our ReactNode label; `children` because the card composes its own.
	"className" | "children" | "title"
> & {
	className?: string
	/** The card's primary label. */
	title: ReactNode
	/** Optional supporting copy beneath the title. */
	description?: ReactNode
	/**
	 * Leading icon (e.g. a solid `<Icon>`). Its presence switches the card to the
	 * two-dimensional layout — icon top-left, indicator top-right, copy below —
	 * and the glyph takes the tone colour automatically.
	 */
	icon?: ReactNode
	/**
	 * Semantic colour the selected state carries across its border, radio, and
	 * icon glyph. Defaults to "neutral" (the primary ring with a muted wash).
	 */
	tone?: RadioCardTone
	/** Merged onto the title span (default `text-title-sm`). */
	titleClassName?: string
	/** Merged onto the description span (default `text-body-sm text-muted-foreground`). */
	descriptionClassName?: string
}

/**
 * A single selectable card (Base UI's Radio.Root styled as a card). The icon
 * carries the `tone` colour; the border and radio adopt it when checked without
 * adding a second selected-state shadow. `value` pairs it with the group's
 * selected value.
 */
export function RadioCard({
	className,
	title,
	description,
	icon,
	tone = "neutral",
	titleClassName,
	descriptionClassName,
	...props
}: RadioCardProps) {
	const t = radioCardToneClasses[tone]

	// The dot is absolutely centered (left/top-1/2 + -translate-1/2) rather than
	// flex/grid-centered, so its position never depends on Base UI's indicator
	// display or line-box. In Tailwind v4 `translate` and `scale` are separate CSS
	// properties, so the enter/exit scale animation composes without disturbing it.
	const marker = (
		<span
			className={cn(
				"relative inline-flex size-4.5 shrink-0 rounded-full border border-input bg-card motion-interactive",
				t.marker,
			)}
		>
			<RadioBase.Indicator
				className={cn(
					"absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full motion-interactive ease-spring data-[starting-style]:scale-0 data-[ending-style]:scale-0",
					t.dot,
				)}
			/>
		</span>
	)

	const content = (
		<span className="flex min-w-0 flex-col gap-0.5">
			<span className={cn("text-title-sm", titleClassName)}>{title}</span>
			{description ? (
				<span
					className={cn("text-body-sm text-muted-foreground", descriptionClassName)}
				>
					{description}
				</span>
			) : null}
		</span>
	)

	return (
		<RadioBase.Root
			// Keep Space activation on the native button path, as in Radio.
			render={<button type="button" />}
			nativeButton
			className={cn(
				SELECTION_CARD_SHELL,

				t.card,
				icon != null ? "flex-col gap-3 rounded-lg" : "items-start gap-3 rounded-md",
				className,
			)}
			{...props}
		>
			{icon != null ? (
				<>
					<span className="flex w-full items-start justify-between gap-3">
						<span
							className={cn(
								"shrink-0 text-2xl leading-none motion-interactive",
								t.glyph,
							)}
						>
							{icon}
						</span>
						{marker}
					</span>
					{content}
				</>
			) : (
				<>
					{/* Centred on the title's first line box, not nudged by a fixed
					    offset: the box is one title line tall whatever the type tier. */}
					<span className={cn("flex h-[1lh] shrink-0 items-center text-title-sm", titleClassName)}>
						{marker}
					</span>
					{content}
				</>
			)}
		</RadioBase.Root>
	)
}
RadioCard.displayName = "RadioCard"
