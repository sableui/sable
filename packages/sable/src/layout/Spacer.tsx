import type { CSSProperties } from "react"

export interface SpacerProps {
	/** Fixed size in rhythm units (×8px; fractions ok). Ignored when `grow`. */
	size?: number
	/** Axis the fixed size applies to. Default "vertical". */
	axis?: "vertical" | "horizontal"
	/** Flex-grow to push siblings apart (fills available space). */
	grow?: boolean
	className?: string
}

/** Explicit space on the rhythm, or a flexible `grow` pusher between siblings. */
export function Spacer({ size = 1, axis = "vertical", grow, className }: SpacerProps) {
	const style: CSSProperties = grow
		? { flex: "1 1 0%" }
		: axis === "vertical"
			? { height: `calc(var(--rhythm-unit) * ${size})`, flexShrink: 0 }
			: { width: `calc(var(--rhythm-unit) * ${size})`, flexShrink: 0 }
	return <div aria-hidden className={className} style={style} />
}
