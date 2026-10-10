import { CodeBlock, codeBlockMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const cnSource = `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}`

const sizeSource = `type Size = "sm" | "md"
const size: Size = "md"`

export function CodeBlockPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Code Block"
				lede={ledeFor(codeBlockMeta)}
			/>

			<Section
				title="With filename"
				description="Long lines scroll sideways instead of wrapping."
			>
				<Example>
					<CodeBlock filename="cn.ts" code={cnSource} />
				</Example>
			</Section>

			<Section
				title="Bare"
				description="No filename and no copy button, for a short example to read rather than copy. A command someone will paste goes in the prompt form below."
			>
				<Example>
					<CodeBlock showCopy={false} code={sizeSource} />
				</Example>
			</Section>

			<Section title="Command" description="With a prompt, it is a one-line command to copy: the prompt is unselectable and copy takes only the command.">
				<Example
					className="flex-col items-stretch gap-3"
					code={`<CodeBlock prompt="$" code="pnpm add @sableui/react" />
<CodeBlock prompt=">" code="pnpm dev" />`}
				>
					<CodeBlock prompt="$" code="pnpm add @sableui/react" />
					<CodeBlock prompt=">" code="pnpm dev" />
				</Example>
			</Section>

			<MetaFooter meta={codeBlockMeta} />
		</>
	)
}
