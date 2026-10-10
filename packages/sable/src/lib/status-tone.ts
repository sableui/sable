/**
 * The severity vocabulary shared by every status surface — Note, InlineStatus,
 * Banner's severities, EmptyState's error tone. One list and one icon per tone,
 * so a "warning" looks and is spelled the same everywhere. It is a subset of
 * Badge's tones (BADGE_TONES), which add the decorative content tones.
 *
 * There is no `error`: it was an alias of `destructive` in two components and
 * missing from the rest, which is how a status surface ends up accepting a word
 * its neighbour rejects.
 */
export const STATUS_TONES = ["neutral", "info", "success", "warning", "destructive"] as const
export type StatusTone = (typeof STATUS_TONES)[number]

/** The leading glyph and its ink, per tone. */
export const STATUS_TONE_ICON: Record<StatusTone, { name: string; className: string }> = {
	neutral: { name: "info", className: "text-muted-foreground" },
	info: { name: "info", className: "text-tone-info" },
	success: { name: "circle-check", className: "text-success" },
	warning: { name: "warning", className: "text-tone-warning" },
	destructive: { name: "warning", className: "text-destructive" },
}
