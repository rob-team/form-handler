"use client"

import { useState } from "react"
import Link from "next/link"
import { getPocketBase } from "@/lib/pocketbase-browser"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

type State = "idle" | "loading" | "success" | "error"

export default function ResetPasswordPage() {
  const [state, setState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = (
      (e.currentTarget.elements.namedItem("email") as HTMLInputElement) ?? {}
    ).value

    setState("loading")
    setErrorMsg("")

    try {
      await getPocketBase().collection("users").requestPasswordReset(email)
      setState("success")
    } catch {
      // Always show success to prevent email enumeration.
      setState("success")
    }
  }

  if (state === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              If that email address is registered, we&apos;ve sent a password reset
              link.{" "}
              <Link href="/login" className="underline">
                Back to login
              </Link>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send a reset link.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {state === "error" && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={state === "loading"}
            >
              {state === "loading" ? "Sending…" : "Send reset link"}
            </Button>
            <Link
              href="/login"
              className="text-sm text-muted-foreground underline"
            >
              Back to login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
