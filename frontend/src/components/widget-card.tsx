"use client"

import { useState } from "react"
import Link from "next/link"
import { getPocketBase } from "@/lib/pocketbase-browser"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface WidgetRecord {
  id: string
  name: string
  active: boolean
  created: string
}

interface Props {
  widget: WidgetRecord
  inquiryCount: number
  onUpdated: () => void
  onDeleted: () => void
}

export default function WidgetCard({
  widget,
  inquiryCount,
  onUpdated,
  onDeleted,
}: Props) {
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameLoading, setRenameLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [renameError, setRenameError] = useState("")

  async function handleRename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = (
      e.currentTarget.elements.namedItem("name") as HTMLInputElement
    ).value.trim()
    if (!name) return

    setRenameLoading(true)
    setRenameError("")
    try {
      await getPocketBase().collection("widgets").update(widget.id, { name })
      setRenameOpen(false)
      onUpdated()
    } catch {
      setRenameError("Failed to rename. Please try again.")
      setRenameLoading(false)
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await getPocketBase().collection("widgets").delete(widget.id)
      setDeleteOpen(false)
      onDeleted()
    } catch {
      setDeleteLoading(false)
    }
  }

  const createdDate = new Date(widget.created).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">
                <Link
                  href={`/widgets/${widget.id}`}
                  className="hover:underline"
                >
                  {widget.name}
                </Link>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Created {createdDate}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant={widget.active ? "secondary" : "outline"}
              >
                {widget.active ? "Active" : "Inactive"}
              </Badge>
              <Link href={`/widgets/${widget.id}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                >
                  {inquiryCount} inquiries
                </Badge>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="More options"
                  >
                    &#x22EF;
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/widgets/${widget.id}/settings`}>
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setDeleteOpen(true)}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Embed this widget on your website to collect inquiries.
          </p>
        </CardContent>
      </Card>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename widget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4">
            {renameError && (
              <Alert variant="destructive">
                <AlertDescription>{renameError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label htmlFor="rename-name">New name</Label>
              <Input
                id="rename-name"
                name="name"
                defaultValue={widget.name}
                maxLength={100}
                required
                autoFocus
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setRenameOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={renameLoading}
              >
                {renameLoading ? "Saving\u2026" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete &ldquo;{widget.name}&rdquo;?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete the widget and all its inquiries and
            visitor data. This action cannot be undone.
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting\u2026" : "Confirm delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
