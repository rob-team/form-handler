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
import Logo from "@/components/logo"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    setLoading(true)
    setError("")

    try {
      const pb = getPocketBase()
      await pb.collection("users").authWithPassword(email, password)
      // Full page navigation so the server sees the fresh auth cookie.
      // router.push would use cached RSC response and fail after logout→login.
      window.location.href = "/dashboard"
    } catch {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo size="lg" href={undefined} />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline">
              Create one
            </Link>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
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
                autoComplete="current-password"
                required
              />
            </div>
            <Link
              href="/reset-password"
              className="text-sm text-muted-foreground underline block"
            >
              Forgot password?
            </Link>
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
