import { useEffect, useState } from "react"
import { StreamingText, streamingTextMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const ANSWER =
	"Pistachio is your fastest-growing flavour — sales are up 23% this month and margins beat vanilla by eight points. Stone-fruit flavours are trending in the same range, so an apricot sorbet would likely land well."

/** Feeds the component a growing string, the way a real source would. */
function useStream(full: string, msPerWord = 90) {
	const [count, setCount] = useState(0)
	const words = full.split(" ")
	useEffect(() => {
		if (count >= words.length) return
		const t = setTimeout(() => setCount((c) => c + 1), msPerWord)
		return () => clearTimeout(t)
	}, [count, words.length, msPerWord])
	return {
		text: words.slice(0, count).join(" "),
		streaming: count < words.length,
		restart: () => setCount(0),
	}
}

export function StreamingTextPage() {
	const answer = useStream(ANSWER)
	const bare = useStream(ANSWER)
	const headline = useStream("Permanent by design.", 140)

	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Streaming Text"
				lede={ledeFor(streamingTextMeta)}
			/>

			<Section
				title="Basic"
				description="Each word comes into focus as it arrives. A steady caret marks where it's writing."
			>
				<Example onReplay={answer.restart}>
					<StreamingText text={answer.text} streaming={answer.streaming} />
				</Example>
			</Section>

			<Section
				title="Without a caret"
				description="Hide the caret when something nearby already shows the wait."
			>
				<Example onReplay={bare.restart}>
					<StreamingText
						text={bare.text}
						streaming={bare.streaming}
						caret={false}
					/>
				</Example>
			</Section>

			<Section
				title="Character split"
				description="Letter by letter, for short headlines only."
			>
				<Example onReplay={headline.restart}>
					<StreamingText
						as="h2"
						split="char"
						className="text-heading-2"
						text={headline.text}
						streaming={headline.streaming}
					/>
				</Example>
			</Section>

			<MetaFooter meta={streamingTextMeta} />
		</>
	)
}
