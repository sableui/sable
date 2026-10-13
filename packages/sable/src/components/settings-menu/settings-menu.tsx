import { Children, type ComponentProps, isValidElement, type ReactElement, type ReactNode } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import {
	Menu,
	MenuContent,
	MenuGroup,
	MenuGroupLabel,
	MenuSubmenu,
	MenuSubmenuTrigger,
	MenuTrigger,
} from "../menu"
import { Button } from "../button/button"
import {
	SETTINGS_TRIGGER_SIZE,
	SETTINGS_TRIGGER_VARIANT,
	settingsMenuTriggerClassName,
} from "./settings-menu.variants"

export interface SettingsMenuProps
	extends Omit<ComponentProps<typeof Menu>, "children"> {
	/**
	 * What the trigger reads when closed — the current settings, stated. Give it
	 * the values a reader would want at a glance, not a noun like "Settings":
	 * the whole point of the control is that it answers before it is opened.
	 */
	summary: ReactNode
	/** Accessible name for the trigger. @default "Change settings" */
	label?: string
	/**
	 * Resting treatment, rendered through Button. `ghost` → Button `ghost`;
	 * `subtle` → Button `secondary` (a fill for surfaces where ghost would float).
	 */
	variant?: "ghost" | "subtle"
	/** Trigger height, off the density ladder. @default "sm" */
	size?: "xs" | "sm"
	/** Which side the menu opens on. @default "top" */
	side?: ComponentProps<typeof MenuContent>["side"]
	/** Alignment along that side. @default "end" */
	align?: ComponentProps<typeof MenuContent>["align"]
	/** Disable the trigger. */
	disabled?: boolean
	className?: string
	/** `SettingsRow`s, and any `MenuSeparator` / `MenuItem` between them. */
	children: ReactNode
}

/**
 * SettingsMenu — a compact trigger that states the current settings, over a
 * menu of rows that change them.
 *
 *   <SettingsMenu variant="subtle" summary={<><b>5.6 Sol</b> High</>}>
 *     <SettingsRow label="Model" value="5.6 Sol">
 *       <MenuRadioGroup value={model} onValueChange={setModel}>
 *         <MenuRadioItem value="sol">5.6 Sol</MenuRadioItem>
 *         <MenuRadioItem value="lite">5.6 Lite</MenuRadioItem>
 *       </MenuRadioGroup>
 *     </SettingsRow>
 *     <SettingsRow label="Effort" value="High">…</SettingsRow>
 *   </SettingsMenu>
 *
 * It knows nothing about models. The shape it encodes — *summarise the state,
 * open to a list of `name → current value → submenu`* — is the same one a
 * render-settings control, a table's density-and-sort control, and an export
 * dialog's options all want, and the AI-model case is one instance of it.
 *
 * Two decisions carry the design:
 *
 * - **The trigger states rather than labels.** "5.6 Sol High" tells you where
 *   you are; a trigger reading "Settings" makes you open it to find out, which
 *   for a control you glance at twenty times a session is the wrong trade.
 * - **Each row carries its value too**, so one glance at the open menu answers
 *   every setting at once. A menu of bare names is a menu you have to explore.
 *
 * Opens upward and end-aligned by default, because its home is the bottom-right
 * of a composer or a toolbar — where a downward menu would open off-screen.
 *
 * One setting opens straight to its options, under the row's label: a lone row
 * that then opens a submenu is two clicks for one choice.
 */
export function SettingsMenu({
	summary,
	label = "Change settings",
	variant = "ghost",
	size = "sm",
	side = "top",
	align = "end",
	disabled,
	className,
	children,
	...props
}: SettingsMenuProps) {
	const tier = useTypeTier()
	const rows = Children.toArray(children)
	const only = rows.length === 1 && isValidElement(rows[0]) && rows[0].type === SettingsRow ? (rows[0] as ReactElement<SettingsRowProps>) : null
	const content =
		only?.props.children && !only.props.disabled ? (
			<MenuGroup>
				<MenuGroupLabel>{only.props.label}</MenuGroupLabel>
				{only.props.children}
			</MenuGroup>
		) : (
			children
		)
	return (
		<Menu {...props}>
			<MenuTrigger
				aria-label={label}
				disabled={disabled}
				render={
					<Button
						variant={SETTINGS_TRIGGER_VARIANT[variant]}
						size={SETTINGS_TRIGGER_SIZE[size]}
						// Body tier, not Button's action tier: the trigger states a value,
						// it doesn't name an action. `cn` dedupes the type token.
						className={cn(settingsMenuTriggerClassName, tier.body, className)}
					/>
				}
			>
				<span className="truncate">{summary}</span>
				<Icon name="chevron-down" className="opacity-60" />
			</MenuTrigger>
			<MenuContent side={side} align={align} className="min-w-56">
				{content}
			</MenuContent>
		</Menu>
	)
}
SettingsMenu.displayName = "SettingsMenu"

export interface SettingsRowProps {
	/** The setting's name — "Model", "Effort", "Quality". */
	label: ReactNode
	/** Its current value, shown on the row so the open menu answers everything at once. */
	value?: ReactNode
	/** Disable the row. */
	disabled?: boolean
	className?: string
	/**
	 * The submenu's contents — usually a `MenuRadioGroup` of `MenuRadioItem`s.
	 * Omit to render a plain, non-nesting row.
	 */
	children?: ReactNode
}

/**
 * One `name → value → submenu` row inside a SettingsMenu.
 *
 * With children it nests; without them it is a flat row, which is what a
 * boolean or an "Advanced…" escape hatch wants.
 */
export function SettingsRow({
	label,
	value,
	disabled,
	className,
	children,
}: SettingsRowProps) {
	const tier = useTypeTier()
	if (!children) {
		return (
			<div
				className={cn(
					// MenuItem's row recipe — inset, gap, concentric radius and tier — so a
					// flat row and a nesting row in the same list are the same shape.
					"flex select-none items-center gap-(--item-gap) rounded-popup-item px-(--item-px) py-1.5",
					tier.body,
					disabled && "opacity-50",
					className,
				)}
			>
				<span className="flex-1 truncate">{label}</span>
				{value !== undefined ? (
					<span className="truncate text-muted-foreground">{value}</span>
				) : null}
				{/* The submenu rows end in a chevron; reserving its column here keeps
				    every value in the menu on one right edge. */}
				<Icon name="chevron-right" className="invisible text-xs" />
			</div>
		)
	}

	return (
		<MenuSubmenu>
			<MenuSubmenuTrigger
				value={value}
				disabled={disabled}
				className={className}
			>
				{label}
			</MenuSubmenuTrigger>
			<MenuContent side="inline-end" align="start" sideOffset={4}>
				{children}
			</MenuContent>
		</MenuSubmenu>
	)
}
SettingsRow.displayName = "SettingsRow"
