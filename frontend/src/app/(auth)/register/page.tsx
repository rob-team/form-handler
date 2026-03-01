"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

export default function RegisterPage() {
  const router = useRouter()
  const [state, setState] = useState<State>("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    const passwordConfirm = (
      form.elements.namedItem("passwordConfirm") as HTMLInputElement
    ).value

    if (password !== passwordConfirm) {
      setError("Passwords do not match.")
      setState("error")
      return
    }

    setState("loading")
    setError("")

    try {
      const pb = getPocketBase()
      await pb.collection("users").create({ email, password, passwordConfirm })
      await pb.collection("users").requestVerification(email)
      setState("success")
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Registration failed. Please try again."
      setError(msg)
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification link. Click it to activate your account,
              then{" "}
              <Link href="/login" className="underline">
                log in
              </Link>
              .
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
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {state === "error" && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
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
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="passwordConfirm">Confirm password</Label>
              <Input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={state === "loading"}>
              {state === "loading" ? "Creating account…" : "Create account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
