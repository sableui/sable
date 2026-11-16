/**
 * Vendor Sable's Reicon glyphs into `src/icon-sets/reicon.generated.ts` and
 * `src/icon-sets/reicon-solid.generated.ts`.
 *
 * Sable used to import one `reicon-react/icons/*` module per glyph at runtime.
 * Every one of those modules carries BOTH weights as SVG strings, at the
 * 5-significant-digit precision the artwork was exported with, so the default
 * set cost every consumer about 275 kB minified (87 kB gzip) — most of it the
 * Filled weight that a handful of call sites use, and decimals no screen can
 * show on a 24-unit box.
 *
 * So the glyphs are read here, once, from the installed and lockfile-pinned
 * package, and committed as plain markup:
 *
 *   - Outline for every name in the contract — the default set.
 *   - Filled only for SOLID_IN_DEFAULT, the glyphs Sable's own components and
 *     blocks draw solid (LikeButton's pressed heart, the media transport, the
 *     overflow menu's dots…). Without them the library would change look.
 *   - Filled for everything else in a second file, served by the opt-in
 *     `@sableui/react/icons/reicon-solid` subpath.
 *
 * Coordinates are rounded to 2 decimals. Path data is made absolute first and
 * every point rounded on that absolute grid, then re-emitted as whichever of
 * the absolute or relative form is shorter, measured from the ROUNDED previous
 * point — so rounding never accumulates along a path. The largest positional
 * error is 0.005 of a 24-unit box: 0.02 px on a 96 px glyph.
 *
 *   pnpm icons:reicon            # regenerate
 *   pnpm icons:reicon:check     # fail if the committed files are stale
 *
 * The upstream MIT notice is retained in third-party/reicon-LICENSE.txt.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(HERE, "..", "src", "icon-sets")
const OUT = join(OUT_DIR, "reicon.generated.ts")
const OUT_SOLID = join(OUT_DIR, "reicon-solid.generated.ts")
// The package root, as the brand script reads reicon-brands: its `exports`
// map does not expose package.json, so it cannot be require.resolve()d.
const REICON_DIR = join(HERE, "..", "node_modules", "reicon-react")
const REICON_VERSION = JSON.parse(readFileSync(join(REICON_DIR, "package.json"), "utf8")).version

/** Sable's semantic name → Reicon's glyph. The contract lives in src/icon/names.ts. */
const ICONS = {
	eyedropper: "Pipette",
	heart: "Heart",
	comment: "Comment",
	share: "Share",
	gem: "GemSparkle",
	// `Images`, not `Images2`: reicon-react renamed this glyph in 1.1.301.
	"image-stack": "Images",
	home: "Home",
	bell: "Bell",
	gear: "Gear",
	user: "User",
	search: "Search",
	plus: "Plus",
	minus: "Minus",
	check: "Check",
	xmark: "Xmark",
	"chevron-down": "ChevronDown",
	"chevron-up": "ChevronUp",
	"chevron-up-down": "ChevronExpandY",
	"arrow-up": "ArrowUp",
	"arrow-up-right": "ArrowUpRight",
	"chevron-left": "ChevronLeft",
	"chevron-right": "ChevronRight",
	expand: "Expand",
	eye: "Eye",
	"eye-off": "EyeOff",
	external: "LinkSquare",
	spinner: "Loader",
	ellipsis: "MoreH",
	info: "InfoCircle",
	warning: "TriangleWarning",
	"circle-check": "CheckCircle",
	calendar: "Calendar",
	copy: "Copy",
	file: "File",
	folder: "Folder",
	sun: "Sun",
	moon: "Moon",
	desktop: "Monitor",
	lock: "Lock",
	list: "List",
	bars: "Menu",
	grid: "Grid",
	layout: "Layout",
	book: "Book",
	component: "Component2",
	sparkles: "Sparkles",
	// Media, motion, mail and editing: added when an audit found demos using
	// search/check/xmark as stand-ins and components hand-drawing play/pause.
	play: "Play",
	pause: "Pause",
	next: "Next",
	previous: "Previous",
	"arrow-down": "ArrowDown",
	"arrow-left": "ArrowLeft",
	"arrow-right": "ArrowRight",
	clock: "Clock",
	send: "Send",
	trash: "Trash",
	edit: "Edit",
	download: "Download",
	upload: "Upload",
	link: "Link",
	inbox: "Inbox",
	mail: "Envelope",
	logout: "Logout",
	star: "Star",
	refresh: "Refresh",
	filter: "Filter",
	bold: "Bold",
	italic: "Italic",
	// A stop control for a streaming reply (ChatComposer used xmark, which
	// reads as close), passkey and wallet sign-in, and a per-answer rating.
	stop: "Stop",
	key: "Key",
	wallet: "Wallet",
	"thumbs-up": "ThumbsUp",
	"thumbs-down": "ThumbsDown",
	// A music player's transport and volume. Same speaker outline across the
	// volume trio, so a mute toggle swaps the waves without the glyph jumping.
	shuffle: "Shuffle",
	repeat: "Repeat",
	"repeat-one": "RepeatOne",
	volume: "VolumeHigh",
	"volume-low": "VolumeLow2",
	"volume-off": "VolumeCross",
	queue: "Playlist",
	music: "MusicNote",
	// A support inbox's labels, attachments, reports, priority and mentions.
	tag: "Tag",
	paperclip: "Paperclip",
	chart: "ChartBar",
	flag: "Flag",
	"at-sign": "AtSign",
	// Preview controls: a motion level (not `sparkles`, which reads as AI) and
	// replaying an animation (not `refresh`, which reads as fetching again).
	replay: "Restart",
	motion: "PlaybackSpeed",
	// The add-reaction pill under a chat bubble.
	emoji: "EmojiHappy",
	// A portfolio's work, projects, audio, video, live, press, design and games
	// sections. `broadcast` is the radiating-waves mark that reads as "live";
	// `newspaper` is Reicon's folded paper; `palette` is the painter's palette,
	// not Reicon's `Palette` (a swatch fan, which reads as colour picking).
	briefcase: "Briefcase",
	layers: "Layers",
	microphone: "Microphone",
	video: "Video",
	broadcast: "SignalStream",
	newspaper: "Doc2",
	palette: "Palette2",
	gamepad: "Gamepad",
	// An issue tracker's team list, backlog, board view, display options and
	// help; `sidebar` is the left-panel toggle a collapsible rail needs.
	users: "Users",
	archive: "Archive",
	kanban: "Kanban",
	sliders: "Sliders",
	help: "HelpCircle",
	sidebar: "SidebarLeft",
}

