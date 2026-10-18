"use client";

import type { ComponentPropsWithRef } from "react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Icon } from "../../icon";
import { cn } from "../../lib/cn";
import { useTypeTier } from "../../lib/density";
import { FIELD_SHELL } from "../../lib/field-shell";
import { useIsomorphicLayoutEffect } from "../../lib/use-isomorphic-layout-effect";
import { Kbd, KbdGroup } from "../kbd/kbd";

/**
 * The palette's own search input carries this attribute. It is the one
 * editable element the shortcut still fires from: focus sits there for as long
 * as the palette is open, and a shortcut that went dead the moment the palette
 * appeared would hand Ctrl+K back to the browser (Chrome focuses its address
 * bar) instead of to the app.
 */
const COMMAND_MENU_INPUT_ATTR = "data-command-menu-input";

const NON_TEXT_INPUTS = new Set([
	"button",
	"checkbox",
	"color",
	"file",
	"image",
	"radio",
	"range",
	"reset",
	"submit",
]);

/** Is this element somewhere a keystroke means "type this character"? */
function isEditable(target: EventTarget | null): boolean {
	if (!(target instanceof Element)) return false;
	if (target.closest(`[${COMMAND_MENU_INPUT_ATTR}]`)) return false;
	if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)
		return true;
	if (target instanceof HTMLInputElement)
		return !NON_TEXT_INPUTS.has(target.type);
	// `isContentEditable` is the real answer; jsdom does not implement it, so the
	// attribute walk is the fallback rather than the rule.
	if (target instanceof HTMLElement && target.isContentEditable) return true;
	return target.closest('[contenteditable]:not([contenteditable="false"])') !== null;
}

/** macOS and iOS take ⌘; every other platform takes Ctrl. */
function detectApple(): boolean {
	if (typeof navigator === "undefined") return false;
	const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
	const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || "";
	return /mac|iphone|ipad|ipod/i.test(platform);
}

const noopSubscribe = () => () => {};

/**
 * Whether this platform's shortcut modifier is ⌘. The server cannot know, so it
 * renders the Ctrl form and the client corrects itself on hydration — through
 * useSyncExternalStore, which is the hydration-safe way to read a value the
 * server and client legitimately disagree on.
 */
function useIsApple(): boolean {
	return useSyncExternalStore(noopSubscribe, detectApple, () => false);
}

/**
 * Listens for the platform's palette shortcut — ⌘K on macOS, Ctrl+K elsewhere —
 * anywhere on the page, and calls `onShortcut` when it lands.
 *
 * `CommandMenuTrigger` installs this for you. Call it directly when the
 * palette has no visible trigger (a canvas tool, a full-bleed reader).
 *
 * - Ignored while focus is in a text field, textarea, select or
 *   contenteditable — Ctrl+K there belongs to the field (it is "delete to end
 *   of line" in every macOS text view). The palette's own input is the
 *   exception, so a caller can make the shortcut toggle.
 * - On a match it calls `preventDefault()` (Ctrl+K is the browser's
 *   search-the-web key) and skips an event something else already prevented.
 *   That is also what makes two triggers on one page safe: the first listener
 *   claims the keystroke, the second sees it claimed.
 * - Pass `false` as the key to turn it off; the listener is removed on
 *   unmount or when the key changes.
 */
