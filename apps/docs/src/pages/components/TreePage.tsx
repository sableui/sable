import {
	Button,
	Field,
	Icon,
	Switch,
	Tree,
	TreeAddRow,
	TreeEmpty,
	TreeRow,
	TreeSection,
	treeMeta,
} from "@sableui/react"
import { useState } from "react"
import { MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

/** A bare panel to hold each tree: a bordered frame with no inset, on the panel surface. */
const FRAME = "sable-frame sable-frame-tool overflow-hidden w-full bg-panel"

type Layer = { id: string; name: string; effects: string[]; open: boolean; visible: boolean }

/**
 * A live layer tree, plus a switch that reproduces the defect this component was
 * built to prevent. Seeing the inverted nesting is far more convincing than the
 * paragraph explaining it, so the page ships the broken state as a demo.
 */
function TreeDemo() {
	const [layers, setLayers] = useState<Layer[]>([
		{ id: "a", name: "Backdrop", effects: ["Block displacement"], open: true, visible: true },
		{ id: "b", name: "Overlay", effects: [], open: true, visible: false },
	])
	const [selected, setSelected] = useState("a")
	const [broken, setBroken] = useState(false)

	const patch = (id: string, next: Partial<Layer>) =>
		setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...next } : l)))

	return (
		<div className="flex flex-col gap-3">
			<Field label="Show broken nesting" orientation="horizontal">
				<Switch checked={broken} onCheckedChange={setBroken} />
			</Field>

			<div
				data-density="compact"
				// Overriding --tree-indent alone is exactly the mistake: the step no
				// longer matches the column, so children land left of their parents.
				style={broken ? ({ "--tree-indent": "10px" } as React.CSSProperties) : undefined}
				className="sable-frame sable-frame-tool overflow-hidden w-(--panel-width) bg-panel"
			>
				{/* selectionFollowsFocus: the arrows select as they move, as in a
				    layers panel; Tab back in lands on the selected row. */}
				<Tree aria-label="Layers" selectionFollowsFocus>
					<TreeSection title="Document effects" hint="Applied to the flattened composite">
						<TreeRow
							depth={0}
							icon={<Icon name="sparkles" />}
							selected={selected === "doc-1"}
							onClick={() => setSelected("doc-1")}
						>
							Channel shift
						</TreeRow>
						<TreeAddRow depth={0} label="Add effect" />
					</TreeSection>

					<TreeSection
						title="Layers"
						action={<span className="text-ui-num text-muted-foreground">{layers.length}</span>}
					>
						{layers.map((layer) => (
							<div key={layer.id}>
								<TreeRow
									depth={0}
									icon={<Icon name="image-stack" />}
									expandable={layer.effects.length > 0}
									expanded={layer.open}
									onExpandedChange={(open) => patch(layer.id, { open })}
									toggleLabel={layer.name}
									selected={selected === layer.id}
									dimmed={!layer.visible}
									onClick={() => setSelected(layer.id)}
									actions={
										<Button
											size="icon-xs"
											variant="ghost"
											aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
											// At rest only when it shows the non-default value (hidden);
											// otherwise on hover or focus of the row — and always on touch.
											className={layer.visible ? "reveal-on-hover" : undefined}
											onClick={(event) => {
												event.stopPropagation()
												patch(layer.id, { visible: !layer.visible })
											}}
										>
											<Icon name={layer.visible ? "eye" : "eye-off"} />
										</Button>
									}
								>
									{layer.name}
								</TreeRow>

								{layer.open ? (
									<>
										{layer.effects.length === 0 ? (
											// Lands on the effect rows' edge: TreeEmpty reads the same
											// indent the rows do, at the branch's depth.
											<TreeEmpty depth={1} message="No effects yet" />
										) : null}
										{layer.effects.map((effect) => (
											<TreeRow
												key={effect}
												depth={1}
												icon={<Icon name="sparkles" />}
												selected={selected === effect}
												onClick={() => setSelected(effect)}
											>
												{effect}
											</TreeRow>
										))}
										<TreeAddRow depth={1} label="Add effect" />
									</>
								) : null}
							</div>
						))}
						<TreeAddRow depth={0} label="Add image" />
					</TreeSection>
				</Tree>
			</div>
		</div>
	)
}

/**
 * The file-tree shape: rows nest with `subtree`, folders keep their own open
 * state (`defaultExpanded`), and the kind reads from the icon convention —
 * folder for a row with a subtree, file for a leaf. Selection stays with the
 * page, because which file is open is app state.
 */
