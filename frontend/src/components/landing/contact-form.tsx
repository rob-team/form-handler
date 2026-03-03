"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ContactFormProps {
  namePlaceholder: string
  emailPlaceholder: string
  messagePlaceholder: string
  submitLabel: string
  successMessage: string
  errorMessage: string
}

export default function ContactForm({
  namePlaceholder,
  emailPlaceholder,
  messagePlaceholder,
  submitLabel,
  successMessage,
  errorMessage,
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("loading")

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    }

    const formId = process.env.NEXT_PUBLIC_LANDING_FORM_ID
    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL

    if (!formId || !pbUrl) {
      setStatus("error")
      return
    }

    try {
      const res = await fetch(`${pbUrl}/api/submit/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        redirect: "manual",
      })

      // The endpoint returns 302 on success (opaqueredirect when redirect: 'manual')
      if (res.type === "opaqueredirect" || res.status === 302 || res.ok) {
        setStatus("success")
        form.reset()
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <Input
        name="name"
        type="text"
        placeholder={namePlaceholder}
        required
        disabled={status === "loading"}
      />
      <Input
        name="email"
        type="email"
        placeholder={emailPlaceholder}
        required
        disabled={status === "loading"}
      />
      <textarea
        name="message"
        placeholder={messagePlaceholder}
        required
        rows={4}
        disabled={status === "loading"}
        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none disabled:pointer-events-none disabled:opacity-50 md:text-sm"
      />
      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
            </svg>
            {submitLabel}
          </span>
        ) : (
          submitLabel
        )}
      </Button>

      {status === "success" && (
        <p className="text-center text-sm text-green-600 dark:text-green-400">
          {successMessage}
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </form>
  )
}
