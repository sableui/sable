import { Button, Icon, MiddleTruncate, middleTruncateMeta, Row, useCopy } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const API_KEY = "demo_key_7f3a9c2e5b8d1f4a6c0e9b3d7a2f5c8e1b4"
const FILE_PATH =
	"projects/northwind/reports/2026/q3/board-review/final/usage-by-team-and-region.csv"
const COMMIT_HASH = "9f2c4e7a1b3d5f60c8e2a4b6d8f0e1c3a5b7d9f2"
const SHORT = "abc123"

const COPYABLE_CODE = `const { copy, copied } = useCopy(address)
<Row gap={1}>
	<MiddleTruncate text={address} />
	<Button variant="ghost" size="icon-xs" aria-label="Copy address" onClick={copy}>
		<Icon name={copied ? "check" : "copy"} />
	</Button>
</Row>`

/** Truncation removes characters, so the full value needs a way out: copy. */
function CopyableAddress({ address }: { address: string }) {
	const { copy, copied } = useCopy(address)
	return (
		<Row gap={1}>
			<MiddleTruncate text={address} />
			<Button variant="ghost" size="icon-xs" aria-label="Copy address" onClick={copy}>
				<Icon name={copied ? "check" : "copy"} />
			</Button>
		</Row>
	)
}

export function MiddleTruncatePage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Middle Truncate"
				lede={ledeFor(middleTruncateMeta)}
			/>

			<Section
				title="Basic"
				description="Keeps both ends readable. Hover to see the full value."
			>
				<Example>
					<div className="flex flex-col gap-2">
						<MiddleTruncate text={API_KEY} />
						<MiddleTruncate text={FILE_PATH} />
						<MiddleTruncate text={COMMIT_HASH} />
					</div>
				</Example>
			</Section>

			<Section
				title="Custom start and end"
				description="Choose how much of each end stays visible."
			>
				<Example>
					<div className="flex flex-col gap-2">
						<MiddleTruncate text={COMMIT_HASH} startChars={4} endChars={4} />
						<MiddleTruncate text={API_KEY} startChars={8} endChars={4} />
						<MiddleTruncate text={FILE_PATH} startChars={10} endChars={10} />
					</div>
				</Example>
			</Section>

			<Section
				title="Copyable value"
				description="Truncation hides part of the value, so give people a way to take all of it."
			>
				<Example code={COPYABLE_CODE}>
					<CopyableAddress address={API_KEY} />
				</Example>
			</Section>

			<Section
				title="Short strings"
				description="Short values show in full."
			>
				<Example>
					<MiddleTruncate text={SHORT} />
				</Example>
			</Section>

			<MetaFooter meta={middleTruncateMeta} />
		</>
	)
}
