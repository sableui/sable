import { Button, buttonMeta, Icon } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: buttonMeta,
	text: "Publish",
	only: ["variant", "size", "loading"],
	slots: [
		{ prop: "iconStart", label: "Leading icon", element: <Icon name="plus" />, source: '<Icon name="plus" />' },
		{ prop: "iconEnd", label: "Trailing icon", element: <Icon name="chevron-right" />, source: '<Icon name="chevron-right" />' },
	],
	// Icon sizes are square: the text becomes the accessible name and the
	// button shows a glyph instead of squeezing the label into a square.
	render: (values, text, slots) => {
		const props = as<ComponentProps<typeof Button>>(values)
		if (String(values.size).startsWith("icon")) {
			return (
				<Button {...props} aria-label={text || "Add"}>
					{slots.iconEnd ?? slots.iconStart ?? <Icon name="plus" />}
				</Button>
			)
		}
		return (
			<Button {...props} iconStart={slots.iconStart} iconEnd={slots.iconEnd}>
				{text}
			</Button>
		)
	},
	snippet: (values, text, slots) => {
		if (!String(values.size).startsWith("icon")) return null
		const icon = slots.iconEnd ? '<Icon name="chevron-right" />' : '<Icon name="plus" />'
		const variant = values.variant && values.variant !== "primary" ? ` variant="${values.variant}"` : ""
		const loading = values.loading === true ? " loading" : ""
		return `<Button size="${values.size}"${variant}${loading} aria-label="${text || "Add"}">${icon}</Button>`
	},
}

export default entry
