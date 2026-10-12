"use client";

import { type ComponentProps, type PointerEvent as ReactPointerEvent, useCallback, useRef, useState } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { Button } from "../button"
import { Input } from "../input"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"
import { type Hsv, TRANSPARENT, formatHex, hsvToRgb, hueColor, isTransparent, parseHex, rgbToHsv } from "./color"

/* ==========================================================================
   ColorField — the colour control for a property grid.

   Deliberately not `<input type="color">`. The native control opens the OS
   dialog, which ignores the theme completely, cannot show a transparency
   checkerboard, has no alpha channel, and cannot host an eyedropper or a preset
   row. In a tool panel it is also the wrong *size* — it renders at whatever the
   platform decides, so it never lines up in a PropertyRow.
   ========================================================================== */

/**
 * Normalised pointer position within an element, clamped to its box.
 *
 * Uses window listeners rather than `setPointerCapture`: capture throws for an
 * inactive pointer id, and the throw aborts the handler mid-drag — a bug already
 * paid for once in PanelResizer.
 */
function useAreaDrag(onChange: (x: number, y: number) => void) {
	const ref = useRef<HTMLDivElement>(null)

	return {
		ref,
		onPointerDown: useCallback(
			(event: ReactPointerEvent<HTMLDivElement>) => {
				const el = ref.current
				if (!el || event.button !== 0) return
				event.preventDefault()

				const emit = (clientX: number, clientY: number) => {
					const box = el.getBoundingClientRect()
					if (box.width === 0 || box.height === 0) return
					onChange(
						Math.min(1, Math.max(0, (clientX - box.left) / box.width)),
						Math.min(1, Math.max(0, (clientY - box.top) / box.height)),
					)
				}

				emit(event.clientX, event.clientY)

				const onMove = (e: PointerEvent) => emit(e.clientX, e.clientY)
				const onUp = () => {
					window.removeEventListener("pointermove", onMove)
					window.removeEventListener("pointerup", onUp)
					window.removeEventListener("pointercancel", onUp)
				}
				window.addEventListener("pointermove", onMove)
				window.addEventListener("pointerup", onUp)
				window.addEventListener("pointercancel", onUp)
			},
			[onChange],
		),
	}
}

type Picker = { hsv: Hsv; a: number; key: string }

function seed(value: string): Picker {
	const parsed = isTransparent(value) ? null : parseHex(value)
	const rgb = parsed?.rgb ?? { r: 0, g: 0, b: 0 }
	return { hsv: rgbToHsv(rgb), a: parsed?.a ?? 1, key: value }
}

export type ColorFieldProps = Omit<
	ComponentProps<"button">,
	"value" | "onChange" | "children"
> & {
	/** `"transparent"`, `"#rrggbb"`, or `"#rrggbbaa"`. */
	value: string
	onValueChange: (value: string) => void
	/** Offer `"transparent"` as a value, inside the picker rather than beside it. */
	allowTransparent?: boolean
	/** Enable the alpha channel, and therefore 8-digit hex output. */
	allowAlpha?: boolean
	/** Optional preset row. */
	swatches?: string[]
	/** Accessible name for the trigger. */
	label?: string
}

/**
 * ColorField — a swatch that opens a picker.
 *
 *   <PropertyRow label="Background">
 *     <ColorField value={bg} onValueChange={setBg} allowTransparent />
 *   </PropertyRow>
 *
 * `"transparent"` is a first-class value *inside* the picker, never a separate
 * switch next to the field: a transparent toggle beside a colour control reads
 * as two properties when it is one.
 */
