import { Button, Icon, Stack, useSableTheme } from "@sableui/react"
import { type RefObject, useLayoutEffect, useRef, useState } from "react"
import { PageHeader, Section } from "../components/docs-ui"
import { useCustomizer } from "../customizer/CustomizerProvider"

/** Tailwind spacing steps Sable leans on. Widths are drawn as `--spacing × n`, not as px. */
const SPACE = [1, 2, 3, 4, 6, 8, 12, 16, 24]

const CONTROLS = ["xs", "sm", "md", "cta", "lg"]

const ICONS: [string, string][] = [
	["xs", "text-sm"],
	["sm", "text-base"],
	["md", "text-xl"],
	["lg", "text-2xl"],
	["xl", "text-[2rem]"],
]

/**
 * A rendered size, read back from the element after layout. The figures on
 * this page used to be the default theme's px at a 16px root; this site sets
 * --type-base: 14 on wide screens, the spacing step derives from the type, and
 * the customizer moves both, so a printed "16px" was simply wrong here.
 */
function useRendered<T extends HTMLElement>(read: (el: T) => number): [RefObject<T | null>, string] {
	const ref = useRef<T>(null)
	const { css } = useCustomizer()
	const { themeId, mode } = useSableTheme()
	const [value, setValue] = useState<number | null>(null)
	useLayoutEffect(() => {
		const frame = requestAnimationFrame(() => {
			if (ref.current) setValue(Math.round(read(ref.current) * 10) / 10)
		})
		return () => cancelAnimationFrame(frame)
	}, [css, themeId, mode])
	return [ref, value == null ? "—" : `${value}px`]
}

function SpaceRow({ step }: { step: number }) {
	const [ref, px] = useRendered<HTMLDivElement>((el) => el.getBoundingClientRect().width)
	return (
		<div className="flex items-center gap-4">
			<code className="text-mono-sm text-muted-foreground w-14 shrink-0">{step}</code>
			<div ref={ref} className="h-4 rounded-xs bg-tone-1" style={{ width: `calc(var(--spacing) * ${step})` }} />
			<span className="text-body-sm text-muted-foreground">{px}</span>
		</div>
	)
}

function ControlSample({ name }: { name: string }) {
	const [ref, px] = useRendered<HTMLDivElement>((el) => el.getBoundingClientRect().height)
	return (
		<div className="text-center">
			<div
				ref={ref}
				className="flex items-center justify-center rounded-sm border border-border bg-card px-5"
				style={{ height: `var(--control-${name})` }}
			>
				<span className="text-label-md">{name}</span>
			</div>
			<p className="text-mono-sm text-muted-foreground mt-2">{px}</p>
		</div>
	)
}

function IconSample({ name, size }: { name: string; size: string }) {
	const [ref, px] = useRendered<HTMLSpanElement>((el) => Number.parseFloat(getComputedStyle(el).fontSize))
	return (
		<div className="text-center">
			<span ref={ref} className={size}>
				<Icon name="gear" />
			</span>
			<p className="text-body-sm text-muted-foreground mt-2">
				{name} · {size} · {px}
			</p>
		</div>
	)
}

export function DimensionsPage() {
	return (
		<>
			<PageHeader
				eyebrow="Foundations"
				title="Spacing & sizing"
				lede="One scale, derived from the type, sets every gap, padding and size, so everything lands on the same rhythm."
			/>

			<Section
				title="Spacing scale"
				description="Tailwind's steps, with the step itself derived from the body text: half a baseline step, 4px at Sable's default type (3.5px on this site's wide screens, which set --type-base: 14). Bars are drawn on --spacing and measured, so they follow the customizer. Related things sit closer than unrelated ones."
			>
				<Stack gap={2}>
					{SPACE.map((step) => (
						<SpaceRow key={step} step={step} />
					))}
				</Stack>
			</Section>

			<Section
				title="Control sizes"
				description="The density ladder every control reads. md is the default for buttons, inputs and selects; a compact scope shifts every step down."
			>
				<div className="flex flex-wrap items-end gap-4">
					{CONTROLS.map((name) => (
						<ControlSample key={name} name={name} />
					))}
				</div>
			</Section>

			<Section
				title="Icon sizes"
				description="Icons are em-sized: they scale with the text-* size you give them and take its color. md is the default."
			>
				<div className="flex flex-wrap items-end gap-8">
					{ICONS.map(([name, size]) => (
						<IconSample key={name} name={name} size={size} />
					))}
				</div>
			</Section>

			<Section
				title="Touch targets"
				description="Every target clears the WCAG 24px floor. A control that stands alone also reaches 44px under touch, without moving layout; controls packed in a row keep the floor, because their spacing sets the target and a 44px slop would steal taps from the neighbour."
			>
				<div className="flex items-center gap-4">
					{/* The button really carries hit-target: a centred 44px ::after. The
					    dashed ring only marks where that invisible target ends. */}
					<div className="grid size-11 place-items-center rounded-full border border-dashed border-ring">
						<Button variant="secondary" size="icon-sm" aria-label="Settings" className="hit-target">
							<Icon name="gear" />
						</Button>
					</div>
					<p className="text-body-sm text-muted-foreground">
						A 32px button with <code className="text-mono-sm">hit-target</code>: the dashed ring marks its 44px target.
						Inside components, standalone icon buttons use <code className="text-mono-sm">hitTargetTouch</code>, which
						grows to 44px on a coarse pointer only.
					</p>
				</div>
			</Section>
		</>
	)
}
