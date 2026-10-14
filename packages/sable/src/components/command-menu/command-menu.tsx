"use client";

import type {
	ComponentProps,
	ComponentPropsWithRef,
	KeyboardEvent,
	ReactNode,
} from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { Icon } from "../../icon";
import { cn } from "../../lib/cn";
import { useAnchoredDensity, useTypeTier } from "../../lib/density";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "../dialog/dialog";
import { mergeRefs } from "../../lib/refs";
import { Button } from "../button";
import { Scroller } from "../scroller/scroller";

/**
 * CommandMenu — a command palette (Cmd+K surface) built pragmatically on our own
 * Dialog. The DialogContent is overridden into a top-aligned wide palette with a
 * search header and a scrollable, JS-filtered list of commands.
 *
 * Accessibility follows the ARIA combobox-with-listbox pattern: the search input
 * is a `role="combobox"` that owns a `role="listbox"` popup; ArrowUp/Down/Home/End
 * move a virtual `aria-activedescendant` highlight while keyboard focus stays in
 * the input, and Enter activates the highlighted option. Rows are `role="option"`
 * and never individually focusable. The Dialog gets a (visually hidden) title and
 * description so the surface is announced.
 *
 * Two ways to supply commands:
 *
 * 1. Declaratively, via children (CommandMenuGroup / CommandMenuItem):
 *
 *   <CommandMenu open={open} onOpenChange={setOpen}>
 *     <CommandMenuGroup label="Navigation">
 *       <CommandMenuItem onSelect={() => goHome()}>
 *         <Icon name="home" /> Go home
 *       </CommandMenuItem>
 *     </CommandMenuGroup>
 *   </CommandMenu>
 *
 * 2. Data-driven, via the `items` prop:
 *
 *   <CommandMenu open={open} onOpenChange={setOpen} items={[
 *     { group: "Navigation", label: "Go home", icon: "home", onSelect: goHome },
 *   ]} />
 *
 * Filtering is a case-insensitive substring match on each item's label — until
 * you say otherwise. `filter` hands that decision back: a function replaces the
 * match, and `null` turns it off entirely so `items` renders exactly as given.
 * Which rows survive a query and in what order is the one thing a palette in a
 * real app has to own, and `includes()` cannot express ranking, subsequence
 * matching, or a group lifted above another because its best row won.
 *
 * Inline: `CommandMenuPanel` takes the same props minus the Dialog's (`open`,
 * `onOpenChange`, `finalFocus`, `description`) and renders the same palette on a
 * card in the page. Both are thin shells over one internal body, so the
 * combobox, keyboard model and filtering exist once.
 *
 * `className` lands on the dialog surface; `listClassName` on the scrolling list,
 * which is a `Scroller` — so a long palette fades at the edge it can still scroll
 * toward, and a caller who wants a different cap has somewhere to put it.
 */

/** A single command described as data, used with the `items` prop. */
export interface CommandItem {
	/**
	 * Stable identity, if the caller has one. Nothing here needs it — but a
	 * `filter` is handed `CommandItem[]` and must hand `CommandItem[]` back, so
	 * without an identity field a caller that ranks over its own richer model
	 * (the one carrying the key its recents list is stored under) cannot map the
	 * array it is given onto that model, and ends up closing over the model and
	 * ignoring the argument. `label` is the only other candidate and is neither
	 * guaranteed unique nor stable across a rename.
	 *
	 * When present it also becomes the row's DOM id (namespaced to this palette,
	 * so it cannot collide with anything else on the page) and its React key, so
	 * two rows may share a label.
	 */
	id?: string;
	/** Group heading this item belongs to. */
	group: string;
	/** Visible label; also what the built-in filter matches against. */
	label: string;
	/** Invoked when the item is chosen. The menu closes afterward. */
	onSelect: () => void;
	/** Optional leading icon (semantic name, e.g. "home"). */
	icon?: string;
	/**
	 * A leading visual of your own in place of `icon`: a product thumbnail, an
	 * Avatar. Decorative, since the label names the row; size it to the row
	 * (`size-8` beside a `stacked` detail).
	 */
	leading?: ReactNode;
	/** Secondary text after the label — a destination, a type, an owner. */
	detail?: ReactNode;
	/**
	 * Put `detail` on its own line under the label instead of after it. For
	 * results that only their detail tells apart (two tickets with one subject):
	 * beside a long label the detail truncates first.
	 */
	stacked?: boolean;
	/**
	 * End-aligned trailing slot: a shortcut (`<Kbd>`), a count — or, when the row
	 * is `disabled`, the reason it is.
	 */
	hint?: ReactNode;
	/**
	 * Listed but unavailable. The row stays in the list, stays announced, and
	 * stays reachable by arrow key so its `hint` can be read; Enter does nothing.
	 * A palette that hides what you cannot currently do teaches you nothing about
	 * why you cannot do it.
	 */
	disabled?: boolean;
}

