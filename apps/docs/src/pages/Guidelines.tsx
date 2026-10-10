import {
	Badge,
	Button,
	COMPONENT_GROUPS,
	type ComponentGroup,
	Pill,
	SearchInput,
} from "@sableui/react"
import { useMemo, useState } from "react"
import { PageHeader } from "../components/docs-ui"
import { PRACTICES, type Practice } from "../lib/catalog-guidance"
import { hrefFor } from "../lib/router"

/**
 * Guidelines: every component's do's and don'ts in one searchable list, in
 * the designer-facing wording. The build-enforced rules are agent material
 * and live in the registry's `enforcement` block, not here.
 */

type Filter = "all" | "do" | "dont"

function PracticeRow({ practice }: { practice: Practice }) {
	const isDo = practice.guidance === "do"
	return (
		<li className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border py-3 last:border-0">
			<span
				className={
					isDo
						? "text-label-md text-success shrink-0"
						: "text-label-md text-destructive shrink-0"
				}
			>
				{isDo ? "Do" : "Don't"}
			</span>
			<p className="text-body-sm text-muted-foreground min-w-0 w-full max-w-(--measure-prose) flex-auto text-pretty sm:w-auto sm:flex-1">
				{practice.description}
			</p>
			<Button
				variant="link"
				size="xs"
				className="shrink-0 sm:ms-auto"
				render={<a href={hrefFor(practice.slug)} />}
			>
				{practice.label}
			</Button>
		</li>
	)
}

export function GuidelinesPage() {
	const [query, setQuery] = useState("")
	const [group, setGroup] = useState<ComponentGroup | "all">("all")
	const [filter, setFilter] = useState<Filter>("all")

	const matches = useMemo(() => {
		const q = query.trim().toLowerCase()
		return PRACTICES.filter((practice) => {
			if (group !== "all" && practice.group !== group) return false
			if (filter !== "all" && practice.guidance !== filter) return false
			if (!q) return true
			return (
				practice.description.toLowerCase().includes(q) ||
				practice.label.toLowerCase().includes(q)
			)
		})
	}, [query, group, filter])


	return (
		<>
			<PageHeader
				eyebrow="Guide"
				title="Guidelines"
				lede={`${PRACTICES.length} do's and don'ts from across the components. Search them, or filter by kind.`}
			/>

			<section>
				<div className="mb-6 grid gap-4">
					<SearchInput
						value={query}
						onValueChange={setQuery}
						placeholder="Search, like “label” or “loading”"
					/>
					<div className="flex flex-wrap gap-1.5">
						<Pill
							selected={filter === "all"}
							onClick={() => setFilter("all")}
						>
							Everything
						</Pill>
						<Pill
							selected={filter === "do"}
							onClick={() => setFilter("do")}
						>
							Do
						</Pill>
						<Pill
							selected={filter === "dont"}
							onClick={() => setFilter("dont")}
						>
							Don't
						</Pill>
					</div>
					<div className="flex flex-wrap gap-1.5">
						<Pill
							selected={group === "all"}
							onClick={() => setGroup("all")}
						>
							All roles
						</Pill>
						{COMPONENT_GROUPS.map((name) => (
							<Pill
								key={name}
								selected={group === name}
								onClick={() => setGroup(name)}
							>
								{name}
							</Pill>
						))}
					</div>
				</div>

				<div className="mb-3 flex items-center gap-2">
					<Badge size="sm">
						{matches.length}{" "}
						{matches.length === 1 ? "practice" : "practices"}
					</Badge>
				</div>

				{matches.length ? (
					<ul className="rounded-lg border border-border px-4">
						{matches.map((practice) => (
							<PracticeRow
								key={`${practice.component}-${practice.description}`}
								practice={practice}
							/>
						))}
					</ul>
				) : (
					<p className="text-body-md text-muted-foreground">
						Nothing matches those filters.
					</p>
				)}
			</section>
		</>
	)
}
