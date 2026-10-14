import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { IconProvider } from "@sableui/react"
import { reiconIconSet } from "@sableui/react/icons/reicon"
import { MediaPlayerBlock, PricingCardBlock, ProductCardBlock, RevenueBreakdownBlock } from "@sableui/react/blocks"
import { SableMark } from "../src/components/SableLogo"
import siteMeta from "../src/site-meta.json"
import "./og.css"

/*
 * The social share image (og:image), drawn with Sable itself: the homepage's
 * proposition beside real blocks, the same ones the homepage canvas shows.
 * Dev only — not a build input. `node scripts/render-og-image.mjs` screenshots
 * this page at 1200×630 into public/og-image.png; rerun it when the brand,
 * the tagline or the blocks change.
 */

const BLOCK = "w-80 shrink-0"

function ShareImage() {
	return (
		<div data-og-ready="" className="relative flex h-[630px] w-[1200px] overflow-hidden bg-background text-foreground">
			<div className="flex w-[560px] shrink-0 flex-col justify-between py-16 pr-6 pl-18">
				<div className="flex items-center gap-3">
					<SableMark className="size-10" />
					<span className="text-heading-3">{siteMeta.name}</span>
				</div>
				<div className="grid gap-6">
					<h1 className="text-display-xl text-balance">UI your agent gets right.</h1>
					<p className="max-w-md text-body-lg text-pretty text-muted-foreground">
						Themeable React components, reusable presets, and a skill that guides your coding agent.
					</p>
				</div>
				<p className="font-mono text-body-md text-muted-foreground">sableui.com</p>
			</div>

			<div className="relative flex-1 bg-muted">
				<div className="absolute -top-14 left-12 flex gap-6">
					<div className="flex flex-col gap-6">
						<ProductCardBlock className={BLOCK} />
						<RevenueBreakdownBlock className={BLOCK} />
					</div>
					<div className="mt-36 flex flex-col gap-6">
						<PricingCardBlock className={BLOCK} />
						<MediaPlayerBlock className={BLOCK} />
					</div>
				</div>
			</div>
		</div>
	)
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<IconProvider set={reiconIconSet}>
			<ShareImage />
		</IconProvider>
	</StrictMode>,
)