/**
 * Decides which items a query leaves, and in what order.
 *
 * A function replaces the built-in substring match and its returned order is
 * kept verbatim — including group order, which follows each group's first
 * appearance in the array. `null` skips filtering altogether, for a caller that
 * has already ranked the list itself.
 *
 * The items it receives are the same objects it was given, so `CommandItem.id`
 * (or an identity map keyed by it) is how a caller ranking over a richer model
 * gets back from this array to that model.
 *
 * The query arrives raw: trimming and case are policy, and this is the prop that
 * hands policy over.
 */
export type CommandFilter =
	| ((items: CommandItem[], query: string) => CommandItem[])
	| null;

function defaultFilter(items: CommandItem[], query: string): CommandItem[] {
	const q = query.trim().toLowerCase();
	if (!q) return items;
	return items.filter((item) => item.label.toLowerCase().includes(q));
}

export interface CommandMenuProps
	extends Omit<ComponentPropsWithRef<"div">, "title"> {
	/** Controlled open state. */
	open: boolean;
	/** Open-state change handler (close on select / Esc / outside). */
	onOpenChange: (open: boolean) => void;
	/** Data-driven commands. Ignored when `children` are provided. */
	items?: CommandItem[];
	/**
	 * Controlled query. Leave undefined to let the palette own it (it still
	 * resets on close either way — a controlled caller gets `onQueryChange("")`).
	 */
	query?: string;
	/** Query change handler. Required to control `query`, optional otherwise. */
	onQueryChange?: (query: string) => void;
	/**
	 * Replace or disable the built-in substring match. A function ranks and
	 * filters `items` itself; `null` renders `items` verbatim.
	 *
	 * Supplying either also stops declarative `CommandMenuItem` children
	 * self-filtering — if you own which rows exist, you own all of them.
	 */
	filter?: CommandFilter;
	/**
	 * Classes for the scrolling list, which is a `Scroller` — so `className`
	 * (which lands on the dialog surface) cannot reach it, and the list's own
	 * height cap is what a caller most often wants to change.
	 *
	 * The cap must land on the element that scrolls, which since 0.43 is the
	 * Scroller itself: `listClassName="max-h-[60vh]"` is enough.
	 */
	listClassName?: string;
	/** Placeholder for the search input. @default "Type a command or search…" */
	placeholder?: string;
	/** Copy shown when the query matches nothing. @default "No results found." */
	emptyMessage?: string;
	/**
	 * Accessible name for the palette dialog (visually hidden).
	 * @default "Command menu"
	 */
	title?: string;
	/**
	 * Accessible description for the palette dialog (visually hidden). Announced
	 * to assistive tech when the palette opens.
	 * @default "Search for a command and press Enter to run it."
	 */
	description?: string;
	/**
	 * Where focus goes when the palette closes, forwarded to the Dialog.
	 *
	 * The default returns it to the *trigger* — a `CommandMenuTrigger` when the
	 * palette has one. A palette opened by the keystroke alone has none, since
	 * that can arrive from anywhere. Pass a ref or a resolver
	 * to put focus back where it was, or `false` to restore nothing (right when
	 * the palette was opened over a canvas with nothing focused).
	 */
	finalFocus?: ComponentProps<typeof DialogContent>["finalFocus"];
	/**
	 * A scope chip rendered in the header, between the search glyph and the
	 * input — "In: Backdrop", "Effects only".
	 *
	 * A scope belongs beside the field rather than inside it: put it in the value
	 * and the user has to delete prose to widen their search, and your filter has
	 * to parse it back out. Pair it with `inputProps.onKeyDown` handling Backspace
	 * on an empty query, or the only way out of a scope is the mouse.
	 */
	scope?: ReactNode;
	/**
	 * Extra props for the search input — `spellCheck`, `name`, `data-*`, and
	 * `onKeyDown`.
	 *
	 * `onKeyDown` runs **before** the palette's own handling and can opt out of a
	 * key by calling `preventDefault()`. That is what makes a scope chip
	 * dismissable:
	 *
	 *   inputProps={{ onKeyDown: (e) => {
	 *     if (e.key === "Backspace" && !query && scope) {
	 *       e.preventDefault()
	 *       popScope()
	 *     }
	 *   }}}
	 *
	 * Running first is deliberate. Backspace happens not to be a key the palette
	 * claims today, so a plain passthrough would work — until the palette grows a
	 * "Backspace clears the query" affordance, at which point the consumer's
	 * behaviour breaks silently. Claiming a key here is a contract rather than a
	 * coincidence.
	 *
	 * The combobox wiring is not overridable: `role`, the aria relationships, the
	 * controlled `value` and `onChange` are what make the input a listbox owner.
	 * `aria-label` and `className` do compose.
	 */
	inputProps?: Omit<
		ComponentProps<"input">,
		"role" | "value" | "onChange" | "aria-expanded" | "aria-controls" | "aria-activedescendant" | "aria-autocomplete"
	>;
	/**
	 * Declarative commands (CommandMenuGroup / CommandMenuItem). When present,
	 * takes precedence over `items`. Each item reads the active query from
	 * context to self-filter.
	 */
	children?: ReactNode;
}

