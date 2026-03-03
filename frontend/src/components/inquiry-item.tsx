"use client"

import { useState } from "react"
import { getPocketBase } from "@/lib/pocketbase-browser"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { countryCodeToFlag } from "@/lib/utils"

interface Response {
  question_id: string
  question_label: string
  answer: string
}

interface InquiryRecord {
  id: string
  responses: string | Response[]
  page_url: string
  visitor_ip: string
  country: string
  created: string
}

interface Props {
  inquiry: InquiryRecord
  onDeleted: () => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function InquiryItem({ inquiry, onDeleted }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const responses: Response[] =
    typeof inquiry.responses === "string"
      ? JSON.parse(inquiry.responses)
      : inquiry.responses

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await getPocketBase().collection("inquiries").delete(inquiry.id)
      setDeleteOpen(false)
      onDeleted()
    } catch {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <Card
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardDescription className="text-xs">
              {formatDate(inquiry.created)}
              {inquiry.country && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {countryCodeToFlag(inquiry.country)} {inquiry.country}
                </Badge>
              )}
            </CardDescription>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive text-xs"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteOpen(true)
              }}
            >
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Show first 2 responses as preview */}
          <dl className="space-y-1">
            {responses.slice(0, expanded ? responses.length : 2).map((r, idx) => (
              <div key={idx} className="flex gap-2 text-sm">
                <dt className="text-muted-foreground shrink-0">
                  {r.question_label}:
                </dt>
                <dd className="font-medium break-all">{r.answer}</dd>
              </div>
            ))}
          </dl>
          {!expanded && responses.length > 2 && (
            <p className="text-xs text-muted-foreground mt-2">
              +{responses.length - 2} more &middot; Click to expand
            </p>
          )}
          {expanded && (
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
              {inquiry.page_url && <p>Page: {inquiry.page_url}</p>}
              {inquiry.visitor_ip && <p>IP: {inquiry.visitor_ip}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this inquiry?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
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
              {deleteLoading ? "Deleting\u2026" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
