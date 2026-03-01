"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getPocketBase } from "@/lib/pocketbase-browser"
import SubmissionItem from "@/components/submission-item"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090"
const PAGE_SIZE = 20

interface FormRecord {
  id: string
  name: string
}

interface Submission {
  id: string
  data: Record<string, unknown>
  created: string
}

export default function FormDetailPage() {
  const { formId } = useParams<{ formId: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10)

  const [form, setForm] = useState<FormRecord | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const endpointUrl = `${PB_URL}/api/submit/${formId}`

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const pb = getPocketBase()
      const [f, subs] = await Promise.all([
        pb.collection("forms").getOne<FormRecord>(formId),
        pb.collection("submissions").getList<Submission>(currentPage, PAGE_SIZE, {
          filter: `form="${formId}"`,
          sort: "-created",
        }),
      ])
      setForm(f)
      setSubmissions(subs.items)
      setTotalPages(subs.totalPages)
      setTotalItems(subs.totalItems)
    } catch {
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }, [formId, currentPage, router])

  useEffect(() => {
    load()
  }, [load])

  async function copyEndpoint() {
    await navigator.clipboard.writeText(endpointUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-28 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-semibold mt-1">{form?.name}</h1>
        </div>
        <Link
          href={`/forms/${formId}/settings`}
          className="text-sm underline text-muted-foreground"
        >
          Settings
        </Link>
      </div>

      {/* Endpoint URL */}
      <div className="flex gap-2 items-center">
        <Input
          readOnly
          value={endpointUrl}
          className="text-xs font-mono"
          aria-label="Submission endpoint URL"
        />
        <Button size="sm" variant="outline" onClick={copyEndpoint}>
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      {/* Submissions */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-medium">Submissions</h2>
        <Badge variant="secondary">{totalItems}</Badge>
      </div>

      {submissions.length === 0 ? (
        <Card className="text-center py-10">
          <CardHeader>
            <CardTitle className="text-muted-foreground">No submissions yet</CardTitle>
            <CardDescription>
              Point an HTML form&apos;s <code>action</code> attribute to the endpoint
              URL above to start receiving submissions.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((s, idx) => (
            <SubmissionItem
              key={s.id}
              submission={s}
              index={totalItems - (currentPage - 1) * PAGE_SIZE - idx}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() =>
              router.push(`/forms/${formId}?page=${currentPage - 1}`)
            }
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground self-center">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() =>
              router.push(`/forms/${formId}?page=${currentPage + 1}`)
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
