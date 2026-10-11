import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { CodeBlock } from "../components/code-block"
import { Icon } from "../icon"
import { cn } from "../lib/cn"
import { Region, Row, Stack } from "../layout"

// ---block-code---
const hero = {
	eyebrow: "Open source · MIT licensed",
	title: "Product UI your agents can't get wrong",
	lede: "Sable is a themeable React component library with enforced tokens, typography, and motion, documented for coding agents as carefully as for people.",
	primary: { label: "Get started", href: "/docs/getting-started" },
	secondary: { label: "Browse components", href: "/components" },
	install: "pnpm add @sableui/react",
}

export interface HeroBlockProps {
	className?: string
}

export function HeroBlock({ className }: HeroBlockProps) {
	return (
		<Region as="section" max="wide" className={cn("w-full py-16 sm:py-24", className)}>
			<Stack gap={8} align="center">
				<Stack gap={4} align="center" className="text-center">
					<Badge appearance="outline" size="sm" icon={<Icon name="sparkles" />}>
						{hero.eyebrow}
					</Badge>
					<h1 className="max-w-4xl text-balance text-display-lg sm:text-display-2xl">{hero.title}</h1>
					<p className="max-w-(--measure-prose) text-pretty text-body-lg text-muted-foreground">{hero.lede}</p>
					<Row gap={2} justify="center" wrap className="pt-2">
						<Button size="cta" render={<a href={hero.primary.href} />}>
							{hero.primary.label}
						</Button>
						<Button size="cta" variant="outline" render={<a href={hero.secondary.href} />}>
							{hero.secondary.label}
						</Button>
					</Row>
				</Stack>
				<div className="w-full max-w-sm">
					<CodeBlock prompt="$" code={hero.install} />
				</div>
			</Stack>
		</Region>
	)
}
