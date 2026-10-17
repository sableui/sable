import { Button, Field, OtpField, otpFieldMeta } from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/** Verify on completion — the moment most users reach by pasting. */
function VerifyDemo() {
	const [code, setCode] = useState("")
	const [result, setResult] = useState<"idle" | "ok" | "wrong">("idle")
	return (
		<div className="flex w-full max-w-sm flex-col gap-4">
			<Field
				label="Verification code"
				description="Enter the 6-digit code we sent to your phone. Try 123456."
				error={
					result === "wrong"
						? "That code doesn't match. Check the message and try again."
						: undefined
				}
			>
				<OtpField
					length={6}
					groupSize={3}
					value={code}
					onValueChange={(next) => {
						setCode(next)
						setResult("idle")
					}}
					onValueComplete={(value) =>
						setResult(value === "123456" ? "ok" : "wrong")
					}
				/>
			</Field>
			<p role="status" className="text-body-sm text-muted-foreground">
				{result === "ok" ? "Code verified." : ""}
			</p>
			<div>
				<Button variant="outline" size="sm" onClick={() => setCode("")}>
					Clear code
				</Button>
			</div>
		</div>
	)
}

export function OtpFieldPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="OTP Field"
				lede={ledeFor(otpFieldMeta)}
			/>

			<Section
				title="Six digits"
				description="Paste a code and every slot fills at once."
			>
				<Example code={`<Field label="Verification code">
	<OtpField length={6} />
</Field>`}>
					<Field label="Verification code">
						<OtpField length={6} />
					</Field>
				</Example>
			</Section>

			<Section
				title="Checked when complete"
				description="A wrong code stays on screen so the typo is easy to spot. The field shakes once as it turns invalid and the digits turn red; editing clears the error, so the next wrong code shakes again. Try any code but 123456."
			>
				<Example>
					<VerifyDemo />
				</Example>
			</Section>

			<Section
				title="Error"
				description="Every slot turns red, with the message below."
			>
				<Example
					code={
						'<Field label="Verification code" error="That code has expired. Request a new code and try again.">\n\t<OtpField length={6} groupSize={3} defaultValue="482913" />\n</Field>'
					}
				>
					<div className="w-full max-w-sm">
						<Field
							label="Verification code"
							error="That code has expired. Request a new code and try again."
						>
							<OtpField length={6} groupSize={3} defaultValue="482913" />
						</Field>
					</div>
				</Example>
			</Section>

			<Section
				title="Alphanumeric and disabled"
				description="Codes can take letters as well as digits."
			>
				<Example
					code={`<Field label="Pairing code">
	<OtpField length={8} groupSize={4} validationType="alphanumeric" />
</Field>
<Field label="Device PIN" disabled>
	<OtpField length={4} defaultValue="12" />
</Field>`}
				>
					<div className="flex w-full max-w-sm flex-col gap-4">
						<Field label="Pairing code">
							<OtpField length={8} groupSize={4} validationType="alphanumeric" />
						</Field>
						<Field label="Device PIN" disabled>
							<OtpField length={4} defaultValue="12" />
						</Field>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={otpFieldMeta} />
		</>
	)
}
