import { Icon, Toolbar, ToolbarButton, toolbarMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, attrs, TOOLBAR_ITEMS, TOOLBAR_DEFAULTS, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: toolbarMeta,
	only: ["orientation", "variant", "size"],
	initial: TOOLBAR_DEFAULTS,
	// variant and size are ToolbarButton's (Button's own scales); orientation
	// is the Toolbar's. Icon sizes swap the labels for glyphs.
	render: (values) => {
		const icon = String(values.size).startsWith("icon")
		const button = as<ComponentProps<typeof ToolbarButton>>({ variant: values.variant, size: values.size })
		return (
			<Toolbar orientation={values.orientation as "horizontal" | "vertical"} aria-label="Formatting">
				{TOOLBAR_ITEMS.map(([glyph, label]) => (
					<ToolbarButton key={glyph} {...button} aria-label={icon ? label : undefined}>
						{icon ? <Icon name={glyph} /> : label}
					</ToolbarButton>
				))}
			</Toolbar>
		)
	},
	snippet: (values) => {
		const icon = String(values.size).startsWith("icon")
		const button = attrs(toolbarMeta, values, ["variant", "size"], TOOLBAR_DEFAULTS)
		const items = TOOLBAR_ITEMS.map(([glyph, label]) =>
			icon
				? `\t<ToolbarButton${button} aria-label="${label}"><Icon name="${glyph}" /></ToolbarButton>`
				: `\t<ToolbarButton${button}>${label}</ToolbarButton>`,
		).join("\n")
		return `<Toolbar${attrs(toolbarMeta, values, ["orientation"])} aria-label="Formatting">\n${items}\n</Toolbar>`
	},
}

export default entry
