import { cva } from "class-variance-authority"

/**
 * Full-width announcement bar, two axes:
 *
 *  - `tone`       — the meaning (neutral or info/success/warning/1/destructive).
 *  - `appearance` — the emphasis. `soft` (default) is a low-alpha tint of the tone
 *                over the page foreground; `solid` is the full tone fill with its
 *                paired tone-foreground ink, for loud, can't-miss states
 *                (offline, chain-down, RPC errors).
 *
 * Both axes resolve to semantic tokens only — theme-safe in light and dark, no
 * palette reference and no `dark:` variant needed. The leading/trailing layout
 * and `sticky` positioning live in `banner.tsx`.
 */
export const bannerVariants = cva(
	"relative flex min-h-(--control-md) w-full items-center gap-3 px-4 py-2 text-label-md",
	{
		variants: {
			tone: {
				neutral: "",
				info: "",
				success: "",
				warning: "",
				"1": "",
				destructive: "",
			},
			appearance: {
				soft: "",
				solid: "",
			},
		},
		compoundVariants: [
			// Soft — a quiet tint of the tone (the default announcement look).
			{ tone: "neutral", appearance: "soft", class: "bg-secondary text-secondary-foreground" },
			{ tone: "info", appearance: "soft", class: "bg-tone-info-mark/15 text-foreground" },
			{ tone: "success", appearance: "soft", class: "bg-success-mark/15 text-foreground" },
			{ tone: "warning", appearance: "soft", class: "bg-tone-warning-mark/15 text-foreground" },
			{ tone: "1", appearance: "soft", class: "bg-tone-1-mark/15 text-foreground" },
			{ tone: "destructive", appearance: "soft", class: "bg-destructive-mark/15 text-foreground" },
			// Solid — the full tone fill with its paired ink, for loud states.
			{ tone: "neutral", appearance: "solid", class: "bg-foreground text-background" },
			{ tone: "info", appearance: "solid", class: "bg-tone-info text-tone-info-foreground" },
			{ tone: "success", appearance: "solid", class: "bg-success text-success-foreground" },
			{ tone: "warning", appearance: "solid", class: "bg-tone-warning text-tone-warning-foreground" },
			{ tone: "1", appearance: "solid", class: "bg-tone-1 text-tone-1-foreground" },
			{ tone: "destructive", appearance: "solid", class: "bg-destructive text-destructive-foreground" },
		],
		defaultVariants: {
			tone: "neutral",
			appearance: "soft",
		},
	},
)
