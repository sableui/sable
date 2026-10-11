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
import { Badge, Button, Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle, cn } from "@sableui/react"

const product = { title: "Untitled (gold rush)", maker: "Mara Okafor", edition: "12 of 50", price: "0.42 SOL" }

/**
 * Placeholder artwork painted from the palette — a soft mesh of the theme's
 * decorative tones over the brand, so it follows every look. Replace the art
 * <div> with your product's image.
 */
const ART_TONES = ["info", "collectible", "edition", "standard"]
const ART_SPOTS = [[18, 22, 58], [82, 18, 55], [70, 88, 60], [12, 92, 55]]
const artwork = [
	...ART_SPOTS.map(
		([x, y, reach], i) =>
			// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own --tone token, so it follows every look
			`radial-gradient(in oklab at ${x}% ${y}%, oklch(from var(--tone-${ART_TONES[i % ART_TONES.length]}) clamp(0.5, calc(l + 0.16), 0.9) max(calc(c * 1.25), 0.1) h), transparent ${reach}%)`,
	),
	"var(--primary)",
].join(", ")

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
			<div aria-hidden className="aspect-[4/3]" style={{ background: artwork }} />
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
