/**
 * adoption — how much of an app's UI is actually built from Sable.
 *
 * Wiring can be perfect while the app composes none of it: an agent that never
 * loaded the skill sees Tailwind and a stylesheet and writes its own Button, its
 * own Modal, its own Tabs on top of Sable's tokens. Lint catches a raw
 * `<button>` with classes; it cannot see that `function Modal()` is a dialog
 * Sable already ships, or that forty UI files import nothing from the package.
 *
 * This reads the source lexically, like grade, and answers three things:
 *
 *   - level: how many UI files compose Sable at all
 *   - swaps: app-defined components named for something Sable ships, which the
 *            file does not itself build on (behaviour first: those are where
 *            focus, keyboard and ARIA bugs live)
 *   - foundation: "sable" when Sable already carries the UI; otherwise whether
 *            the app has its own system to respect (another UI library, or a
 *            folder of its own primitives) or is ad hoc
 *
 * It never fails anything. It is the evidence an agent shows the user when it
 * asks whether to move app-built UI onto Sable, and the wording of that ask
 * depends on the foundation: firm when there is none, gentle when there is one.
 */

/** Groups whose components own behaviour (focus, keyboard, ARIA). */
const BEHAVIOUR_GROUPS = new Set(["Actions", "Forms", "Overlays", "Navigation", "Selection"])
const BEHAVIOUR_NAMES = new Set(["Accordion", "Collapsible", "Carousel", "Toast", "DataTable", "CommandMenu"])