export function ColorField({
	value,
	onValueChange,
	allowTransparent = false,
	allowAlpha = false,
	swatches,
	label = "Colour",
	className,
	...props
}: ColorFieldProps) {
	const [picker, setPicker] = useState<Picker>(() => seed(value))
	const [hexDraft, setHexDraft] = useState<string | null>(null)

	const transparent = isTransparent(value)

	/*
	 * Reconcile an EXTERNAL value change during render — not in an effect.
	 *
	 * `key` is the value this component last produced, so our own emissions
	 * arrive back matching and never reset the picker. A genuinely external
	 * change (a preset load) does not match, and re-seeds.
	 *
	 * The transparent branch is the whole reason this is stateful: it keeps the
	 * existing hsv/alpha and only records the new key, so going
	 * colour → transparent → colour returns the colour you had rather than
	 * black. Doing that with a ref read during render or a setState inside an
	 * effect is what Sable's lint config rejects — and both would be worse.
	 */
	if (picker.key !== value) {
		setPicker(isTransparent(value) ? { ...picker, key: value } : seed(value))
		setHexDraft(null)
	}

	const rgb = hsvToRgb(picker.hsv)
	const solid = formatHex(rgb)
	const withAlpha = formatHex(rgb, allowAlpha ? picker.a : 1)

	const commit = (next: Picker, emitted: string) => {
		setPicker({ ...next, key: emitted })
		setHexDraft(null)
		onValueChange(emitted)
	}

	const setHsv = (hsv: Hsv) => {
		const emitted = formatHex(hsvToRgb(hsv), allowAlpha ? picker.a : 1)
		commit({ ...picker, hsv }, emitted)
	}

	const sv = useAreaDrag((x, y) => setHsv({ ...picker.hsv, s: x, v: 1 - y }))
	const hue = useAreaDrag((x) => setHsv({ ...picker.hsv, h: x * 360 }))
	const alpha = useAreaDrag((x) => commit({ ...picker, a: x }, formatHex(rgb, x)))

	return (
		<Popover>
			<PopoverTrigger
				render={
					<button
						type="button"
						aria-label={`${label}: ${transparent ? "transparent" : withAlpha}`}
						// Matches ScrubField's metrics so it lines up in a PropertyRow,
						// and the ring rather than a border keeps it off the layout.
						className={cn(
							"checkerboard [--checkerboard-size:8px]",
							"size-(--control-xs) shrink-0 rounded-xs ring-1 ring-hairline-strong",
							"motion-interactive focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
							className,
						)}
						{...props}
					>
						{/* The colour rides ON the checkerboard, so a translucent value
						    reads as translucent instead of as a flat approximation. */}
						<span
							aria-hidden
							className="block size-full rounded-[inherit]"
							style={{ backgroundColor: transparent ? "transparent" : withAlpha }}
						/>
					</button>
				}
			/>

			<PopoverContent align="start" className="w-56 p-2">
				<div className="flex flex-col gap-2">
					{/* Saturation / value. Two stacked gradients over the hue: white →
					    transparent horizontally, transparent → black vertically. */}
					<div
						ref={sv.ref}
						onPointerDown={sv.onPointerDown}
						// Concentric with the popover: its radius-md less the p-2 inset.
						className="relative h-28 w-full cursor-crosshair rounded-concentric-md/2 ring-1 ring-hairline"
						style={{ backgroundColor: hueColor(picker.hsv.h) }}
					>
						{/* Saturation and value ARE white and black by definition — these are
						    the axes of the colour space, not theme surfaces. A themed tint
						    would misreport the colour being picked. */}
						<div
							aria-hidden
							className="absolute inset-0 rounded-[inherit]"
							style={{
								backgroundImage:
									// design-lint-disable-next-line inline-color -- axes of the colour space, not theme surfaces
									"linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)",
							}}
						/>
						{/* HANDLE CONTRAST, once for all three handles below: a handle sits on
						    top of an ARBITRARY user-chosen colour, so no semantic token can
						    guarantee contrast against it. White with a dark outline is the
						    standard answer precisely because it must survive every hue. */}
						<span
							aria-hidden
							className={
								// design-lint-disable-next-line raw-black-white -- handle over arbitrary user colour; no token can guarantee contrast
								"absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ring-inset shadow-(--knob-shadow)"
							}
							style={{
								left: `${picker.hsv.s * 100}%`,
								top: `${(1 - picker.hsv.v) * 100}%`,
								backgroundColor: solid,
								outline: "1px solid rgb(0 0 0 / 0.35)",
							}}
						/>
					</div>

					{/* The hue wheel's six primaries are the data this control selects from.
					    Tokenising them would mean the slider showed different colours than it
					    produces. */}
					<div
						ref={hue.ref}
						onPointerDown={hue.onPointerDown}
						className="relative h-3 w-full cursor-ew-resize rounded-full ring-1 ring-hairline"
						style={{
							backgroundImage:
								// design-lint-disable-next-line inline-color -- the hue wheel IS these six primaries
								"linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
						}}
					>
						<span
							aria-hidden
							className={
								// design-lint-disable-next-line raw-black-white -- handle over arbitrary hue; see HANDLE CONTRAST above
								"absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-1 ring-black/30"
							}
							style={{ left: `${(picker.hsv.h / 360) * 100}%` }}
						/>
					</div>

					{allowAlpha ? (
						<div
							ref={alpha.ref}
							onPointerDown={alpha.onPointerDown}
							className="checkerboard [--checkerboard-size:8px] relative h-3 w-full cursor-ew-resize rounded-full ring-1 ring-hairline"
						>
							<div
								aria-hidden
								className="absolute inset-0 rounded-[inherit]"
								style={{
									backgroundImage: `linear-gradient(to right, ${formatHex(rgb, 0)}, ${solid})`,
								}}
							/>
							<span
								aria-hidden
								className={
									// design-lint-disable-next-line raw-black-white -- handle over arbitrary hue and checkerboard; see HANDLE CONTRAST above
									"absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-1 ring-black/30"
								}
								style={{ left: `${picker.a * 100}%` }}
							/>
						</div>
					) : null}

					<div className="flex items-center gap-1">
						<Input
							aria-label={`${label} hex`}
							value={hexDraft ?? (transparent ? "" : withAlpha)}
							placeholder={transparent ? TRANSPARENT : undefined}
							spellCheck={false}
							onChange={(event) => {
								const next = event.target.value
								setHexDraft(next)
								// Commit only on a parseable value, so the field stays
								// editable mid-typing instead of fighting every keystroke.
								const parsed = parseHex(next)
								if (!parsed) return
								const emitted = formatHex(parsed.rgb, allowAlpha ? parsed.a : 1)
								setPicker({ hsv: rgbToHsv(parsed.rgb), a: parsed.a, key: emitted })
								onValueChange(emitted)
							}}
							onBlur={() => setHexDraft(null)}
							size="xs"
							className="min-w-0 flex-1 text-ui-num"
						/>
						{typeof window !== "undefined" && "EyeDropper" in window ? (
							<Button
								size="icon-xs"
								variant="ghost"
								aria-label="Pick colour from screen"
								onClick={async () => {
									try {
										// @ts-expect-error — EyeDropper is Chromium-only and not in lib.dom yet.
										const result = await new window.EyeDropper().open()
										const parsed = parseHex(String(result.sRGBHex))
										if (!parsed) return
										const emitted = formatHex(parsed.rgb, allowAlpha ? picker.a : 1)
										commit({ hsv: rgbToHsv(parsed.rgb), a: picker.a, key: emitted }, emitted)
									} catch {
										// The user dismissed the picker. Not an error.
									}
								}}
							>
								<Icon name="eyedropper" />
							</Button>
						) : null}
					</div>

					{swatches?.length ? (
						<div className="flex flex-wrap gap-1">
							{swatches.map((swatch) => (
								<button
									key={swatch}
									type="button"
									aria-label={swatch}
									onClick={() => {
										const parsed = parseHex(swatch)
										if (!parsed) return
										const emitted = formatHex(parsed.rgb, allowAlpha ? parsed.a : 1)
										commit({ hsv: rgbToHsv(parsed.rgb), a: parsed.a, key: emitted }, emitted)
									}}
									// 20px swatches on a 24px pitch: the hit area is the full 24px
										// pitch, so neighbouring targets meet without overlapping.
										className="hit-target size-5 rounded-xs ring-1 ring-hairline-strong motion-interactive hover:scale-110 [--hit-target-size:24px]"
									style={{ backgroundColor: swatch }}
								/>
							))}
						</div>
					) : null}

					{allowTransparent ? (
						// Inside the picker, as a value — not a switch beside the field.
						<Button
							size="xs"
							variant={transparent ? "secondary" : "ghost"}
							aria-pressed={transparent}
							onClick={() =>
								transparent
									? commit(picker, formatHex(rgb, allowAlpha ? picker.a : 1))
									: commit(picker, TRANSPARENT)
							}
							className="w-full justify-start gap-1.5 text-ui-md"
						>
							<span
								aria-hidden
								className="checkerboard [--checkerboard-size:6px] size-3 shrink-0 rounded-xs ring-1 ring-hairline-strong"
							/>
							Transparent
						</Button>
					) : null}
				</div>
			</PopoverContent>
		</Popover>
	)
}
ColorField.displayName = "ColorField"
