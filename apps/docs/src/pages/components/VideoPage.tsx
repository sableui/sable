import { Video, videoMeta } from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const CLIP = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"

const POSTER =
	"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=960&h=540&fit=crop"

export function VideoPage() {
	const [src, setSrc] = useState<string>()
	return (
		<>
			<PageHeader eyebrow="Components" title="Video" lede={ledeFor(videoMeta)} />

			<Section
				title="With a poster"
				description="The poster image shows until playback starts."
			>
				<Example className="!block">
					<Video
						className="max-w-md"
						poster={POSTER}
						src={CLIP}
					/>
				</Example>
			</Section>

			<Section
				title="Placeholder"
				description="Before a video is set, the frame shows the poster behind a play button. Give it onRequestPlay to load the clip when pressed."
			>
				<Example className="!block">
					<Video
						className="max-w-md"
						poster={POSTER}
						src={src}
						autoPlay={src !== undefined}
						onRequestPlay={() => setSrc(CLIP)}
					/>
				</Example>
			</Section>

			<MetaFooter meta={videoMeta} />
		</>
	)
}
