import { Card, CardContent, CardDescription, CardHeader, cardMeta, CardTitle } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: cardMeta,
	only: ["variant", "density"],
	stageClassName: "block",
	render: (values) => (
		<Card {...as<ComponentProps<typeof Card>>(values)}>
			<CardHeader>
				<CardTitle>Studio plan</CardTitle>
				<CardDescription>Up to 10 seats.</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-body-md">
					Every seat gets unlimited projects and shared reports.
				</p>
			</CardContent>
		</Card>
	),
}

export default entry
