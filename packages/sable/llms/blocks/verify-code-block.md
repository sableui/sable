# VerifyCodeBlock

A one-time-code card: where the code went, a six-slot OtpField grouped 3 + 3 under a visible label, and a quiet Resend.

**Intent:** Reach for this for email or SMS verification, two-factor sign-in, or confirming a sensitive change. For a code someone copies out (a recovery key), show it with Code and a copy button instead.

**Block:** Auth · card · designed for 18rem–24rem wide (fills its container up to the max)

## Notes

- No submit button: the code verifies the moment the last slot fills, which is what people expect from a code field.
- The destination is named in the description, so a mistyped address is caught before the wait.
- Resend is a ghost Button — present for the stuck case, never competing with the field.

## Accessibility

- OtpField names each slot ("Character 1 of 6") and accepts a pasted code into all six at once.
- Field labels the group and reads the expiry as its description.

## Source

```tsx
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, Field, OtpField } from "@sableui/react"

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
				<Button variant="ghost" size="sm" bleed="end" onClick={onResend}>
					Resend code
				</Button>
			</CardFooter>
		</Card>
	)
}
```