/**
 * The inline palette's props: every CommandMenu prop that is about the search
 * and the list, none of the ones about the Dialog. `className` lands on the
 * panel surface; the rest of the div's props pass through to it.
 */
export type CommandMenuPanelProps = Omit<
	CommandMenuProps,
	"open" | "onOpenChange" | "finalFocus" | "description"
>;

/**
 * The query, owned or controlled. One hook so the dialog and the panel cannot
 * disagree about what "controlled" means.
 */
function useCommandQuery(
	queryProp: string | undefined,
	onQueryChange: ((query: string) => void) | undefined,
): [string, (next: string) => void] {
	const [ownQuery, setOwnQuery] = useState("");
	const query = queryProp ?? ownQuery;
	const setQuery = (next: string) => {
		if (queryProp === undefined) setOwnQuery(next);
		onQueryChange?.(next);
	};
	return [query, setQuery];
}

interface CommandMenuBodyProps
	extends Pick<
		CommandMenuProps,
		"items" | "filter" | "listClassName" | "scope" | "inputProps" | "children"
	> {
	query: string;
	setQuery: (next: string) => void;
	placeholder: string;
	emptyMessage: string;
	title: string;
	/** Runs after an item's onSelect: closes the dialog; a no-op inline. */
	close: () => void;
	/** Re-seeds the highlight when this flips true (the dialog opening). */
	open: boolean;
	/**
	 * Rendered in place rather than in a Dialog: the input does not take focus
	 * on mount, does not answer the page-wide shortcut, and Esc clears the query
	 * instead of falling through to a dismissal.
	 */
	inline: boolean;
}

/*
 * Palette geometry, derived from the shell's radius (Dialog and the panel are
 * both `rounded-lg`) the way the popup utilities derive a Menu's from
 * `radius-md`:
 *   --cm-inset  the list's padding, growing with the radius so a rounder shell
 *               does not turn every highlighted row into a pill;
 *   --cm-pad    each row's own side padding, shrinking by the same amount, so
 *               row icons and group labels land on the search glyph's line
 *               (the header pads by the sum) at every corner setting.
 * Rows take `radius-lg − inset`: concentric with the shell.
 */
const COMMAND_GEOMETRY =
	"[--cm-inset:max(--spacing(1),calc(var(--radius-lg)/3))] [--cm-pad:max(--spacing(2),calc(--spacing(4)-var(--cm-inset)))]";

/**
 * The palette itself — search header, result-count live region, listbox — with
 * no shell around it. CommandMenu puts it in a Dialog; CommandMenuPanel puts it
 * on a card in the page. Everything about the combobox (the activedescendant
 * model, the keyboard, filtering and grouping) lives here once.
 */
