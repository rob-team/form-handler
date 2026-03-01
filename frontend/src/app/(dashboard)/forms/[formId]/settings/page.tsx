"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getPocketBase } from "@/lib/pocketbase-browser"
import TelegramSetupInstructions from "@/components/telegram-setup-instructions"
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

type SaveState = "idle" | "loading" | "success" | "error"

export default function FormSettingsPage() {
  const { formId } = useParams<{ formId: string }>()
  const [chatId, setChatId] = useState("")
  const [formName, setFormName] = useState("")
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    getPocketBase()
      .collection("forms")
      .getOne(formId, { requestKey: null })
      .then((f) => {
        setFormName(f.name as string)
        setChatId((f.telegram_chat_id as string) ?? "")
      })
      .catch(() => setLoadError(true))
  }, [formId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveState("loading")
    setErrorMsg("")
    try {
      await getPocketBase()
        .collection("forms")
        .update(formId, { telegram_chat_id: chatId.trim() })
      setSaveState("success")
    } catch {
      setErrorMsg("Failed to save. Please try again.")
      setSaveState("error")
    }
  }

  async function handleRemove() {
    setSaveState("loading")
    try {
      await getPocketBase()
        .collection("forms")
        .update(formId, { telegram_chat_id: "" })
      setChatId("")
      setSaveState("success")
    } catch {
      setErrorMsg("Failed to remove. Please try again.")
      setSaveState("error")
    }
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← Dashboard
        </Link>
        <Alert variant="destructive">
          <AlertDescription>Form not found or access denied.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <Link
          href={`/forms/${formId}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← {formName || "Form"}
        </Link>
        <h1 className="text-2xl font-semibold mt-1">Settings</h1>
      </div>

      <TelegramSetupInstructions />

      <Card>
        <CardHeader>
          <CardTitle>Telegram notifications</CardTitle>
          <CardDescription>
            Enter your Telegram chat ID to receive a message whenever this form
            receives a new submission.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            {saveState === "success" && (
              <Alert>
                <AlertDescription>
                  {chatId ? "Notifications enabled." : "Notifications disabled."}
                </AlertDescription>
              </Alert>
            )}
            {saveState === "error" && (
              <Alert variant="destructive">
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label htmlFor="chatId">Telegram chat ID</Label>
              <Input
                id="chatId"
                name="chatId"
                placeholder="e.g. 123456789 or -100XXXXXXXXXX"
                value={chatId}
                onChange={(e) => {
                  setChatId(e.target.value)
                  if (saveState !== "idle") setSaveState("idle")
                }}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-4">
            <Button type="submit" disabled={saveState === "loading"}>
              {saveState === "loading" ? "Saving…" : "Save"}
            </Button>
            {chatId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemove}
                disabled={saveState === "loading"}
              >
                Remove
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
