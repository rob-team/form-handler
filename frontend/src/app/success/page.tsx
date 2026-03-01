import Link from "next/link"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Props {
  searchParams: Promise<{ ref?: string }>
}

function isValidAbsoluteUrl(value: string): boolean {
  return /^https?:\/\/.+/.test(value)
}

export const metadata = { title: "Form submitted — FormSaaS" }

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const ref = params.ref ?? ""
  const hasBackLink = isValidAbsoluteUrl(ref)

  let hostname = ""
  if (hasBackLink) {
    try {
      hostname = new URL(ref).hostname
    } catch {
      // ignore parse errors
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="text-4xl mb-2" aria-hidden>
            ✅
          </div>
          <CardTitle>Successfully submitted</CardTitle>
          <CardDescription>Your message has been received.</CardDescription>
        </CardHeader>
        {hasBackLink && (
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <a href={ref}>Return to {hostname || "site"}</a>
            </Button>
          </CardFooter>
        )}
        {!hasBackLink && (
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              You may close this page.
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
