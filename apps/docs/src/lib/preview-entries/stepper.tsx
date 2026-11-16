import { Stepper, StepperItem, stepperMeta } from "@sableui/react"
import { attrs, STEPS, STEPPER_CONTROLS, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: stepperMeta,
	only: ["orientation", "indicator", "current", "error"],
	controls: STEPPER_CONTROLS,
	render: (values) => {
		const current = Number(values.current)
		return (
			<div className={values.orientation === "vertical" ? undefined : "w-full max-w-2xl"}>
				<Stepper
					current={current}
					orientation={values.orientation as "horizontal" | "vertical"}
					indicator={values.indicator as "number" | "dot"}
					aria-label="Checkout progress"
				>
					{STEPS.map((title, i) => (
						<StepperItem
							key={title}
							title={title}
							status={values.error === true && i === current ? "error" : undefined}
						/>
					))}
				</Stepper>
			</div>
		)
	},
	snippet: (values) => {
		const current = Number(values.current)
		const items = STEPS.map(
			(title, i) =>
				`\t<StepperItem title="${title}"${values.error === true && i === current ? ' status="error"' : ""} />`,
		).join("\n")
		return `<Stepper current={${current}}${attrs(stepperMeta, values, ["orientation", "indicator"])} aria-label="Checkout progress">\n${items}\n</Stepper>`
	},
}

export default entry