function CommandMenuBody({
	query,
	setQuery,
	items,
	filter,
	listClassName,
	placeholder,
	emptyMessage,
	title,
	scope,
	inputProps,
	children,
	close,
	open,
	inline,
}: CommandMenuBodyProps) {
	// The active option's element id (the combobox's aria-activedescendant). The
	// ordered set of visible options is read from the DOM, so this works the same
	// for the data-driven and declarative paths without an item registry.
	const [activeId, setActiveId] = useState<string | null>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const mergedInputRef = useMemo(() => mergeRefs(inputRef, inputProps?.ref), [inputProps?.ref]);
	const listboxId = useId();
	const tier = useTypeTier();

	// Data-driven path: filter, then group by the `group` key. The Map keeps
	// insertion order, so groups come out in the order their first surviving row
	// appears — which is how a caller-ranked array lifts a group whose best row
	// won above one whose best row lost, without a second prop for it.
	const grouped = useMemo(() => {
		if (!items) return [];
		const visible =
			filter === null
				? items
				: filter
					? filter(items, query)
					: defaultFilter(items, query);
		const map = new Map<string, CommandItem[]>();
		for (const item of visible) {
			const bucket = map.get(item.group);
			if (bucket) bucket.push(item);
			else map.set(item.group, [item]);
		}
		return Array.from(map, ([group, groupItems]) => ({ group, groupItems }));
	}, [items, query, filter]);

	// Declarative children self-filter against this. Empty means "show everything"
	// — which is also what a caller-supplied `filter` means for children: they own
	// the set, so nothing here may remove from it.
	const q = filter === undefined ? query.trim().toLowerCase() : "";

	const options = () =>
		Array.from(
			listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
		);

	// Highlight the first visible option (the expected "selection follows the top
	// result" behavior) — the first one that can actually run, since Enter on a
	// disabled row does nothing and a palette that opens on a dead row reads as
	// broken. Falls back to the first row when every row is disabled, so the
	// activedescendant is never dangling.
	const seedActive = useCallback(() => {
		const all = options();
		const runnable = all.find(
			(option) => option.getAttribute("aria-disabled") !== "true",
		);
		setActiveId((runnable ?? all[0])?.id ?? null);
	}, []);

	// The result count, read from the DOM so it is the same number for the
	// data-driven and declarative paths (only the DOM knows what a child decided
	// about itself). Announced politely: every palette needs this live region and
	// no consumer remembers to build one.
	//
	// Inline, the same pass also re-seeds a highlight left naming a row that no
	// longer exists. A dialog's items rarely change under it while it is open; a
	// panel lives on the page for as long as the page does, and its items (async
	// results, a settings list that grew) can change with no query change to
	// re-seed on.
	const [resultCount, setResultCount] = useState(0);
	useEffect(() => {
		const all = options();
		const next = all.length;
		setResultCount((current) => (current === next ? current : next));
		if (inline && (activeId ? !all.some((option) => option.id === activeId) : next > 0)) {
			seedActive();
		}
	});

	// Capture the listbox node and seed on mount. Base UI mounts the Dialog popup
	// a tick after `open` flips, so seeding here (when the node actually attaches)
	// is more robust than an effect keyed on `open`. Stable identity means it fires
	// only on mount/unmount and never clobbers keyboard moves on re-render.
	const attachList = useCallback(
		(node: HTMLDivElement | null) => {
			listRef.current = node;
			if (node) seedActive();
		},
		[seedActive],
	);

	// Re-seed to the first match as the query narrows the visible set. Keyed on
	// open+query only, so arrow-key moves (which set activeId) survive re-renders.
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-seed on open/query, not on every render
	useEffect(() => {
		if (open) seedActive();
	}, [open, query]);

	const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		// The caller's handler runs BEFORE the built-in switch, and
		// `defaultPrevented` is how it opts out of a key the palette owns.
		//
		// A plain passthrough would have worked today for the key that motivated
		// this — Backspace, to pop a scope chip — precisely because Backspace is
		// not in the switch below. That is a coincidence, not a contract: add a
		// "Backspace clears the query" affordance here later and the consumer's
		// scope-pop breaks silently, in their app, from a change in ours. Running
		// first makes the consumer's claim on a key explicit and durable.
		//
		// The rope is bounded by the idiom (React's composeEventHandlers shape, so
		// nothing new to learn) and by legibility: overriding arrow navigation
		// takes a literal `preventDefault()` that shows up in review, where a
		// passthrough's failure mode is invisible.
		//
		// What the caller cannot take over is `aria-activedescendant`. Skipping a
		// move is coherent — they took responsibility for that key — but nothing
		// may leave the active id naming a row that is not highlighted, so the
		// bail-out below is a plain `return` before any `setActiveId`.
		inputProps?.onKeyDown?.(event);
		if (event.defaultPrevented) return;

		// Inline there is nothing to dismiss, so Esc does what it does in a search
		// field: clears it. Only while there is something to clear — an empty
		// panel lets Esc through, so a panel placed inside a Popover still closes
		// it. Handled before the empty-list bail-out: "no results" is exactly when
		// clearing is wanted. The dialog leaves Esc to the Dialog.
		if (inline && event.key === "Escape") {
			if (query) {
				event.preventDefault();
				event.stopPropagation();
				setQuery("");
			}
			return;
		}

		const opts = options();
		if (opts.length === 0) return;
		const index = opts.findIndex((o) => o.id === activeId);
		const move = (next: HTMLElement | undefined) => {
			if (!next) return;
			event.preventDefault();
			setActiveId(next.id);
			next.scrollIntoView({ block: "nearest" });
		};
		switch (event.key) {
			case "ArrowDown":
				move(index < 0 ? opts[0] : opts[(index + 1) % opts.length]);
				break;
			case "ArrowUp":
				move(
					index < 0
						? opts[opts.length - 1]
						: opts[(index - 1 + opts.length) % opts.length],
				);
				break;
			case "Home":
				move(opts[0]);
				break;
			case "End":
				move(opts[opts.length - 1]);
				break;
			// A screenful, near enough. Rows are a fixed height, so "ten" is the
			// same distance every time — measuring the listbox would be more exact
			// and less predictable. Clamped rather than wrapped: a page jump that
			// wraps to the far end is a jump nobody asked for.
			case "PageDown":
				move(opts[Math.min(opts.length - 1, (index < 0 ? 0 : index) + 10)]);
				break;
			case "PageUp":
				move(opts[Math.max(0, (index < 0 ? 0 : index) - 10)]);
				break;
			case "Enter": {
				const active = opts.find((o) => o.id === activeId) ?? opts[0];
				if (active) {
					event.preventDefault();
					// A disabled row still swallows the key rather than falling
					// through to the dialog: Enter on a row you can see is an attempt
					// to run it, not to submit whatever is behind the palette.
					if (active.getAttribute("aria-disabled") !== "true") active.click();
				}
				break;
			}
		}
	};

	return (
		<>
			<div className={cn("flex shrink-0 items-center gap-2 border-b border-border px-[calc(var(--cm-inset)+var(--cm-pad))] py-3", COMMAND_GEOMETRY)}>
				<Icon name="search" className="text-base text-muted-foreground" />
				{/* Scope reads as a chip beside the glyph, not as text in the
				    field the user then has to delete. Paired with the Backspace
				    seam below on purpose: a scope you can only dismiss by
				    clicking is not the affordance. */}
				{scope ? <div className="flex shrink-0 items-center">{scope}</div> : null}
				<input
					// A dialog palette takes focus as it opens; a panel on the page
					// must not steal it on mount (inputProps.autoFocus opts in).
					autoFocus={!inline}
					type="text"
					// Consumer extras first — spellCheck, name, data-*. The combobox
					// wiring below is deliberately NOT overridable from here: role,
					// the aria relationships, the controlled value and the key
					// handler are what make this a listbox owner rather than a text
					// box, and a caller who replaced one would break the other five.
					// `onKeyDown` composes instead, above.
					{...inputProps}
					ref={mergedInputRef}
					// The one editable element useCommandMenuShortcut still fires
					// from, so the shortcut keeps working while the palette is open.
					// Not inline: a panel's field is an ordinary text field, where
					// Ctrl+K belongs to the field.
					data-command-menu-input={inline ? undefined : ""}
					role="combobox"
					aria-expanded
					aria-controls={listboxId}
					aria-activedescendant={activeId ?? undefined}
					aria-autocomplete="list"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					onKeyDown={onInputKeyDown}
					placeholder={placeholder}
					aria-label={inputProps?.["aria-label"] ?? "Command search"}
					className={cn(
						`w-full border-0 bg-transparent ${tier.body} text-foreground outline-none placeholder:text-muted-foreground`,
						inputProps?.className,
					)}
				/>
				{query ? (
					// Empties the query and hands focus back to the field, which owns
					// the keyboard (the list is driven from it).
					<Button
						variant="ghost"
						size="icon-xs"
						aria-label="Clear search"
						// Off the tab order (Esc clears from the field), and it never takes
						// focus from the field on press, so a panel that reacts to the
						// field's blur does not see one.
						tabIndex={-1}
						onMouseDown={(event) => event.preventDefault()}
						className="-my-1 text-muted-foreground hover:text-foreground"
						onClick={() => {
							setQuery("");
							inputRef.current?.focus();
						}}
					>
						<Icon name="xmark" />
					</Button>
				) : null}
			</div>

			{/* Sighted users count the list; this is the same fact for everyone
			    else. Outside the listbox so it is never read as an option, and
			    phrased as a count rather than echoing `emptyMessage` — the empty
			    copy is already on screen, and announcing it twice is noise. */}
			<div role="status" aria-live="polite" className="sr-only">
				{resultCount === 0
					? "No results"
					: `${resultCount} result${resultCount === 1 ? "" : "s"}`}
			</div>

			<Scroller
				ref={attachList}
				role="listbox"
				id={listboxId}
				aria-label={title}
				// A Scroller rather than a bare overflow box, so a long list fades at
				// the edge it can still scroll toward — the repo's own answer for a
				// scrolling region, and one every palette wants rather than only the
				// ones that remember to ask. It brings the thin scrollbar and the
				// contained overscroll with it.
				//
				// max-h-80 (20rem at rest, on the spacing scale); `min-h-0` lets it shrink further when the popup
				// itself is capped on a short viewport, so the pinned header above
				// never gets pushed off screen. Both land on the element that
				// scrolls (Scroller has no wrapper) — the trap fixed in 05c1824.
				className={cn("min-h-0 max-h-80 p-(--cm-inset)", COMMAND_GEOMETRY, listClassName)}
			>
				<CommandQueryContext.Provider
					value={{ query: children ? q : "", close, activeId, setActiveId }}
				>
					{children ??
						grouped.map(({ group, groupItems }) => (
							<CommandMenuGroup key={group} label={group}>
								{groupItems.map((item) => (
									<CommandMenuItem
										key={item.id ?? `${group}:${item.label}`}
										// Namespaced to this listbox: a caller's id is unique
										// among its own items, not in the whole document.
										id={item.id ? `${listboxId}-${item.id}` : undefined}
										icon={item.icon}
										leading={item.leading}
										detail={item.detail}
										stacked={item.stacked}
										hint={item.hint}
										disabled={item.disabled}
										onSelect={() => {
											item.onSelect();
											close();
										}}
									>
										{item.label}
									</CommandMenuItem>
								))}
							</CommandMenuGroup>
						))}
				</CommandQueryContext.Provider>

				{/* The data path knows synchronously that it rendered nothing; the
				    declarative one only knows once its children have decided, which
				    is what resultCount reads. */}
				{(children ? resultCount === 0 : grouped.length === 0) && (
					<div className="px-(--cm-pad) py-6 text-center text-body-sm text-muted-foreground">
						{emptyMessage}
					</div>
				)}
			</Scroller>
		</>
	);
}

