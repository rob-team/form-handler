"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getPocketBase } from "@/lib/pocketbase-browser"
import QuestionEditor, {
  type Question,
} from "@/components/question-editor"
import EmbedCodeSnippet from "@/components/embed-code-snippet"
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
import { Skeleton } from "@/components/ui/skeleton"

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090"

type SaveState = "idle" | "loading" | "success" | "error"

export default function WidgetSettingsPage() {
  const { widgetId } = useParams<{ widgetId: string }>()
  const [widgetName, setWidgetName] = useState("")
  const [buttonText, setButtonText] = useState("")
  const [greeting, setGreeting] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [active, setActive] = useState(true)
  const [telegramChatId, setTelegramChatId] = useState("")
  const [telegramTestState, setTelegramTestState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [telegramTestMsg, setTelegramTestMsg] = useState("")
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    getPocketBase()
      .collection("widgets")
      .getOne(widgetId, { requestKey: null })
      .then((w) => {
        setWidgetName((w.name as string) ?? "")
        setButtonText((w.button_text as string) ?? "")
        setGreeting((w.greeting as string) ?? "")
        setActive(w.active as boolean)
        setTelegramChatId((w.telegram_chat_id as string) ?? "")
        const q =
          typeof w.questions === "string"
            ? JSON.parse(w.questions as string)
            : w.questions
        setQuestions(q ?? [])
        setLoading(false)
      })
      .catch(() => setLoadError(true))
  }, [widgetId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveState("loading")
    setErrorMsg("")
    try {
      await getPocketBase()
        .collection("widgets")
        .update(widgetId, {
          name: widgetName.trim(),
          button_text: buttonText.trim(),
          greeting: greeting.trim(),
          questions,
          active,
          telegram_chat_id: telegramChatId.trim(),
        })
      setSaveState("success")
    } catch {
      setErrorMsg("Failed to save. Please try again.")
      setSaveState("error")
    }
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Dashboard
        </Link>
        <Alert variant="destructive">
          <AlertDescription>
            Widget not found or access denied.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href={`/widgets/${widgetId}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; {widgetName || "Widget"}
        </Link>
        <h1 className="text-2xl font-semibold mt-1">Widget Settings</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {saveState === "success" && (
          <Alert>
            <AlertDescription>Settings saved.</AlertDescription>
          </Alert>
        )}
        {saveState === "error" && (
          <Alert variant="destructive">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* Basic settings */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="widgetName">Widget name</Label>
              <Input
                id="widgetName"
                value={widgetName}
                onChange={(e) => {
                  setWidgetName(e.target.value)
                  if (saveState !== "idle") setSaveState("idle")
                }}
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="buttonText">Button text</Label>
              <Input
                id="buttonText"
                value={buttonText}
                onChange={(e) => {
                  setButtonText(e.target.value)
                  if (saveState !== "idle") setSaveState("idle")
                }}
                placeholder="Send Inquiry"
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                Text shown on the floating button. Default: &quot;Send
                Inquiry&quot;
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="greeting">Greeting message</Label>
              <Input
                id="greeting"
                value={greeting}
                onChange={(e) => {
                  setGreeting(e.target.value)
                  if (saveState !== "idle") setSaveState("idle")
                }}
                placeholder="Hi! We'd love to help you."
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Welcome message shown when the widget opens.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => {
                  setActive(e.target.checked)
                  if (saveState !== "idle") setSaveState("idle")
                }}
              />
              Active (widget is live on your website)
            </label>
          </CardContent>
        </Card>

        {/* Questions editor */}
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>
              Configure the questions visitors will answer. Drag to reorder.
              At least one question is required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionEditor
              questions={questions}
              onChange={(q) => {
                setQuestions(q)
                if (saveState !== "idle") setSaveState("idle")
              }}
            />
          </CardContent>
        </Card>

        {/* Telegram notifications */}
        <TelegramSetupInstructions />
        <Card>
          <CardHeader>
            <CardTitle>Telegram Notifications</CardTitle>
            <CardDescription>
              Receive instant Telegram notifications when visitors submit
              inquiries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {telegramTestState === "success" && (
              <Alert>
                <AlertDescription>{telegramTestMsg}</AlertDescription>
              </Alert>
            )}
            {telegramTestState === "error" && (
              <Alert variant="destructive">
                <AlertDescription>{telegramTestMsg}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label htmlFor="telegramChatId">Telegram chat ID</Label>
              <Input
                id="telegramChatId"
                value={telegramChatId}
                onChange={(e) => {
                  setTelegramChatId(e.target.value)
                  if (saveState !== "idle") setSaveState("idle")
                  if (telegramTestState !== "idle")
                    setTelegramTestState("idle")
                }}
                placeholder="e.g. 123456789 or -100XXXXXXXXXX"
              />
            </div>
            {telegramChatId.trim() && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={telegramTestState === "loading"}
                onClick={async () => {
                  setTelegramTestState("loading")
                  setTelegramTestMsg("")
                  try {
                    const pb = getPocketBase()
                    // Save chat ID first so the test endpoint can use it
                    await pb
                      .collection("widgets")
                      .update(widgetId, {
                        telegram_chat_id: telegramChatId.trim(),
                      })
                    const res = await fetch(
                      `${PB_URL}/api/widget/${widgetId}/telegram-test`,
                      {
                        method: "POST",
                        headers: {
                          Authorization: pb.authStore.token,
                        },
                      }
                    )
                    const body = await res.json()
                    if (res.ok) {
                      setTelegramTestState("success")
                      setTelegramTestMsg("Test message sent successfully!")
                    } else {
                      setTelegramTestState("error")
                      setTelegramTestMsg(
                        body.message || "Failed to send test message."
                      )
                    }
                  } catch {
                    setTelegramTestState("error")
                    setTelegramTestMsg("Failed to send test message.")
                  }
                }}
              >
                {telegramTestState === "loading"
                  ? "Testing\u2026"
                  : "Test Connection"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={saveState === "loading"}>
          {saveState === "loading" ? "Saving\u2026" : "Save Settings"}
        </Button>
      </form>

      {/* Embed code */}
      <EmbedCodeSnippet widgetId={widgetId} />
    </div>
  )
}