function FileTreeDemo() {
	const [open, setOpen] = useState("button.tsx")
	const file = (name: string) => (
		<TreeRow
			key={name}
			icon={<Icon name="file" />}
			selected={open === name}
			onClick={() => setOpen(name)}
		>
			{name}
		</TreeRow>
	)
	const folder = (name: string, children: React.ReactNode, defaultExpanded = false) => (
		<TreeRow
			key={name}
			icon={<Icon name="folder" />}
			toggleLabel={name}
			defaultExpanded={defaultExpanded}
			subtree={children}
		>
			{name}
		</TreeRow>
	)

	return (
		<div className="grid gap-3 sm:grid-cols-2">
			<div className={FRAME}>
				<Tree aria-label="Project files">
					{folder(
						"src",
						<>
							{file("index.ts")}
							{folder(
								"components",
								<>
									{file("button.tsx")}
									{file("card.tsx")}
									{folder("tree", <>{file("tree.tsx")}{file("tree.meta.ts")}</>)}
								</>,
								true,
							)}
							{file("styles.css")}
						</>,
						true,
					)}
					{file("package.json")}
					{file("README.md")}
				</Tree>
			</div>
			<div className={FRAME}>
				<Tree aria-label="Site files">
					{folder("public", <>{file("favicon.ico")}{file("og-image.png")}</>)}
					{folder("docs", <>{file("getting-started.md")}{file("theming.md")}</>)}
				</Tree>
			</div>
		</div>
	)
}

/**
 * Rows whose click does more than select. An artboard row here makes that
 * artboard active and opens it, so with selectionFollowsFocus it opts out
 * (`selectOnFocus={false}`): the arrows pass over it without reshaping the
 * tree, and Enter or a click still switches to it. Its layers select as the
 * arrows land on them.
 */
function ArtboardsDemo() {
	const boards = [
		{ id: "home", name: "Home", layers: ["Hero", "Nav"] },
		{ id: "pricing", name: "Pricing", layers: ["Plans", "FAQ"] },
	]
	const [active, setActive] = useState("home")
	const [selected, setSelected] = useState("Hero")
	return (
		<div data-density="compact" className="sable-frame sable-frame-tool overflow-hidden w-(--panel-width) bg-panel">
			<Tree aria-label="Artboards" selectionFollowsFocus>
				{boards.map((board) => (
					<TreeRow
						key={board.id}
						icon={<Icon name="layout" />}
						toggleLabel={board.name}
						expanded={active === board.id}
						onExpandedChange={(open) => open && setActive(board.id)}
						selectOnFocus={false}
						onClick={() => setActive(board.id)}
						subtree={board.layers.map((layer) => (
							<TreeRow
								key={layer}
								icon={<Icon name="image-stack" />}
								selected={selected === layer}
								onClick={() => setSelected(layer)}
							>
								{layer}
							</TreeRow>
						))}
					>
						{board.name}
					</TreeRow>
				))}
			</Tree>
		</div>
	)
}

export function TreePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Tree" lede={ledeFor(treeMeta)} />

			<Section
				title="Live preview"
				description="Select a row, open and close a group, hover a row to hide it. From the keyboard the arrows select as they move (selectionFollowsFocus); an add row is only focused. The switch shows the broken nesting this component prevents."
			>
				<TreeDemo />
			</Section>

			<Section
				title="File tree"
				description="Folders open and close on their own and start closed unless set open; the rows an open reveals unfold into place. Click a file to select it, or use the arrow keys."
			>
				<FileTreeDemo />
			</Section>

			<Section
				title="Rows that only take focus"
				description="An artboard row switches the active artboard and opens it, which is more than a selection. With selectOnFocus={false} the arrows pass over it without reshaping the tree; Enter or a click still switches to it. Its layers select as the arrows land on them."
			>
				<ArtboardsDemo />
			</Section>

			<Section
				title="Empty states"
				description="One short line and one action, or an area to drop into."
			>
				<div data-density="compact" className="grid gap-3 sm:grid-cols-2">
					<div className={FRAME}>
						<Tree aria-label="Layers">
							<TreeSection title="Layers">
								<TreeEmpty
									message="No images yet"
									action={<TreeAddRow depth={0} label="Add image" />}
								/>
							</TreeSection>
						</Tree>
					</div>
					<div className={FRAME}>
						<Tree aria-label="Layers">
							<TreeSection title="Layers">
								<TreeEmpty dropTarget message="Drop an image" />
							</TreeSection>
						</Tree>
					</div>
				</div>
			</Section>

			<MetaFooter meta={treeMeta} />
		</>
	)
}
