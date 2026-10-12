# ProductCardBlock

A product card: edge-to-edge artwork, title and maker, an edition Badge, and the price beside a single buy action.

**Intent:** Reach for this for a product, edition or listing in a grid or a featured slot. For a row in a dense list, use an Entity with the image as `leading` instead.

**Block:** Commerce · card · designed for 16rem–20rem wide (fills its container up to the max)

## Notes

- The artwork runs to the card's edges; the card clips it to its own corners (overflow-hidden).
- Prices are `text-mono-lg` — the metric mono tier with tabular figures — never a heading tier.
- The placeholder art is painted from the palette's decorative tones so it follows the theme; swap it for the product image with real alt text.

## Accessibility

- The placeholder art is aria-hidden. A real product image needs alt text naming the product.
- The card is not a link: it holds its own button. To make the whole card navigate, move the action to the detail page and render the Card as an <a>.

## Source

```tsx
import { AspectBox, Badge, Button, Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle, cn, MediaImage } from "@sableui/react"

// `image` is the product shot URL; left empty, it paints art seeded by the title.
const product = { title: "Untitled (gold rush)", maker: "Mara Okafor", image: "", edition: "12 of 50", price: "0.42 SOL" }


export interface ProductCardBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
	/** The buy action. */
	onCollect?: () => void
}

export function ProductCardBlock({ className, framed = true, onCollect }: ProductCardBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs overflow-hidden", className)}>
			<AspectBox ratio={4 / 3}>
				<MediaImage src={product.image} seed={product.title} />
			</AspectBox>
			<CardHeader>
				<CardTitle>{product.title}</CardTitle>
				<CardDescription>{product.maker}</CardDescription>
				<CardAction>
					<Badge tone="edition">{product.edition}</Badge>
				</CardAction>
			</CardHeader>
			<CardFooter className="justify-between pt-4">
				<span className="text-mono-lg">{product.price}</span>
				<Button onClick={onCollect}>Collect</Button>
			</CardFooter>
		</Card>
	)
}
```
