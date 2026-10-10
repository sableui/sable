import { cva } from "class-variance-authority"

/**
 * Marker — the things in a conversation that are not messages: a date break, a
 * system note, a streaming status, a tool that ran.
 *
 * They share one job (annotate the stream without competing with it) and so
 * share one component. All four variants are centered, quiet, and typographically
 * below the message tier on purpose: a marker that reads as loudly as a message
 * turns the transcript into a list of alerts.
 */
export const markerVariants = cva(
	"flex w-full items-center gap-2 text-body-xs text-muted-foreground",
	{
		variants: {
			variant: {
				/** Live activity — "Thinking…", "Searching the docs". */
				status: "justify-center py-0.5",
				/** A system note — "Carla joined", "Conversation assigned to Support". */
				note: "justify-center py-0.5",
				/** A note that needs a container — errors, escalations, retention notices. */
				bordered:
					"justify-center rounded-md border border-border bg-muted/40 px-3 py-2",
				/** A labelled rule — the date break. */
				separator: "gap-3 py-1",
			},
		},
		defaultVariants: { variant: "status" },
	},
)

/**
 * The rules either side of a `separator` label. Each rule is a Sable
 * `<Separator>` (the hairline, its height and its `border` tint come from
 * there); this only lets it share the row with the label. Not Separator's own
 * `label` prop: that branch makes the whole row `role="separator"`, whose
 * children are presentational, so the date would vanish from the a11y tree,
 * and it has no slot for the icon or the shimmer.
 */
export const markerRuleVariants = cva("w-auto flex-1")
