import { Note, noteMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function NotePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Note" lede={ledeFor(noteMeta)} />

			<ComponentPlayground meta={noteMeta} />

			<Section
				title="Tones"
				description="Each tone pairs its color with a matching icon, so color is never the only signal."
			>
				<Example className="flex-col items-stretch">
					<Note tone="info">
						Editions mint on Solana mainnet via Helius RPC.
					</Note>
					<Note tone="warning">
						Your SOL balance is low. Top up before minting.
					</Note>
					<Note tone="success">Purchase confirmed and the cNFT is in your wallet.</Note>
					<Note tone="destructive">
						The transaction failed on-chain and was not submitted again.
					</Note>
					<Note tone="neutral">
						Drafts are saved locally until you publish them.
					</Note>
				</Example>
			</Section>

			<Section
				title="With title"
				description="A bold lead-in above the message."
			>
				<Example className="flex-col items-stretch">
					<Note tone="warning" title="Low balance">
						Add SOL to cover the mint fee, or enable the fee subsidy.
					</Note>
					<Note tone="success" title="Minted">
						Your edition is live and collectible by anyone with the link.
					</Note>
				</Example>
			</Section>

			<Section
				title="With an action"
				description="One quiet remedy when the reader can fix the problem."
			>
				<Example
					className="flex-col items-stretch"
					code='<Note tone="warning" action={{ label: "Unload chat model", onClick: unloadChatModel }}>gemma-4 is holding VRAM — generating now may be slow or fail.</Note>'
				>
					<Note
						tone="warning"
						action={{ label: "Unload chat model", onClick: () => {} }}
					>
						gemma-4 is holding VRAM — generating now may be slow or fail.
					</Note>
					<Note
						tone="info"
						title="Fee subsidy available"
						action={{ label: "Read the docs", href: "/note" }}
					>
						Editions under 100 supply can mint without a SOL balance.
					</Note>
					<Note
						tone="destructive"
						action={{ label: "Retry upload", onClick: () => {} }}
					>
						Three files failed to upload and were not retried.
					</Note>
				</Example>
			</Section>

			<MetaFooter meta={noteMeta} />
		</>
	)
}
