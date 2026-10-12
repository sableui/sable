import type { IconComponent, IconWeight } from "reicon-react/createIcon"
import { Pipette } from "reicon-react/icons/Pipette"
import { Key } from "reicon-react/icons/Key"
import { Stop } from "reicon-react/icons/Stop"
import { ThumbsDown } from "reicon-react/icons/ThumbsDown"
import { ThumbsUp } from "reicon-react/icons/ThumbsUp"
import { Wallet } from "reicon-react/icons/Wallet"
import { Bell } from "reicon-react/icons/Bell"
import { Book } from "reicon-react/icons/Book"
import { Calendar } from "reicon-react/icons/Calendar"
import { Check } from "reicon-react/icons/Check"
import { CheckCircle } from "reicon-react/icons/CheckCircle"
import { ChevronDown } from "reicon-react/icons/ChevronDown"
import { ChevronLeft } from "reicon-react/icons/ChevronLeft"
import { ChevronRight } from "reicon-react/icons/ChevronRight"
import { ArrowUp } from "reicon-react/icons/ArrowUp"
import { ChevronUp } from "reicon-react/icons/ChevronUp"
import { Comment } from "reicon-react/icons/Comment"
import { Component2 } from "reicon-react/icons/Component2"
import { Copy } from "reicon-react/icons/Copy"
import { Expand } from "reicon-react/icons/Expand"
import { Eye } from "reicon-react/icons/Eye"
import { EyeOff } from "reicon-react/icons/EyeOff"
import { File } from "reicon-react/icons/File"
import { Folder } from "reicon-react/icons/Folder"
import { Gear } from "reicon-react/icons/Gear"
import { GemSparkle } from "reicon-react/icons/GemSparkle"
import { Grid } from "reicon-react/icons/Grid"
import { Heart } from "reicon-react/icons/Heart"
import { Home } from "reicon-react/icons/Home"
// `Images`, not `Images2`: reicon-react renamed this glyph in 1.1.301 and the
// old name is gone. Sable's peer range said `^1.1.2`, which spans both sides of
// that rename, so the package advertised support for versions its own adapter
// could not resolve — and the failure lands at BUILD time in the consumer
// ("Module not found: reicon-react/icons/Images2"), not here. The peer floor is
// now ^1.1.301 so the claim matches the code. It is the only glyph of the original 43
// this adapter imported that was renamed; the other 42 resolve on both sides.
import { Images } from "reicon-react/icons/Images"
import { InfoCircle } from "reicon-react/icons/InfoCircle"
import { Layout } from "reicon-react/icons/Layout"
import { LinkSquare } from "reicon-react/icons/LinkSquare"
import { List } from "reicon-react/icons/List"
import { Loader } from "reicon-react/icons/Loader"
import { Lock } from "reicon-react/icons/Lock"
import { Menu } from "reicon-react/icons/Menu"
import { Minus } from "reicon-react/icons/Minus"
import { Monitor } from "reicon-react/icons/Monitor"
import { Moon } from "reicon-react/icons/Moon"
import { MoreH } from "reicon-react/icons/MoreH"
import { Plus } from "reicon-react/icons/Plus"
import { Search } from "reicon-react/icons/Search"
import { Share } from "reicon-react/icons/Share"
import { Sparkles } from "reicon-react/icons/Sparkles"
import { Sun } from "reicon-react/icons/Sun"
import { TriangleWarning } from "reicon-react/icons/TriangleWarning"
import { User } from "reicon-react/icons/User"
import { Xmark } from "reicon-react/icons/Xmark"
import { ArrowDown } from "reicon-react/icons/ArrowDown"
import { ArrowLeft } from "reicon-react/icons/ArrowLeft"
import { ArrowRight } from "reicon-react/icons/ArrowRight"
import { Bold } from "reicon-react/icons/Bold"
import { Clock } from "reicon-react/icons/Clock"
import { Download } from "reicon-react/icons/Download"
import { Edit } from "reicon-react/icons/Edit"
import { Envelope } from "reicon-react/icons/Envelope"
import { Filter } from "reicon-react/icons/Filter"
import { Inbox } from "reicon-react/icons/Inbox"
import { Italic } from "reicon-react/icons/Italic"
import { Link } from "reicon-react/icons/Link"
import { Logout } from "reicon-react/icons/Logout"
import { Next } from "reicon-react/icons/Next"
import { Pause } from "reicon-react/icons/Pause"
import { Play } from "reicon-react/icons/Play"
import { Previous } from "reicon-react/icons/Previous"
import { Refresh } from "reicon-react/icons/Refresh"
import { Send } from "reicon-react/icons/Send"
import { Star } from "reicon-react/icons/Star"
import { Trash } from "reicon-react/icons/Trash"
import { Upload } from "reicon-react/icons/Upload"
import { type ComponentProps, memo } from "react"
import type { IconRenderProps, IconSet } from "../icon/registry"