/**
 * Root of the command palette. Controlled via `open` / `onOpenChange`. Renders a
 * top-aligned Dialog with a combobox search header and a scrollable listbox of
 * command options.
 */
export function CommandMenu({
	open,
	onOpenChange,
	items,
	query: queryProp,
	onQueryChange,
	filter,
	listClassName,
	placeholder = "Type a command or search…",
	emptyMessage = "No results found.",
	title = "Command menu",
	description = "Search for a command and press Enter to run it.",
	finalFocus,
	scope,
	inputProps,
	children,
	className,
	...props
}: CommandMenuProps) {
	const [query, setQuery] = useCommandQuery(queryProp, onQueryChange);
	const anchoredDensity = useAnchoredDensity();

	// Reset the query whenever the palette closes so it reopens clean.
	const handleOpenChange = (next: boolean) => {
		if (!next) setQuery("");
		onOpenChange(next);
	};

	const close = () => handleOpenChange(false);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				// The palette owns its own scroll: the search header stays pinned and
				// only the listbox below it moves, so Dialog's blanket scroll region
				// would put the input out of reach exactly when the list is long.
				scroll={false}
				// A palette portals like every other popup, so it inherits no
				// `data-density` from the Workspace its keystroke came from. Without
				// this, the fastest way to do anything in a tool is the one surface
				// that does not look like the tool. See lib/density.
				{...anchoredDensity}
				finalFocus={finalFocus}
				className={cn(
					// Top-anchored rather than centred, so the viewport cap DialogContent
					// applies (which assumes a 1rem margin top and bottom) has to be
					// restated for the 12vh offset: everything below the offset, less the
					// bottom margin.
					"top-[12vh] max-h-[calc(88dvh-1rem)] max-w-140 -translate-y-0 overflow-hidden p-0",
					className,
				)}
				{...props}
			>
				<DialogTitle className="sr-only">{title}</DialogTitle>
				<DialogDescription className="sr-only">{description}</DialogDescription>
				<CommandMenuBody
					query={query}
					setQuery={setQuery}
					items={items}
					filter={filter}
					listClassName={listClassName}
					placeholder={placeholder}
					emptyMessage={emptyMessage}
					title={title}
					scope={scope}
					inputProps={inputProps}
					close={close}
					open={open}
					inline={false}
				>
					{children}
				</CommandMenuBody>
			</DialogContent>
		</Dialog>
	);
}