export function useCommandMenuShortcut(
	onShortcut: (event: KeyboardEvent) => void,
	key: string | false = "k",
): void {
	// Latest callback in a ref, so an inline arrow does not tear the listener
	// down and re-add it on every render.
	const handler = useRef(onShortcut);
	useIsomorphicLayoutEffect(() => {
		handler.current = onShortcut;
	});

	useEffect(() => {
		if (key === false || typeof window === "undefined") return;
		const wanted = key.toLowerCase();
		const apple = detectApple();
		function onKeyDown(event: KeyboardEvent) {
			if (event.defaultPrevented || event.isComposing) return;
			// Autofill and some IMEs dispatch keydown with no key at all.
			if (typeof event.key !== "string" || event.key.toLowerCase() !== wanted) return;
			const mod = apple ? event.metaKey : event.ctrlKey;
			const other = apple ? event.ctrlKey : event.metaKey;
			if (!mod || other || event.altKey || event.shiftKey) return;
			if (isEditable(event.target)) return;
			event.preventDefault();
			handler.current(event);
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [key]);
}

export interface CommandMenuTriggerProps
	extends Omit<ComponentPropsWithRef<"button">, "children"> {
	/**
	 * Opens the palette. Called on click and on the keyboard shortcut — usually
	 * `() => setOpen(true)`.
	 */
	onOpen?: () => void;
	/** The field's resting text, which is also the button's name. @default "Search" */
	placeholder?: string;
	/**
	 * The shortcut's key, pressed with ⌘ (macOS) or Ctrl (elsewhere). Shown as a
	 * `Kbd` and listened for page-wide. `false` drops both. @default "k"
	 */
	shortcut?: string | false;
	/**
	 * A rung of the control ladder. `sm` sits in a header beside small buttons;
	 * `md` lines up with Input and SearchInput in a form. @default "md"
	 */
	size?: "sm" | "md";
}

/**
 * CommandMenuTrigger — the search field in a header that is really a button:
 * it wears SearchInput's shell (the field fill and outline, leading magnifier,
 * muted placeholder) and opens a `CommandMenu` on click or on ⌘K / Ctrl+K.
 *
 *   const [open, setOpen] = useState(false)
 *   <CommandMenuTrigger onOpen={() => setOpen(true)} />
 *   <CommandMenu open={open} onOpenChange={setOpen} items={items} />
 *
 * A real `<button>` rather than a read-only input: there is nothing to type
 * here, and an input that refuses typing is a lie to a screen reader.
 */
export function CommandMenuTrigger({
	onOpen,
	onClick,
	placeholder = "Search",
	shortcut = "k",
	size = "md",
	className,
	type,
	...props
}: CommandMenuTriggerProps) {
	const tier = useTypeTier();
	const apple = useIsApple();
	useCommandMenuShortcut(() => onOpen?.(), props.disabled ? false : shortcut);

	const keyLabel = shortcut === false ? null : shortcut.toUpperCase();
	return (
		<button
			type={type ?? "button"}
			aria-haspopup="dialog"
			aria-keyshortcuts={
				keyLabel ? `${apple ? "Meta" : "Control"}+${keyLabel}` : undefined
			}
			onClick={(event) => {
				onClick?.(event);
				if (!event.defaultPrevented) onOpen?.();
			}}
			className={cn(
				// FIELD_SHELL carries motion-interactive too; it is restated here so
				// the hover it eases is visibly paired with its recipe.
				"flex w-full items-center gap-2 text-start text-muted-foreground motion-interactive hover:text-foreground",
				FIELD_SHELL,
				size === "sm"
					? `h-(--control-sm) ps-2.5 pe-1.5 ${tier.supporting}`
					: `h-(--control-md) ps-3 pe-2 ${tier.body}`,
				className,
			)}
			{...props}
		>
			<Icon name="search" className="shrink-0 text-sm" />
			<span className="min-w-0 flex-1 truncate">{placeholder}</span>
			{keyLabel ? (
				// aria-hidden: the shortcut is announced once, through
				// aria-keyshortcuts, rather than read out as part of the name.
				// One cap per key (Kbd's own guidance) — "Ctrl K" in a single cap
				// read as one key.
				<KbdGroup aria-hidden className="shrink-0">
					<Kbd>{apple ? "⌘" : "Ctrl"}</Kbd>
					<Kbd>{keyLabel}</Kbd>
				</KbdGroup>
			) : null}
		</button>
	);
}
CommandMenuTrigger.displayName = "CommandMenuTrigger";
