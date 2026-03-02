"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getPocketBase } from "@/lib/pocketbase-browser"
import InquiryItem from "@/components/inquiry-item"
import VisitorActivity from "@/components/visitor-activity"
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

const PAGE_SIZE = 20

interface WidgetRecord {
  id: string
  name: string
  active: boolean
}

interface InquiryRecord {
  id: string
  responses: string | Array<{ question_id: string; question_label: string; answer: string }>
  page_url: string
  visitor_ip: string
  country: string
  created: string
}

export default function WidgetDetailPage() {
  const { widgetId } = useParams<{ widgetId: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10)

  const [activeTab, setActiveTab] = useState<"inquiries" | "visitors">("inquiries")
  const [widget, setWidget] = useState<WidgetRecord | null>(null)
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [countryFilter, setCountryFilter] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const pb = getPocketBase()
      const filters = [`widget="${widgetId}"`]
      if (countryFilter.trim()) {
        filters.push(`country="${countryFilter.trim().toUpperCase()}"`)
      }

      const [w, inqs] = await Promise.all([
        pb
          .collection("widgets")
          .getOne<WidgetRecord>(widgetId, { requestKey: null }),
        pb
          .collection("inquiries")
          .getList<InquiryRecord>(currentPage, PAGE_SIZE, {
            filter: filters.join(" && "),
            sort: "-created",
            requestKey: null,
          }),
      ])
      setWidget(w)
      setInquiries(inqs.items)
      setTotalPages(inqs.totalPages)
      setTotalItems(inqs.totalItems)
    } catch {
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }, [widgetId, currentPage, countryFilter, router])

  useEffect(() => {
    load()
  }, [load])

  if (loading && !widget) {
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
            &larr; Dashboard
          </Link>
          <h1 className="text-2xl font-semibold mt-1">{widget?.name}</h1>
        </div>
        <Link
          href={`/widgets/${widgetId}/settings`}
          className="text-sm underline text-muted-foreground"
        >
          Settings
        </Link>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "inquiries"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("inquiries")}
        >
          Inquiries
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "visitors"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("visitors")}
        >
          Visitor Activity
        </button>
      </div>

      {activeTab === "visitors" ? (
        <VisitorActivity widgetId={widgetId} />
      ) : (
        <>
      {/* Inquiries header + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-medium">Inquiries</h2>
        <Badge variant="secondary">{totalItems}</Badge>
        <div className="ml-auto flex gap-2">
          <Input
            placeholder="Filter by country (e.g. DE)"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-48 h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") load()
            }}
          />
          <Button variant="outline" size="sm" onClick={load}>
            Filter
          </Button>
          {countryFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCountryFilter("")
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {inquiries.length === 0 ? (
        <Card className="text-center py-10">
          <CardHeader>
            <CardTitle className="text-muted-foreground">
              {countryFilter ? "No matching inquiries" : "No inquiries yet"}
            </CardTitle>
            <CardDescription>
              {countryFilter
                ? "Try a different filter or clear the filter to see all inquiries."
                : "Once visitors submit inquiries through your widget, they will appear here."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <InquiryItem key={inq.id} inquiry={inq} onDeleted={load} />
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
              router.push(
                `/widgets/${widgetId}?page=${currentPage - 1}${
                  countryFilter ? `&country=${countryFilter}` : ""
                }`
              )
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
              router.push(
                `/widgets/${widgetId}?page=${currentPage + 1}${
                  countryFilter ? `&country=${countryFilter}` : ""
                }`
              )
            }
          >
            Next
          </Button>
        </div>
      )}
        </>
      )}
    </div>
  )
}