// A panel has nothing to close; a row still runs its onSelect.
const noop = () => {};

/**
 * The same palette rendered in place: search header, filtered and grouped
 * listbox, the full keyboard model — on a card in the page instead of in a
 * Dialog. For a palette embedded in a page or a sidebar, a settings search, or
 * a demo.
 *
 * It is a static surface, so it wears the inline-surface treatment (a bordered
 * card, no shadow) rather than the floating one; put it inside a Popover when
 * it should float. Focus is not trapped and the input does not take focus on
 * mount. Esc clears the query rather than closing anything — and passes through
 * once the query is empty, so a Popover around the panel still closes on it.
 * Choosing a row runs its onSelect and leaves the panel as it was.
 */
export function CommandMenuPanel({
	items,
	query: queryProp,
	onQueryChange,
	filter,
	listClassName,
	placeholder = "Type a command or search…",
	emptyMessage = "No results found.",
	title = "Command menu",
	scope,
	inputProps,
	children,
	className,
	...props
}: CommandMenuPanelProps) {
	const [query, setQuery] = useCommandQuery(queryProp, onQueryChange);
	return (
		<div
			data-slot="command-menu-panel"
			className={cn(
				"flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground",
				className,
			)}
			{...props}
		>
			<CommandMenuBody
				query={query}
				setQuery={setQuery}
				items={items}
				filter={filter}
				listClassName={listClassName}
				placeholder={placeholder}
				emptyMessage={emptyMessage}
				title={title}
				scope={scope}
				inputProps={inputProps}
				close={noop}
				open
				inline
			>
				{children}
			</CommandMenuBody>
		</div>
	);
}

