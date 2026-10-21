/**
 * The icon contract: every semantic name an app can pass to `<Icon name>` and
 * expect a glyph from Sable's bundled set, plus the names other icon libraries
 * use for the same glyphs.
 *
 * `ICON_NAMES` is the same list as `registry.json → iconContract.names`
 * (asserted in reicon.test.tsx), kept here so `<Icon>` can point at the nearest
 * real name when one resolves to nothing — the core graph never imports an icon
 * set, so it cannot ask Reicon what it has.
 */
export const ICON_NAMES = [
	"heart", "comment", "share", "gem", "image-stack", "home", "bell", "gear", "user", "search",
	"plus", "minus", "check", "xmark", "chevron-down", "chevron-up", "chevron-left", "chevron-right",
	"arrow-up", "arrow-up-right", "expand", "eye", "eye-off", "external", "spinner", "ellipsis", "info",
	"warning", "circle-check", "calendar", "copy", "file", "folder", "sun", "moon", "desktop", "lock",
	"list", "bars", "grid", "layout", "book", "component", "sparkles", "play", "pause", "next",
	"previous", "arrow-down", "arrow-left", "arrow-right", "clock", "send", "trash", "edit", "download",
	"upload", "link", "inbox", "mail", "logout", "star", "refresh", "filter", "bold", "italic",
	"eyedropper", "stop", "key", "wallet", "thumbs-up", "thumbs-down", "shuffle", "repeat", "repeat-one",
	"volume", "volume-low", "volume-off", "queue", "music", "tag", "paperclip", "chart", "flag",
	"at-sign", "replay", "motion", "emoji", "briefcase", "layers", "microphone", "video", "broadcast",
	"newspaper", "palette", "gamepad",
	// Work-tracking chrome: a team list, a backlog, a board view, display
	// options, help and a collapsible sidebar. Added when an issue tracker
	// asked for users/archive/columns/sliders/help/menu, got nothing back,
	// and showed one glyph for Inbox and Backlog.
	"users", "archive", "kanban", "sliders", "help", "sidebar",
	// A control that opens a menu of choices above or below it: an account
	// row at the foot of a rail, a workspace switcher.
	"chevron-up-down",
] as const

export type IconName = (typeof ICON_NAMES)[number]

/**
 * Other libraries' names for glyphs the contract already has. Agents and
 * people reach for Lucide's and Heroicons' spellings first (`check-circle`,
 * `settings`, `x`, `more-horizontal`, `cog-6-tooth`); `<Icon>` resolves these
 * to the contract name before it gives up, so a guessed name still draws.
 * Write the contract name in new code — lint says which one.
 */
export const ICON_ALIASES: Readonly<Record<string, IconName>> = {
	// Lucide
	"chevrons-up-down": "chevron-up-down",
	"check-circle": "circle-check",
	"check-circle-2": "circle-check",
	"circle-check-big": "circle-check",
	settings: "gear",
	"settings-2": "sliders",
	cog: "gear",
	x: "xmark",
	close: "xmark",
	"x-circle": "xmark",
	"more-horizontal": "ellipsis",
	"more-vertical": "ellipsis",
	more: "ellipsis",
	"dots-horizontal": "ellipsis",
	"ellipsis-horizontal": "ellipsis",
	"message-square": "comment",
	"message-circle": "comment",
	message: "comment",
	messages: "comment",
	chat: "comment",
	menu: "bars",
	hamburger: "bars",
	"help-circle": "help",
	"circle-help": "help",
	question: "help",
	"circle-question": "help",
	"alert-triangle": "warning",
	"triangle-alert": "warning",
	"info-circle": "info",
	"circle-info": "info",
	"external-link": "external",
	loader: "spinner",
	"loader-2": "spinner",
	"loader-circle": "spinner",
	"log-out": "logout",
	"sign-out": "logout",
	monitor: "desktop",
	laptop: "desktop",
	"layout-grid": "grid",
	"layout-dashboard": "layout",
	"file-text": "file",
	document: "file",
	"rotate-cw": "refresh",
	"rotate-ccw": "refresh",
	"refresh-cw": "refresh",
	"refresh-ccw": "refresh",
	funnel: "filter",
	"user-circle": "user",
	"circle-user": "user",
	person: "user",
	people: "users",
	team: "users",
	"user-group": "users",
	"users-round": "users",
	box: "archive",
	"archive-box": "archive",
	columns: "kanban",
	"columns-3": "kanban",
	board: "kanban",
	"square-kanban": "kanban",
	"sliders-horizontal": "sliders",
	"sliders-vertical": "sliders",
	adjustments: "sliders",
	"panel-left": "sidebar",
	"sidebar-left": "sidebar",
	"calendar-days": "calendar",
	house: "home",
	pencil: "edit",
	"edit-2": "edit",
	"edit-3": "edit",
	"square-pen": "edit",
	"trash-2": "trash",
	delete: "trash",
	envelope: "mail",
	"arrow-path": "refresh",
	"eye-slash": "eye-off",
	"lock-closed": "lock",
	"paper-airplane": "send",
	"paper-clip": "paperclip",
	"arrow-down-tray": "download",
	"arrow-up-tray": "upload",
	"magnifying-glass": "search",
	"cog-6-tooth": "gear",
	"bars-3": "bars",
	"chat-bubble-left": "comment",
	"exclamation-triangle": "warning",
	"information-circle": "info",
	"question-mark-circle": "help",
	"adjustments-horizontal": "sliders",
	"squares-2x2": "grid",
	"view-columns": "kanban",
	"arrow-top-right-on-square": "external",
	"computer-desktop": "desktop",
	"x-mark": "xmark",
	"document-text": "file",
}

/** The contract name an alias stands for, or `undefined` when it is not one. */
export function resolveIconAlias(name: string): IconName | undefined {
	const target = ICON_ALIASES[name]
	return target && target !== name ? target : undefined
}

/** Edit distance, for "did you mean" — small strings, so the plain DP is fine. */
function distance(a: string, b: string): number {
	const row = Array.from({ length: b.length + 1 }, (_, i) => i)
	for (let i = 1; i <= a.length; i++) {
		let previous = row[0]
		row[0] = i
		for (let j = 1; j <= b.length; j++) {
			const current = row[j]
			row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
			previous = current
		}
	}
	return row[b.length]
}

/**
 * Up to three contract names closest to `name`: ones that share a word with it
 * first (`user-avatar` → user), then by edit distance.
 */
export function nearestIconNames(name: string, limit = 3): string[] {
	const parts = new Set(name.toLowerCase().split(/[-_\s]+/).filter(Boolean))
	return [...ICON_NAMES]
		.map((candidate) => {
			const shared = candidate.split("-").some((part) => parts.has(part))
			return { candidate, score: distance(name.toLowerCase(), candidate) - (shared ? 3 : 0) }
		})
		.sort((a, b) => a.score - b.score)
		.slice(0, limit)
		.map(({ candidate }) => candidate)
}
