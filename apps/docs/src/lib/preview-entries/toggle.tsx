import { Toggle, ToggleGroup, toggleMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, attrs, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: toggleMeta,
	only: ["appearance", "multiple"],
	// Keyed on `multiple`: the group's value shape changes with it, so the
	// preview remounts rather than carry a single choice into a multi one.
	render: (values) => (
		<ToggleGroup
			key={String(values.multiple)}
			{...as<ComponentProps<typeof ToggleGroup>>(values)}
			defaultValue={["week"]}
			aria-label="Range"
		>
			<Toggle value="day">Day</Toggle>
			<Toggle value="week">Week</Toggle>
			<Toggle value="month">Month</Toggle>
		</ToggleGroup>
	),
	snippet: (values) => `<ToggleGroup${attrs(toggleMeta, values, ["appearance", "multiple"])} defaultValue={["week"]} aria-label="Range">
<Toggle value="day">Day</Toggle>
<Toggle value="week">Week</Toggle>
<Toggle value="month">Month</Toggle>
/ToggleGroup>`,
}

export default entry