/**
 * The glyphs the library itself draws with `variant="solid"`, so the default
 * set keeps their Filled weight. src/icon-sets/reicon.test.tsx scans the
 * source for solid call sites and fails when one names a glyph missing here.
 */
const SOLID_IN_DEFAULT = [
	"heart", // LikeButton, pressed
	"play", // Video, MediaTile, MediaPlayerBlock, playPauseGlyph
	"pause",
	"next",
	"previous",
	"stop", // ChatComposer while streaming
	"ellipsis", // OverflowMenu, PostBlock
	"circle-check", // ReserveTableBlock
	"gem", // the page patterns' brand mark
]

const PRECISION = 100 // hundredths

/* ------------------------------------------------------------------ */
/* Path data                                                           */
/* ------------------------------------------------------------------ */

const ARG_COUNT = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 }
const NUMBER = /^[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/

function parsePath(d) {
	const segments = []
	let i = 0
	const skip = () => {
		while (i < d.length && /[\s,]/.test(d[i])) i++
	}
	const number = () => {
		skip()
		const match = NUMBER.exec(d.slice(i))
		if (!match) throw new Error(`bad path number at ${i}: "${d.slice(i, i + 12)}"`)
		i += match[0].length
		return Number.parseFloat(match[0])
	}
	// Arc flags may be written run together ("a1 1 0 01.5.5"), so read one char.
	const flag = () => {
		skip()
		const c = d[i]
		if (c !== "0" && c !== "1") throw new Error(`bad arc flag at ${i}`)
		i++
		return Number(c)
	}
	while (true) {
		skip()
		if (i >= d.length) break
		const letter = d[i]
		const upper = letter.toUpperCase()
		if (!(upper in ARG_COUNT)) throw new Error(`unknown path command "${letter}"`)
		i++
		if (upper === "Z") {
			segments.push({ letter, args: [] })
			continue
		}
		let current = letter
		do {
			const args = []
			for (let k = 0; k < ARG_COUNT[upper]; k++) args.push(upper === "A" && (k === 3 || k === 4) ? flag() : number())
			segments.push({ letter: current, args })
			// Pairs after a moveto are implicit linetos.
			if (upper === "M") current = letter === "M" ? "L" : "l"
			skip()
		} while (i < d.length && !/[a-zA-Z]/.test(d[i]))
	}
	return segments
}

/** Every segment as absolute coordinates, with the letter's case normalized. */
function absolutize(segments) {
	let x = 0
	let y = 0
	let sx = 0
	let sy = 0
	return segments.map(({ letter, args }) => {
		const upper = letter.toUpperCase()
		const rel = letter !== upper
		const ox = rel ? x : 0
		const oy = rel ? y : 0
		let out
		switch (upper) {
			case "Z":
				x = sx
				y = sy
				return { cmd: "Z", args: [] }
			case "H":
				out = [args[0] + ox]
				x = out[0]
				return { cmd: "H", args: out }
			case "V":
				out = [args[0] + oy]
				y = out[0]
				return { cmd: "V", args: out }
			case "A":
				out = [args[0], args[1], args[2], args[3], args[4], args[5] + ox, args[6] + oy]
				break
			default:
				out = args.map((v, k) => v + (k % 2 === 0 ? ox : oy))
		}
		x = out[out.length - 2]
		y = out[out.length - 1]
		if (upper === "M") {
			sx = x
			sy = y
		}
		return { cmd: upper, args: out }
	})
}

const q = (v) => {
	const r = Math.round(v * PRECISION)
	return r === 0 ? 0 : r // no -0
}

/** Hundredths → the shortest decimal text ("-.5", "12", "3.25"). */
function fmt(h) {
	if (h === 0) return "0"
	const neg = h < 0
	const a = Math.abs(h)
	const int = Math.floor(a / PRECISION)
	const frac = a % PRECISION
	let s = String(int)
	if (frac) s = `${int ? int : ""}.${String(frac).padStart(2, "0").replace(/0+$/, "")}`
	return neg ? `-${s}` : s
}

function joinNumbers(values) {
	let out = ""
	let prev = ""
	for (const s of values) {
		if (prev === "") out += s
		else if (s[0] === "-") out += s
		else if (s[0] === "." && prev.includes(".")) out += s
		else out += ` ${s}`
		prev = s
	}
	return out
}

/** Rounded, shortest-form path data. */
function roundPath(d) {
	const abs = absolutize(parsePath(d))
	let cx = 0
	let cy = 0
	let sx = 0
	let sy = 0
	let lastLetter = ""
	let out = ""
	for (const { cmd, args } of abs) {
		if (cmd === "Z") {
			out += "z"
			lastLetter = "z"
			cx = sx
			cy = sy
			continue
		}
		let absArgs
		let relArgs
		if (cmd === "H") {
			absArgs = [q(args[0])]
			relArgs = [absArgs[0] - cx]
		} else if (cmd === "V") {
			absArgs = [q(args[0])]
			relArgs = [absArgs[0] - cy]
		} else if (cmd === "A") {
			absArgs = [q(args[0]), q(args[1]), q(args[2]), args[3] * PRECISION, args[4] * PRECISION, q(args[5]), q(args[6])]
			relArgs = [...absArgs.slice(0, 5), absArgs[5] - cx, absArgs[6] - cy]
		} else {
			absArgs = args.map(q)
			relArgs = absArgs.map((v, k) => v - (k % 2 === 0 ? cx : cy))
		}
		const absText = joinNumbers(absArgs.map(fmt))
		const relText = joinNumbers(relArgs.map(fmt))
		// The first moveto stays absolute; elsewhere take the shorter spelling.
		const useRel = out !== "" && relText.length < absText.length
		const letter = useRel ? cmd.toLowerCase() : cmd
		const text = useRel ? relText : absText
		// A repeated letter can be dropped, except a moveto (repeats mean lineto).
		const omit = letter === lastLetter && cmd !== "M"
		if (omit) out += text[0] === "-" || (text[0] === "." && lastNumberHasDot(out)) ? text : ` ${text}`
		else out += letter + text
		lastLetter = letter
		if (cmd === "H") cx = absArgs[0]
		else if (cmd === "V") cy = absArgs[0]
		else {
			cx = absArgs[absArgs.length - 2]
			cy = absArgs[absArgs.length - 1]
		}
		if (cmd === "M") {
			sx = cx
			sy = cy
		}
	}
	return out
}

function lastNumberHasDot(text) {
	const m = /[-+]?[\d.]+$/.exec(text)
	return Boolean(m && m[0].includes("."))
}

/* ------------------------------------------------------------------ */
/* Markup                                                              */
/* ------------------------------------------------------------------ */

const GEOMETRY_ATTRS = new Set(["cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "x1", "y1", "x2", "y2"])

function roundNumberList(text) {
	return text.replace(/[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g, (n) => fmt(q(Number.parseFloat(n))))
}

function roundMarkup(markup, where) {
	return markup
		.replace(/>\s+</g, "><")
		.trim()
		.replace(/\s([\w-]+)="([^"]*)"/g, (whole, attr, value) => {
			try {
				if (attr === "d") return ` d="${roundPath(value)}"`
				if (attr === "points" || attr === "transform") return ` ${attr}="${roundNumberList(value).replace(/\s+/g, " ").trim()}"`
				if (GEOMETRY_ATTRS.has(attr) && /^[-+]?[\d.]+(?:e[-+]?\d+)?$/i.test(value)) return ` ${attr}="${fmt(q(Number.parseFloat(value)))}"`
			} catch (error) {
				throw new Error(`${where}: ${error.message}`)
			}
			return whole
		})
}

/** Both weights of one Reicon glyph, read from the installed module source. */
function readGlyph(component) {
	const source = readFileSync(join(REICON_DIR, "icons", `${component}.js`), "utf8")
	const weight = (key) => source.match(new RegExp(`\\b${key}: \`([^\`]*)\``))?.[1] ?? null
	const outline = weight("O")
	const filled = weight("F")
	if (!outline) throw new Error(`${component}: no Outline weight in reicon-react ${REICON_VERSION}`)
	return { outline, filled }
}

function assertNoColor(name, markup) {
	const hits = markup.match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(/gi)
	if (hits) throw new Error(`${name}: glyph names a color (${hits.join(", ")}) — it must draw in currentColor`)
}

function entries(map) {
	return Object.entries(map)
		.map(([name, markup]) => `\t${JSON.stringify(name)}: ${JSON.stringify(markup)},`)
		.join("\n")
}

const HEADER = `// GENERATED by scripts/build-reicon-icons.mjs — do not edit.
// Refresh: pnpm icons:reicon. Reads the installed reicon-react ${REICON_VERSION} offline.
//
// Inner SVG markup on a 0 0 24 24 viewBox, coordinates rounded to 2 decimals,
// drawn in currentColor. Retain third-party/reicon-LICENSE.txt (MIT).
`

function render(outline, solidCore) {
	return `${HEADER}
/** Outline weight, keyed by Sable's semantic icon name. */
export const REICON_OUTLINE: Record<string, string> = {
${entries(outline)}
}

/**
 * Filled weight for the glyphs Sable's own components draw solid. The rest of
 * the Filled weight is in reicon-solid.generated.ts, behind its own subpath.
 */
export const REICON_SOLID_CORE: Record<string, string> = {
${entries(solidCore)}
}
`
}

function renderSolid(solidRest) {
	return `${HEADER}
/** Filled weight for every contract glyph not already in REICON_SOLID_CORE. */
export const REICON_SOLID_REST: Record<string, string> = {
${entries(solidRest)}
}
`
}

const outline = {}
const solidCore = {}
const solidRest = {}
let rawBytes = 0
let roundedBytes = 0
for (const [name, component] of Object.entries(ICONS)) {
	const glyph = readGlyph(component)
	const o = roundMarkup(glyph.outline, `${name} outline`)
	assertNoColor(name, o)
	outline[name] = o
	rawBytes += glyph.outline.length
	roundedBytes += o.length
	if (glyph.filled) {
		const f = roundMarkup(glyph.filled, `${name} filled`)
		assertNoColor(name, f)
		;(SOLID_IN_DEFAULT.includes(name) ? solidCore : solidRest)[name] = f
		rawBytes += glyph.filled.length
		roundedBytes += f.length
	}
}
for (const name of SOLID_IN_DEFAULT) {
	if (!(name in ICONS)) throw new Error(`SOLID_IN_DEFAULT names "${name}", which is not in ICONS`)
	if (!(name in solidCore)) throw new Error(`${ICONS[name]} has no Filled weight for "${name}"`)
}

const files = [
	[OUT, render(outline, solidCore)],
	[OUT_SOLID, renderSolid(solidRest)],
]

if (process.argv.includes("--check")) {
	let stale = false
	for (const [file, next] of files) {
		let current = ""
		try {
			current = readFileSync(file, "utf8")
		} catch {}
		if (current.replace(/\r\n/g, "\n") !== next) {
			console.error(`[reicon-icons] ✗ ${file.split(/[\\/]/).pop()} is out of date — run \`pnpm icons:reicon\`.`)
			stale = true
		}
	}
	if (stale) process.exit(1)
	console.log(`[reicon-icons] ✓ ${Object.keys(outline).length} glyphs in sync.`)
} else {
	for (const [file, next] of files) writeFileSync(file, next)
	console.log(
		`[reicon-icons] ✓ wrote ${Object.keys(outline).length} outline, ${Object.keys(solidCore).length} default solid and ${Object.keys(solidRest).length} opt-in solid glyphs (${(rawBytes / 1024).toFixed(1)} kB of markup → ${(roundedBytes / 1024).toFixed(1)} kB).`,
	)
}
