import { cn } from "../lib/cn"
import { Region, Stack } from "../layout"

// ---block-code---
const brand = { name: "Sable", tagline: "React components, patterns, and tokens for products built with AI agents." }

const groups = [
	{
		title: "Product",
		links: [
			{ label: "Components", href: "/components" },
			{ label: "Patterns", href: "/patterns" },
			{ label: "Themes", href: "/themes" },
			{ label: "Canvas", href: "/canvas" },
		],
	},
	{
		title: "Resources",
		links: [
			{ label: "Documentation", href: "/docs" },
			{ label: "Changelog", href: "/changelog" },
			{ label: "llms.txt", href: "/llms.txt" },
		],
	},
	{
		title: "Community",
		links: [
			{ label: "GitHub", href: "/github" },
			{ label: "npm", href: "/npm" },
			{ label: "Discussions", href: "/discussions" },
		],
	},
]

export interface SiteFooterBlockProps {
	className?: string
}

export function SiteFooterBlock({ className }: SiteFooterBlockProps) {
	return (
		<footer className={cn("w-full border-t border-border", className)}>
			<Region max="wide" className="py-12">
				<div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
					<Stack gap={3} className="max-w-xs">
						<a href="/" className="w-fit text-title-lg motion-interactive hover:text-muted-foreground">
							{brand.name}
						</a>
						<p className="text-body-sm text-muted-foreground">{brand.tagline}</p>
					</Stack>
					<nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
						{groups.map((group) => (
							<div key={group.title}>
								<h2 className="text-label-md text-muted-foreground">{group.title}</h2>
								<ul className="mt-3 flex flex-col gap-1">
									{group.links.map((link) => (
										<li key={link.label}>
											<a href={link.href} className="flex min-h-9 items-center text-body-sm motion-interactive hover:text-muted-foreground">
												{link.label}
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</nav>
				</div>
				<div className="mt-12 border-t border-border pt-6">
					<p className="text-caption text-muted-foreground">
						© 2026 {brand.name}. Released under the MIT license.
					</p>
				</div>
			</Region>
		</footer>
	)
}
