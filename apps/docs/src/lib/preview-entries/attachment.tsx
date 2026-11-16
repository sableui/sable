import { Attachment, attachmentMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, attrs, THUMBNAIL, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: attachmentMeta,
	only: ["variant", "status"],
	// A media tile shows its thumbnail; a card shows the file's icon and meta.
	render: (values) => (
		<Attachment
			{...as<ComponentProps<typeof Attachment>>(values)}
			name="cover.png"
			meta="2.4 MB · PNG"
			thumbnail={values.variant === "media" ? THUMBNAIL : undefined}
		/>
	),
	snippet: (values) =>
		`<Attachment${attrs(attachmentMeta, values, ["variant", "status"])} name="cover.png" meta="2.4 MB · PNG"${
			values.variant === "media" ? " thumbnail={url}" : ""
		} />`,
}

export default entry
