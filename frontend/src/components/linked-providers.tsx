"use client"

import { useEffect, useState } from "react"
import { getPocketBase } from "@/lib/pocketbase-browser"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ExternalAuth {
  id: string
  provider: string
  providerId: string
}

interface AvailableProvider {
  name: string
  displayName: string
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
}

export default function LinkedProviders({ userId }: { userId: string }) {
  const [linked, setLinked] = useState<ExternalAuth[]>([])
  const [available, setAvailable] = useState<AvailableProvider[]>([])
  const [hasPassword, setHasPassword] = useState(true)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const pb = getPocketBase()
    Promise.all([
      pb.collection("users").listExternalAuths(userId),
      pb.collection("users").listAuthMethods(),
    ])
      .then(([auths, methods]) => {
        setLinked(auths as unknown as ExternalAuth[])
        if (methods.oauth2?.providers) {
          setAvailable(
            methods.oauth2.providers.map((p: AvailableProvider) => ({
              name: p.name,
              displayName: p.displayName,
            }))
          )
        }
        setHasPassword(methods.password?.enabled ?? true)
      })
      .catch((err) => {
        console.error("[LinkedProviders]", err)
        setError("Failed to load provider information.")
      })
      .finally(() => setLoading(false))
  }, [userId])

  async function handleConnect(providerName: string) {
    setError("")
    setActionLoading(providerName)
    try {
      const pb = getPocketBase()
      const authData = await pb.collection("users").authWithOAuth2({ provider: providerName })
      // Sync missing profile fields from provider
      try {
        const updates: Record<string, unknown> = {}
        if (authData.meta?.name && !authData.record.name) {
          updates.name = authData.meta.name
        }
        if (authData.meta?.avatarURL && !authData.record.avatar) {
          const imgRes = await fetch(authData.meta.avatarURL)
          if (imgRes.ok) {
            const blob = await imgRes.blob()
            const ext = blob.type.split("/")[1] || "png"
            updates.avatar = new File([blob], `avatar.${ext}`, { type: blob.type })
          }
        }
        if (Object.keys(updates).length > 0) {
          await pb.collection("users").update(authData.record.id, updates)
        }
      } catch {
        // Non-critical
      }
      // Refresh linked providers
      const auths = await pb.collection("users").listExternalAuths(userId)
      setLinked(auths as unknown as ExternalAuth[])
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (!message.includes("cancel") && !message.includes("closed")) {
        setError(`Failed to connect ${PROVIDER_LABELS[providerName] || providerName}.`)
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDisconnect(providerName: string) {
    setError("")
    setActionLoading(providerName)
    try {
      const pb = getPocketBase()
      await pb.collection("users").unlinkExternalAuth(userId, providerName)
      setLinked((prev) => prev.filter((a) => a.provider !== providerName))
    } catch {
      setError(`Failed to disconnect ${PROVIDER_LABELS[providerName] || providerName}.`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading providers…</p>
  }

  // Can disconnect only if user has more than one auth method
  const canDisconnect = linked.length > 1 || hasPassword

  const linkedNames = new Set(linked.map((a) => a.provider))
  const unlinked = available.filter((p) => !linkedNames.has(p.name))

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {linked.length === 0 && unlinked.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No OAuth providers are configured.
        </p>
      )}

      {linked.map((auth) => (
        <div
          key={auth.provider}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="flex items-center gap-3">
            <span className="font-medium">
              {PROVIDER_LABELS[auth.provider] || auth.provider}
            </span>
            <Badge variant="secondary">Connected</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!canDisconnect || actionLoading !== null}
            onClick={() => handleDisconnect(auth.provider)}
          >
            {actionLoading === auth.provider ? "Disconnecting…" : "Disconnect"}
          </Button>
        </div>
      ))}

      {unlinked.map((provider) => (
        <div
          key={provider.name}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <span className="font-medium">
            {PROVIDER_LABELS[provider.name] || provider.displayName}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={actionLoading !== null}
            onClick={() => handleConnect(provider.name)}
          >
            {actionLoading === provider.name ? "Connecting…" : "Connect"}
          </Button>
        </div>
      ))}
    </div>
  )
}
