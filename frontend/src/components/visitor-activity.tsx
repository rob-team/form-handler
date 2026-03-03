"use client"

import { useEffect, useState, useCallback } from "react"
import { getPocketBase } from "@/lib/pocketbase-browser"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { countryCodeToFlag } from "@/lib/utils"

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090"
const PAGE_SIZE = 20

interface StatsData {
  total_visits: number
  unique_visitors: number
  total_inquiries: number
  top_countries: Array<{ country: string; count: number }>
}

interface VisitorRecord {
  id: string
  page_url: string
  visitor_ip: string
  country: string
  created: string
}

interface Props {
  widgetId: string
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

export default function VisitorActivity({ widgetId }: Props) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [records, setRecords] = useState<VisitorRecord[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const pb = getPocketBase()

      // Fetch stats via custom endpoint
      const statsRes = await fetch(
        `${PB_URL}/api/widget/${widgetId}/stats`,
        { headers: { Authorization: pb.authStore.token } }
      )
      if (statsRes.ok) {
        setStats(await statsRes.json())
      }

      // Fetch visitor records
      const result = await pb
        .collection("visitor_records")
        .getList<VisitorRecord>(currentPage, PAGE_SIZE, {
          filter: `widget="${widgetId}"`,
          sort: "-created",
          requestKey: null,
        })
      setRecords(result.items)
      setTotalPages(result.totalPages)
    } catch {
      // Silently fail — stats section is non-critical
    } finally {
      setLoading(false)
    }
  }, [widgetId, currentPage])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Visits</CardDescription>
              <CardTitle className="text-2xl">{stats.total_visits}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unique Visitors</CardDescription>
              <CardTitle className="text-2xl">
                {stats.unique_visitors}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Inquiries</CardDescription>
              <CardTitle className="text-2xl">
                {stats.total_inquiries}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Top countries */}
      {stats && stats.top_countries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.top_countries.map((c) => (
                <Badge key={c.country} variant="secondary">
                  {countryCodeToFlag(c.country)} {c.country}: {c.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visit log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Visits</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No visitor records yet.
            </p>
          ) : (
            <div className="space-y-2">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 text-sm py-1 border-b last:border-0"
                >
                  <span className="text-muted-foreground text-xs shrink-0">
                    {formatDate(r.created)}
                  </span>
                  {r.country && (
                    <Badge variant="outline" className="text-xs">
                      {countryCodeToFlag(r.country)} {r.country}
                    </Badge>
                  )}
                  <span className="truncate text-xs">{r.page_url}</span>
                  <span className="text-muted-foreground text-xs ml-auto shrink-0">
                    {r.visitor_ip}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
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
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
