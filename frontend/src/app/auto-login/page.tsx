"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getPocketBase } from "@/lib/pocketbase-browser"

/**
 * Auto-login page for demo/development use.
 *
 * Accepts `email` and `password` query params, authenticates with PocketBase,
 * then redirects to the `redirect` param (default: /dashboard).
 */
export default function AutoLoginPage() {
  const params = useSearchParams()

  useEffect(() => {
    const email = params.get("email")
    const password = params.get("password")
    const redirectTo = params.get("redirect") || "/dashboard"

    if (!email || !password) return

    const pb = getPocketBase()
    pb.collection("users")
      .authWithPassword(email, password)
      .then(() => {
        window.location.href = redirectTo
      })
      .catch(() => {
        window.location.href = "/login"
      })
  }, [params])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Logging in…</p>
    </div>
  )
}