/**
 * Sable's default Reicon adapter. Concrete imports stay here; components use
 * semantic names through <Icon>. Reicon is an external runtime dependency.
 * Extend it with composeIconSets(appExtras, reiconIconSet), or replace it
 * through IconProvider. The icons/reicon subpath remains available.
 */
const ICONS: Record<string, IconComponent> = {
	eyedropper: Pipette,
	heart: Heart,
	comment: Comment,
	share: Share,
	gem: GemSparkle,
	"image-stack": Images,
	home: Home,
	bell: Bell,
	gear: Gear,
	user: User,
	search: Search,
	plus: Plus,
	minus: Minus,
	check: Check,
	xmark: Xmark,
	"chevron-down": ChevronDown,
	"chevron-up": ChevronUp,
	"arrow-up": ArrowUp,
	"chevron-left": ChevronLeft,
	"chevron-right": ChevronRight,
	expand: Expand,
	eye: Eye,
	"eye-off": EyeOff,
	external: LinkSquare,
	spinner: Loader,
	ellipsis: MoreH,
	info: InfoCircle,
	warning: TriangleWarning,
	"circle-check": CheckCircle,
	calendar: Calendar,
	copy: Copy,
	file: File,
	folder: Folder,
	sun: Sun,
	moon: Moon,
	desktop: Monitor,
	lock: Lock,
	list: List,
	bars: Menu,
	grid: Grid,
	layout: Layout,
	book: Book,
	component: Component2,
	sparkles: Sparkles,
	// Media, motion, mail and editing: added when an audit found demos using
	// search/check/xmark as stand-ins and components hand-drawing play/pause.
	play: Play,
	pause: Pause,
	next: Next,
	previous: Previous,
	"arrow-down": ArrowDown,
	"arrow-left": ArrowLeft,
	"arrow-right": ArrowRight,
	clock: Clock,
	send: Send,
	trash: Trash,
	edit: Edit,
	download: Download,
	upload: Upload,
	link: Link,
	inbox: Inbox,
	mail: Envelope,
	logout: Logout,
	star: Star,
	refresh: Refresh,
	filter: Filter,
	bold: Bold,
	italic: Italic,
	// Added when the page patterns needed them: a stop control for a streaming
	// reply (ChatComposer used xmark, which reads as close), passkey and wallet
	// sign-in, and a per-answer rating.
	stop: Stop,
	key: Key,
	wallet: Wallet,
	"thumbs-up": ThumbsUp,
	"thumbs-down": ThumbsDown,
}

/** Sable's `variant` → Reicon's weight names. */
const WEIGHTS: Record<string, IconWeight> = {
	regular: "Outline",
	solid: "Filled",
}

export const reiconIconSet: IconSet = ({
	name,
	variant,
	spin,
	className,
	title,
}: IconRenderProps) => {
	const Glyph = ICONS[name]
	// null, not an empty element: that's the signal `composeIconSets` falls
	// through on, and an empty fragment here would win and render nothing.
	if (!Glyph) return null
	const a11y = title
		? { role: "img" as const, "aria-label": title }
		: { "aria-hidden": true as const }
	return (
		<ReiconGlyph
			glyph={Glyph}
			weight={WEIGHTS[variant] ?? "Outline"}
			className={spin ? `motion-spin ${className ?? ""}` : className}
			{...a11y}
		/>
	)
}

// Drop Reicon's inline `color`. `createIcon` defaults to
// `style={{ color: 'currentColor', ...style }}`, and an inline declaration
// outranks a class — so every `text-*` utility Sable or a consumer puts on an
// icon was silently dead, and the glyph always took its parent's ink. `Note`'s
// whole severity-colored-icon contract was off for anyone on the default set.
// Passing `color: undefined` makes the spread erase the default and React omit
// the property, so the class governs and `currentColor` still applies by
// inheritance — identical result everywhere a tint was NOT intended.
const NO_INLINE_COLOR = { color: undefined }

/**
 * Memoized, so an icon whose props have not changed does not re-render.
 * Reicon draws with `dangerouslySetInnerHTML` and a fresh `{ __html }` per
 * render, which React 19 writes back to the DOM every time: every re-render of
 * a parent replaced the glyph's paths. Inside Base UI's Toast.Content, which
 * re-measures on any DOM change and re-renders in reply, that never settled
 * and froze the page. The props are all primitives or module constants, so the
 * shallow compare holds.
 */
const ReiconGlyph = memo(function ReiconGlyph({
	glyph: Glyph,
	...props
}: { glyph: IconComponent } & Omit<ComponentProps<IconComponent>, "size" | "style" | "ref">) {
	return <Glyph size="1em" style={NO_INLINE_COLOR} {...props} />
})

/** The semantic names this adapter maps — useful for a coverage assertion. */
export const reiconIconNames = Object.keys(ICONS)
