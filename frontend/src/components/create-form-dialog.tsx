"use client"

import { useState } from "react"
import { getPocketBase } from "@/lib/pocketbase-browser"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Props {
  onCreated: () => void
}

export default function CreateFormDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = (
      e.currentTarget.elements.namedItem("name") as HTMLInputElement
    ).value.trim()

    if (!name) return

    setLoading(true)
    setError("")

    try {
      const pb = getPocketBase()
      await pb.collection("forms").create(
        { name, user: pb.authStore.record?.id },
        { requestKey: null },
      )
      setOpen(false)
      onCreated()
    } catch {
      setError("Failed to create form. Please try again.")
      setLoading(false)
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setError("")
      setLoading(false)
    }
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>New Form</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create a new form</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1">
            <Label htmlFor="name">Form name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Contact form"
              maxLength={100}
              required
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