/** Other component libraries, by import specifier. */
const LIBRARIES = [
	[/^@mui\//, "MUI"],
	[/^@chakra-ui\//, "Chakra UI"],
	[/^antd(?:$|\/)/, "Ant Design"],
	[/^@mantine\//, "Mantine"],
	[/^react-bootstrap(?:$|\/)/, "React Bootstrap"],
	[/^@headlessui\//, "Headless UI"],
	[/^@radix-ui\//, "Radix"],
	[/^@(?:nextui-org|heroui)\//, "HeroUI"],
	[/^(?:react-aria-components$|@react-aria\/)/, "React Aria"],
	[/^primereact(?:$|\/)/, "PrimeReact"],
	[/^flowbite-react(?:$|\/)/, "Flowbite"],
	[/^@ark-ui\//, "Ark UI"],
]
/** shadcn/ui-style primitives: `@/components/ui/button`, `../components/ui/dialog`. */
const SHADCN = /(?:^|\/)components\/ui\/[a-z][\w-]*$/
/** Where an app keeps a system of its own. */
const PRIMITIVES_DIR = /(?:^|\/)(?:ui|primitives|design-system|ds)\//i
/** Names that are an app's own structure, never a control it rebuilt. */
const STRUCTURAL = /^(?:App|Root|Main|Home|Index)$|(?:Page|Layout|Provider|Context|Screen|View|Routes?|Router|Story|Stories|Demo|Example|Icon|Logo)$/

const IMPORT = /import\s+(?:type\s+)?([\s\S]*?)\s+from\s*["']([^"']+)["']/g
const DECLARATIONS = [
	/(?:^|\n)[ \t]*(?:export\s+(?:default\s+)?)?function\s+([A-Z]\w*)\s*[(<]/g,
	/(?:^|\n)[ \t]*(?:export\s+)?const\s+([A-Z]\w*)\s*(?::[^=\n]+)?=\s*(?:React\.)?(?:forwardRef|memo)\b/g,
	/(?:^|\n)[ \t]*(?:export\s+)?const\s+([A-Z]\w*)\s*(?::[^=\n]+)?=\s*(?:async\s*)?\([^)]*\)\s*(?::[^=\n]+)?=>/g,
]

const normalize = (s) => s.toLowerCase().replace(/[\s_-]+/g, "")
const words = (name) => name.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z0-9]+/g) ?? [name]
/**
 * Behaviour done by hand, on native elements: what makes a component named
 * Modal or Tabs a rebuild rather than content handed to Sable's (a tooltip
 * body for ActivityHeatmap) or a composition of Sable's own controls (a
 * toolbar of Pill, Select and SearchInput). Handlers on a capitalised tag
 * belong to that component, so only lowercase tags count.
 */
const HAND_BEHAVIOUR = [
	/<(?:button|input|select|textarea|dialog|details)\b/,
	/<[a-z][a-z0-9]*\b[^<>]*\son(?:Click|KeyDown|KeyUp|MouseEnter|MouseLeave|PointerDown|PointerEnter|Focus|Blur)\s*=/,
	/<[a-z][a-z0-9]*\b[^<>]*\srole=["'](?:dialog|alertdialog|tablist|tab|tabpanel|menu|menubar|menuitem|listbox|option|combobox|switch|slider|tooltip|checkbox|radio|radiogroup)["']/,
	/<[a-z][a-z0-9]*\b[^<>]*\saria-(?:expanded|modal|selected|haspopup|pressed|checked)=/,
	/\bcreatePortal\s*\(/,
	/className=["'`][^"'`]*\bfixed\b[^"'`]*\binset-/,
]
const isBehaviour = (c) => BEHAVIOUR_GROUPS.has(c.group) || BEHAVIOUR_NAMES.has(c.name)
const lineOf = (text, index) => text.slice(0, index).split("\n").length

/**
 * A .tsx/.jsx file that renders markup: a closing tag, or a self-closing `/>`
 * (matched bare, since an arrow handler's `=>` sits inside the tag).
 */
const rendersJsx = (text) => /<\/[A-Za-z][\w.]*\s*>|\/>/.test(text)

/**
 * The names apps give the controls they rebuild, mapped to Sable's. Curated
 * rather than read from registry keywords: those are written for search, so
 * "list", "panel" and "preview" tie half an app's own components to something.
 */
const ALIASES = {
	modal: ["Dialog"], dropdown: ["Menu", "Select"], dropdownmenu: ["Menu"], popup: ["Popover"],
	drawer: ["Sheet"], sidesheet: ["Sheet"], bottomsheet: ["Sheet"], snackbar: ["Toast"], notification: ["Toast"],
	spinner: ["Spinner"], loader: ["Spinner", "Skeleton"], progressbar: ["Progress"], autocomplete: ["Combobox"],
	typeahead: ["Combobox"], multiselect: ["Combobox"], textfield: ["Input"], textinput: ["Input"], searchbar: ["SearchInput"],
	searchbox: ["SearchInput"], searchfield: ["SearchInput"], iconbutton: ["Button"], fileupload: ["FileDropzone"],
	uploader: ["FileDropzone"], dropzone: ["FileDropzone"], collapse: ["Collapsible"], disclosure: ["Collapsible"],
	commandpalette: ["CommandMenu"], datepicker: ["DatePicker"], toggleswitch: ["Switch"], segmentedcontrol: ["Tabs", "ButtonGroup"],
	tabbar: ["Tabs", "BottomNav"], navbar: ["AppHeader", "NavigationMenu"], topbar: ["AppHeader"], breadcrumb: ["Breadcrumbs"],
	chip: ["Pill", "Badge"], tag: ["Badge"], alert: ["Banner"], callout: ["Note"], confirmdialog: ["DestructiveActionModal", "Dialog"],
	contextmenu: ["ContextMenu"], hovercard: ["ContextCard"], numberinput: ["NumberField"], otpinput: ["OtpField"], pininput: ["OtpField"],
	colorpicker: ["ColorField"], rating: ["RadioCard"], stepper: ["Stepper"], wizard: ["Stepper"], kbd: ["Kbd"],
	property: ["PropertyRow"], propertyrow: ["PropertyRow"], proprow: ["PropertyRow"], picker: ["Select", "Combobox"],
	statusmark: ["StatusDot"], statusindicator: ["StatusDot"], presencedot: ["StatusDot"], avatarstack: ["AvatarGroup"],
	facepile: ["AvatarGroup"], topnav: ["WorkspaceBar", "AppHeader"], appbar: ["WorkspaceBar", "AppHeader"],
	headerbar: ["WorkspaceBar", "AppHeader"], themetoggle: ["ThemeSwitcher"], modetoggle: ["ThemeSwitcher"],
	darkmodetoggle: ["ThemeSwitcher"], colormodeswitch: ["ThemeSwitcher"],
}

/**
 * The Sable components an app-defined name stands for: its whole name or its
 * last word or two, as a Sable name (`Button`, `PrimaryButton`) or an alias
 * (`Modal`, `SearchModal` → Dialog).
 */
function matcher(components) {
	const byName = new Map(components.map((c) => [c.name.toLowerCase(), c]))
	// Parts count: `PropertyRow`, `WorkspaceBar` and `AvatarGroup` are exported
	// names an app's `Property` or `TeamAvatars` stands in for. A part inherits
	// its entry's group, so a part of a behaviour component is behaviour too.
	for (const c of components)
		for (const s of c.subcomponents ?? []) {
			const name = typeof s === "string" ? s : s.name
			if (name && !byName.has(name.toLowerCase())) byName.set(name.toLowerCase(), { name, group: c.group, partOf: c.name })
		}
	return (appName) => {
		if (STRUCTURAL.test(appName)) return []
		const w = words(appName)
		const candidates = [...new Set([appName, w.slice(-2).join(""), w.at(-1)].filter(Boolean).map(normalize))]
		for (const key of candidates) {
			if (byName.has(key)) return [byName.get(key)]
			const alias = ALIASES[key]?.map((name) => byName.get(name.toLowerCase())).filter(Boolean)
			if (alias?.length) return alias
		}
		return []
	}
}

/**
 * @param {{ files: { rel: string, text: string }[], components: object[], deps?: Record<string, string> | null }} input
 *   files: the app's .tsx/.jsx sources, paths relative to the project.
 */
export function adoptionReport({ files, components, deps = null }) {
	const match = matcher(components)
	const sableUsed = new Set()
	const libraries = new Map()
	let uiFiles = 0
	let sableFiles = 0
	let ownPrimitives = 0
	const swaps = []

	for (const { rel, text } of files) {
		if (!/\.(tsx|jsx)$/.test(rel) || !rendersJsx(text)) continue
		uiFiles++
		const imported = new Set()
		for (const m of text.matchAll(IMPORT)) {
			const from = m[2]
			if (/^@sableui\/react(?:\/|$)/.test(from)) {
				for (const raw of (m[1].match(/\{([^}]*)\}/)?.[1] ?? "").split(",")) {
					const name = raw.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0]?.trim()
					if (name) imported.add(name)
				}
				continue
			}
			const lib = LIBRARIES.find(([re]) => re.test(from))?.[1] ?? (SHADCN.test(from) ? "shadcn/ui-style components/ui" : null)
			if (lib) libraries.set(lib, (libraries.get(lib) ?? 0) + 1)
		}
		if (imported.size) sableFiles++
		for (const name of imported) sableUsed.add(name)

		const declared = new Map()
		for (const re of DECLARATIONS) for (const m of text.matchAll(re)) if (!declared.has(m[1])) declared.set(m[1], m.index + m[0].indexOf(m[1]))
		// Each component's body runs to the next declaration: close enough to
		// tell whose markup a handler or a role belongs to.
		const starts = [...declared.values()].sort((a, b) => a - b)
		const own = PRIMITIVES_DIR.test(rel)
		for (const [name, index] of declared) {
			const hits = match(name)
			if (!hits.length) continue
			if (own) ownPrimitives++
			// Built on the Sable component it is named for: a composition, not a rebuild.
			if (hits.some((c) => imported.has(c.name))) continue
			const behaviour = hits.some(isBehaviour)
			const body = text.slice(index, starts.find((s) => s > index) ?? text.length)
			if (behaviour && !HAND_BEHAVIOUR.some((re) => re.test(body))) continue
			swaps.push({ file: rel, line: lineOf(text, index), name, sable: hits.map((c) => c.name), behaviour, ...(hits[0].partOf ? { partOf: hits[0].partOf } : {}) })
		}
	}

	// A dependency counts even before its first import is found in these paths.
	for (const dep of Object.keys(deps ?? {})) {
		const lib = LIBRARIES.find(([re]) => re.test(dep))?.[1]
		if (lib && !libraries.has(lib)) libraries.set(lib, 0)
	}

	swaps.sort((a, b) => Number(b.behaviour) - Number(a.behaviour))
	const share = uiFiles ? sableFiles / uiFiles : 0
	const behaviourSwaps = swaps.filter((s) => s.behaviour).length
	const level =
		uiFiles === 0 ? "empty"
		: sableFiles === 0 && uiFiles <= 2 ? "fresh"
		: sableFiles === 0 ? "none"
		: share < 0.5 || behaviourSwaps >= 3 ? "low"
		: "sable"
	const foundation = libraries.size ? "library" : level === "sable" ? "sable" : ownPrimitives >= 4 ? "own" : "ad-hoc"

	return {
		informationalOnly: true,
		level,
		foundation,
		uiFiles,
		sableFiles,
		share: +share.toFixed(2),
		sableComponents: [...sableUsed].sort(),
		libraries: [...libraries].map(([name, files]) => ({ name, files })),
		swaps,
		summary: summaryOf({ level, uiFiles, sableFiles, sableUsed, swaps }),
		recommendation: recommendationOf({ level, foundation, libraries, behaviourSwaps }),
	}
}

function summaryOf({ level, uiFiles, sableFiles, sableUsed, swaps }) {
	if (level === "empty") return "No UI files yet."
	if (level === "fresh") return `${uiFiles} UI file(s), none using Sable yet. A starter: build on Sable from here.`
	const built = swaps.length ? `; ${swaps.length} app-built component(s) named for something Sable ships` : ""
	return `${sableFiles} of ${uiFiles} UI files compose Sable (${sableUsed.size} distinct export${sableUsed.size === 1 ? "" : "s"})${built}.`
}

/**
 * What the agent should do with this, in words it can relay. Never "rewrite it":
 * the user decides whether working screens move. The foundation decides how
 * strongly to recommend it.
 */
function recommendationOf({ level, foundation, libraries, behaviourSwaps }) {
	if (level === "empty" || level === "fresh") return "Build new UI from Sable: sable search \"<need>\" before writing a component."
	const names = [...libraries.keys()].join(", ")
	if (level === "sable")
		return libraries.size
			? `Sable is the foundation, alongside ${names}. Keep new UI on Sable; offer the swaps listed when a screen is next touched.`
			: behaviourSwaps
				? "Sable is the foundation. Offer the few swaps listed when those screens are next touched; new UI starts with sable search."
				: "Sable is the foundation. Keep composing from it; new UI starts with sable search."
	if (foundation === "library")
		return `This app also builds on ${names}. Ask the user whether Sable should replace it or only cover new work; don't mix two control libraries on one screen.`
	if (foundation === "own")
		return "This app has its own primitives. Offer the swaps listed, behaviour first, and keep the app's own where the user prefers them."
	return "This app has no component foundation besides Sable. Recommend moving the listed components onto Sable, behaviour first, and ask the user before changing working screens."
}

/** One line per swap, for text output. */
export function swapLines(report, limit = 12, indent = "      ") {
	const lines = report.swaps.slice(0, limit).map((s) => `${indent}${s.file}:${s.line}  ${s.name} → Sable has ${s.sable.join(" or ")}${s.partOf ? ` (part of ${s.partOf})` : ""}${s.behaviour ? " (behaviour)" : ""}`)
	if (report.swaps.length > limit) lines.push(`${indent}… ${report.swaps.length - limit} more: sable grade <paths> --json → adoption.swaps`)
	return lines
}