interface CommandQueryContextValue {
	/** Lowercased, trimmed query (empty string = show everything / no self-filter). */
	query: string;
	/** Close the palette (called after an item runs its onSelect). */
	close: () => void;
	/** Id of the currently highlighted option (aria-activedescendant). */
	activeId: string | null;
	/** Highlight an option (on hover, or as the keyboard nav lands on it). */
	setActiveId: (id: string) => void;
}

const CommandQueryContext = createContext<CommandQueryContextValue | null>(
	null,
);

export interface CommandMenuGroupProps
	extends Omit<ComponentPropsWithRef<"div">, "title"> {
	/** Group heading shown above the items. */
	label: string;
	children?: ReactNode;
}

/**
 * A labelled group of commands. When used declaratively, renders nothing if all
 * of its child items are filtered out by the current query.
 */
export function CommandMenuGroup({
	label,
	className,
	children,
	...props
}: CommandMenuGroupProps) {
	const labelId = useId();
	const tier = useTypeTier();
	return (
		<div
			role="group"
			aria-labelledby={labelId}
			className={cn("py-1", className)}
			{...props}
		>
			<div
				id={labelId}
				className={`px-(--cm-pad,--spacing(2)) py-1 ${tier.label} text-muted-foreground`}
			>
				{label}
			</div>
			{children}
		</div>
	);
}

export interface CommandMenuItemProps
	extends Omit<
		ComponentPropsWithRef<"div">,
		"title" | "onSelect" | "children"
	> {
	/** Invoked when the item is chosen. The menu closes afterward. */
	onSelect?: () => void;
	/** Optional leading icon (semantic name). */
	icon?: string;
	/** A leading visual of your own in place of `icon`: a product thumbnail, an Avatar. */
	leading?: ReactNode;
	/** Secondary text after the label. */
	detail?: ReactNode;
	/** Put `detail` on its own line under the label, so it never truncates away first. */
	stacked?: boolean;
	/** End-aligned trailing slot: a shortcut, a count, or a disabled row's reason. */
	hint?: ReactNode;
	/**
	 * Listed but unavailable: greyed, still announced, still reachable by arrow
	 * key so `hint` can be read, and inert to Enter and to a click.
	 */
	disabled?: boolean;
	children?: ReactNode;
}

