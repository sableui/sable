import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { Field } from "../components/form"
import { OtpField } from "../components/otp-field"
import { cn } from "../lib/cn"

// ---block-code---
const sentTo = "ada@studio.com"

export interface VerifyCodeBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet, Dialog or muted section that already frames it. */
	framed?: boolean
	/** Called with the code as soon as the last digit is entered. */
	onVerify?: (code: string) => void
	onResend?: () => void
}

export function VerifyCodeBlock({ className, framed = true, onVerify, onResend }: VerifyCodeBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardHeader>
				<CardTitle>Check your email</CardTitle>
				<CardDescription>
					We sent a 6-digit code to <span className="text-foreground">{sentTo}</span>.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Field label="Verification code" description="The code expires in 10 minutes.">
					<OtpField length={6} groupSize={3} onValueComplete={(code: string) => onVerify?.(code)} />
				</Field>
			</CardContent>
			<CardFooter className="justify-between gap-3">
				<span className="text-caption text-muted-foreground">Didn’t get it?</span>
				<Button variant="ghost" size="sm" onClick={onResend}>
					Resend code
				</Button>
			</CardFooter>
		</Card>
	)
}
