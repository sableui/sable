import { Button, Icon, MiddleTruncate, middleTruncateMeta, Row, useCopy } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const SOLANA_ADDRESS = "5J7sX2QpHt9vK4mNbR8wYcZ3dF6gH1jL0pA8xQpVnTu"
const TX_SIGNATURE =
	"4Vbp9hQwZk2mNcR8tLx3yF6gH1jL0pA8xQpVnTu5J7sX2QpHt9vK4mNbR8wYcZ3dF6gH1jL0pA8xQpVnTuZk2mN"
const ETH_ADDRESS = "0xAbC1234567890dEf1234567890aBcDeF12345678"
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
						<MiddleTruncate text={SOLANA_ADDRESS} />
						<MiddleTruncate text={TX_SIGNATURE} />
						<MiddleTruncate text={ETH_ADDRESS} />
					</div>
				</Example>
			</Section>

			<Section
				title="Custom start and end"
				description="Choose how much of each end stays visible."
			>
				<Example>
					<div className="flex flex-col gap-2">
						<MiddleTruncate text={ETH_ADDRESS} startChars={4} endChars={4} />
						<MiddleTruncate text={SOLANA_ADDRESS} startChars={8} endChars={4} />
						<MiddleTruncate text={TX_SIGNATURE} startChars={10} endChars={10} />
					</div>
				</Example>
			</Section>

			<Section
				title="Copyable value"
				description="Truncation hides part of the value, so give people a way to take all of it."
			>
				<Example code={COPYABLE_CODE}>
					<CopyableAddress address={SOLANA_ADDRESS} />
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