/**
 * A single selectable command row. When rendered declaratively inside a
 * CommandMenu, it self-filters against the active query using its text content,
 * runs `onSelect`, then closes the palette. Activation is driven by the
 * combobox: keyboard focus stays in the input and Enter clicks the highlighted
 * row, so the row itself is not in the tab order.
 */
export function CommandMenuItem({
	onSelect,
	icon,
	leading,
	detail,
	stacked,
	hint,
	id: idProp,
	className,
	children,
	disabled,
	...props
}: CommandMenuItemProps) {
	const ctx = useContext(CommandQueryContext);
	const tier = useTypeTier();
	// A generated id is the default; a caller-supplied one wins, which is how a
	// `CommandItem.id` reaches the DOM and how aria-activedescendant can name a
	// row the caller can recognise.
	const autoId = useId();
	const id = idProp ?? autoId;

	// Self-filter when used declaratively: hide if the query doesn't appear in
	// the item's text. Items are visible by default (data-driven path, no ctx, or
	// a caller-supplied filter, which empties the context query).
	if (ctx?.query) {
		const text = textOf(children).toLowerCase();
		if (!text.includes(ctx.query)) return null;
	}

	const handleSelect = () => {
		if (disabled) return;
		onSelect?.();
		ctx?.close();
	};

	return (
		<div
			id={id}
			role="option"
			aria-selected={ctx?.activeId === id}
			aria-disabled={disabled || undefined}
			onClick={handleSelect}
			// The pointer takes the highlight over rather than painting a second
			// one: moving over a row makes it *the* active descendant, so the
			// keyboard's highlight follows the mouse instead of competing with it.
			// This is why there is no `hover:` fill below — with one, a pointer
			// parked over one row while an arrow key moved the highlight to another
			// left two rows reading as active, and only one of them would have run
			// on Enter. `aria-selected` is the single source of that paint.
			onMouseMove={() => ctx?.setActiveId(id)}
			className={cn(
				`flex items-center gap-2 rounded-[max(0px,calc(var(--radius-lg)-var(--cm-inset,--spacing(1))-1px))] px-(--cm-pad,--spacing(2)) py-2 ${tier.body} outline-none motion-interactive aria-selected:bg-accent aria-selected:text-accent-foreground [&_svg]:shrink-0`,
				disabled
					? "cursor-default text-muted-foreground"
					: "cursor-pointer text-foreground",
				className,
			)}
			{...props}
		>
			{leading != null ? (
				<span aria-hidden="true" className="flex shrink-0 items-center">
					{leading}
				</span>
			) : (
				icon && <Icon name={icon} className="text-base text-muted-foreground" />
			)}
			{stacked ? (
				<span className="flex min-w-0 flex-1 flex-col">
					<span className="truncate">{children}</span>
					{detail && <span className="truncate text-body-sm text-muted-foreground">{detail}</span>}
				</span>
			) : (
				<>
					<span className="truncate">{children}</span>
					{/* The detail starts from zero width and only grows into what the label
					    leaves: shrinking in proportion to its own length, a long summary
					    squeezed the label to a single letter. */}
					{detail && (
						<span className="min-w-0 flex-1 truncate text-body-sm text-muted-foreground">
							{detail}
						</span>
					)}
				</>
			)}
			{/* The hint shrinks and truncates like the label does, rather than
			    holding its full width: a disabled row's reason can be a sentence,
			    and a shrink-0 slot squeezed the label to nothing on a narrow
			    palette. Capped at half the row so the label always keeps room. */}
			{hint && (
				<span className="ms-auto flex min-w-0 max-w-1/2 items-center ps-4 text-body-sm text-muted-foreground">
					<span className="min-w-0 truncate">{hint}</span>
				</span>
			)}
		</div>
	);
}

/** Flatten a children tree into plain text for substring filtering. */
function textOf(node: ReactNode): string {
	if (node == null || typeof node === "boolean") return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(textOf).join("");
	if (typeof node === "object" && "props" in node) {
		const props = (node as { props?: { children?: ReactNode } }).props;
		return textOf(props?.children);
	}
	return "";
}
