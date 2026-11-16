import { GradientArt, gradientArtMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: gradientArtMeta,
	only: ["variant"],
	fixed: ['seed="Untitled (gold rush)"', 'className="aspect-[4/3] w-64 rounded-lg"'],
	render: (values) => (
		<GradientArt {...as<ComponentProps<typeof GradientArt>>(values)} seed="Untitled (gold rush)" className="aspect-[4/3] w-64 rounded-lg" />
	),
}

export default entry
