import {
	Children,
	type ComponentPropsWithRef,
	createContext,
	isValidElement,
	type ReactNode,
	useContext,
} from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import {
	stepperConnectorVariants,
	stepperDotConnectorVariants,
	stepperDotVariants,
	stepperIndicatorVariants,
} from "./stepper.variants"

export type StepStatus = "complete" | "current" | "upcoming" | "error"
export type StepperOrientation = "horizontal" | "vertical"
export type StepperIndicator = "number" | "dot"

const DEFAULT_STATUS_LABELS: Record<StepStatus, string> = {
	complete: "Completed",
	current: "Current step",
	upcoming: "Not started",
	error: "Needs attention",
}

interface StepContextValue {
	index: number
	count: number
	current: number
	orientation: StepperOrientation
	indicator: StepperIndicator
	statusLabels: Record<StepStatus, string>
}

const StepContext = createContext<StepContextValue | null>(null)

export interface StepperProps extends ComponentPropsWithRef<"ol"> {
	/**
	 * Zero-based index of the step the user is on. Earlier steps derive
	 * `complete`, later ones `upcoming`; a step's own `status` overrides it.
	 * @default 0
	 */
	current?: number
	/**
	 * `horizontal` for a short flow across the top of a form (checkout, 3–5
	 * steps); `vertical` for a longer flow or a narrow column, where each step
	 * has room for a description.
	 * @default "horizontal"
	 */
	orientation?: StepperOrientation
	/**
	 * `number` for a flow the user moves through (the position is information);
	 * `dot` for a timeline of events — an order's delivery, a document's
	 * history — where a number adds nothing. The dot centres on the title's
	 * first line and scales with its type.
	 * @default "number"
	 */
	indicator?: StepperIndicator
	/** Screen-reader status words, appended to each title. Override to localize. */
	statusLabels?: Partial<Record<StepStatus, string>>
}

/**
 * Stepper — where the user is in a multi-step flow.
 *
 * An ordered list, because the order IS the information: a screen reader
 * announces "list, 4 items" and each position, and the current step carries
 * `aria-current="step"`. Status is derived from `current` so the common case is
 * one number; a step's own `status` overrides it for the case a single number
 * cannot express — a completed step that now has an error.
 *
 *   <Stepper current={1} aria-label="Checkout progress">
 *     <StepperItem title="Cart" />
 *     <StepperItem title="Shipping" />
 *     <StepperItem title="Payment" />
 *   </Stepper>
 *
 * It reports progress; it does not move it. Navigation between steps is the
 * flow's own Back / Continue buttons. Give a completed step `onSelect` only
 * when revisiting it is genuinely supported.
 */
export function Stepper({
	current = 0,
	orientation = "horizontal",
	indicator = "number",
	statusLabels,
	className,
	children,
	...props
}: StepperProps) {
	const items = Children.toArray(children).filter(isValidElement)
	const labels = { ...DEFAULT_STATUS_LABELS, ...statusLabels }
	return (
		<ol
			data-orientation={orientation}
			className={cn(
				// isolate: the indicators' z-10 (above the connector) stays inside the
				// stepper instead of rising over sticky headers and nav bars.
				"isolate flex w-full",
				orientation === "horizontal" ? "flex-row items-start gap-3" : "flex-col",
				className,
			)}
			{...props}
		>
			{items.map((child, index) => (
				<StepContext.Provider
					key={child.key ?? index}
					value={{
						index,
						count: items.length,
						current,
						orientation,
						indicator,
						statusLabels: labels,
					}}
				>
					{child}
				</StepContext.Provider>
			))}
		</ol>
	)
}
Stepper.displayName = "Stepper"

export interface StepperItemProps
	extends Omit<ComponentPropsWithRef<"li">, "title"> {
	/** The step's name. Keep it to a word or two: "Shipping", not "Enter shipping details". */
	title: ReactNode
	/** A short second line. Most useful vertically, where there is room. */
	description?: ReactNode
	/** Override the status derived from the Stepper's `current`. */
	status?: StepStatus
	/**
	 * Make the step a button — for returning to a completed step to edit it.
	 * Leave it off upcoming steps: a step the user cannot reach yet should not
	 * look like something they can press.
	 */
	onSelect?: () => void
}

/** One step. Must be a direct child of `Stepper`, which supplies its position. */
export function StepperItem({
	title,
	description,
	status: statusProp,
	onSelect,
	className,
	...props
}: StepperItemProps) {
	const ctx = useContext(StepContext)
	const tier = useTypeTier()
	const index = ctx?.index ?? 0
	const count = ctx?.count ?? 1
	const orientation = ctx?.orientation ?? "horizontal"
	const dot = (ctx?.indicator ?? "number") === "dot"
	const current = ctx?.current ?? 0
	const status: StepStatus =
		statusProp ??
		(index < current ? "complete" : index === current ? "current" : "upcoming")
	const isLast = index === count - 1
	const isCurrent = index === current
	const statusLabel = (ctx?.statusLabels ?? DEFAULT_STATUS_LABELS)[status]

	const body = (
		<>
			{dot ? (
				// One title line tall (the step carries the title's type), so the dot
				// centres on the title's first line at any density.
				<span aria-hidden="true" className="relative z-10 flex h-[1lh] shrink-0 items-center">
					<span className={stepperDotVariants({ status })} />
				</span>
			) : (
				<span aria-hidden="true" className={stepperIndicatorVariants({ status })}>
					{status === "complete" ? (
						<Icon name="check" className="text-sm" />
					) : status === "error" ? (
						<Icon name="warning" className="text-sm" />
					) : (
						index + 1
					)}
				</span>
			)}
			<span
				className={cn(
					"flex min-w-0 flex-col gap-0.5 text-start",
					!dot && "min-h-(--control-xs) justify-center",
				)}
			>
				<span
					className={cn(
						tier.control,
						"underline-offset-2 motion-interactive group-hover/step:underline",
						status === "upcoming" && "text-muted-foreground",
						status === "error" && "text-destructive",
						(status === "complete" || status === "current") && "text-foreground",
					)}
				>
					{title}
					<span className="sr-only">{` (${statusLabel})`}</span>
				</span>
				{description ? (
					<span className={cn("text-muted-foreground", tier.secondary)}>
						{description}
					</span>
				) : null}
			</span>
		</>
	)

	return (
		<li
			aria-current={isCurrent ? "step" : undefined}
			data-status={status}
			className={cn(
				orientation === "horizontal"
					? cn("flex min-w-0 items-start gap-3", isLast ? "flex-none" : "flex-1")
					: cn("relative", !isLast && "pb-6"),
				// The dot and its line are measured in the title's `lh` and `em`.
				dot && tier.control,
				className,
			)}
			{...props}
		>
			{onSelect ? (
				<button
					type="button"
					onClick={onSelect}
					className="group/step flex min-w-0 items-start gap-3 rounded-sm motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					{body}
				</button>
			) : (
				<div className="flex min-w-0 items-start gap-3">{body}</div>
			)}
			{isLast ? null : (
				<span
					aria-hidden="true"
					className={(dot ? stepperDotConnectorVariants : stepperConnectorVariants)({
						orientation,
						filled: status === "complete",
					})}
				/>
			)}
		</li>
	)
}
StepperItem.displayName = "StepperItem"
