import { Avatar, Bubble, Message, messageMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, attrs, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: messageMeta,
	only: ["align", "avatarSize", "grouped"],
	render: (values) => {
		const end = values.align === "end"
		return (
			<div className="w-full max-w-lg">
				<Message
					{...as<ComponentProps<typeof Message>>(values)}
					messageId="playground"
					avatar={<Avatar size={values.avatarSize as "sm" | "md" | "lg"} fallback="CA" />}
					header={<strong className="text-foreground">Carla</strong>}
				>
					<Bubble variant={end ? "primary" : "muted"} align={end ? "end" : "start"}>
						Did the deploy finish?
					</Bubble>
				</Message>
			</div>
		)
	},
	snippet: (values) => {
		const size = values.avatarSize === "sm" ? "" : ` size="${values.avatarSize}"`
		const bubble = values.align === "end" ? ' variant="primary" align="end"' : ""
		return `<Message${attrs(messageMeta, values, ["align", "avatarSize", "grouped"])}
messageId={id}
avatar={<Avatar${size} fallback="CA" />}
header={<strong>Carla</strong>}

<Bubble${bubble}>Did the deploy finish?</Bubble>
/Message>`
	},
}

export default entry
