"use client"

import { useEffect, useState, useCallback } from "react"
import { getPocketBase } from "@/lib/pocketbase-browser"
import CreateFormDialog from "@/components/create-form-dialog"
import FormCard from "@/components/form-card"
import WidgetCard from "@/components/widget-card"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

interface FormRecord {
  id: string
  name: string
  created: string
}

interface WidgetRecord {
  id: string
  name: string
  active: boolean
  created: string
}

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090"

const DEFAULT_QUESTIONS = [
  { id: "q1", label: "Which country are you from?", type: "text", required: true, options: null },
  { id: "q2", label: "Company Name", type: "text", required: true, options: null },
  { id: "q3", label: "Purchase Quantity", type: "single-select", required: true, options: ["< 100 pcs", "100-500 pcs", "500-1000 pcs", "1000+ pcs"] },
  { id: "q4", label: "Expected Order Timeline", type: "single-select", required: true, options: ["Within 1 month", "1-3 months", "3-6 months", "6+ months"] },
  { id: "q5", label: "Business Email", type: "email", required: true, options: null },
  { id: "q6", label: "Please describe your requirements", type: "text", required: false, options: null },
]

export default function DashboardPage() {
  const [forms, setForms] = useState<FormRecord[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [widgets, setWidgets] = useState<WidgetRecord[]>([])
  const [widgetCounts, setWidgetCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [creatingWidget, setCreatingWidget] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const pb = getPocketBase()
      const [formResult, widgetResult] = await Promise.all([
        pb.collection("forms").getFullList<FormRecord>({
          sort: "-created",
          requestKey: null,
        }),
        pb.collection("widgets").getFullList<WidgetRecord>({
          sort: "-created",
          requestKey: null,
        }),
      ])
      setForms(formResult)
      setWidgets(widgetResult)

      // Fetch counts in parallel
      const formCountMap: Record<string, number> = {}
      const widgetCountMap: Record<string, number> = {}
      await Promise.all([
        ...formResult.map(async (f) => {
          const c = await pb.collection("submissions").getList(1, 1, {
            filter: `form="${f.id}"`,
            requestKey: null,
          })
          formCountMap[f.id] = c.totalItems
        }),
        ...widgetResult.map(async (w) => {
          const c = await pb.collection("inquiries").getList(1, 1, {
            filter: `widget="${w.id}"`,
            requestKey: null,
          })
          widgetCountMap[w.id] = c.totalItems
        }),
      ])
      setCounts(formCountMap)
      setWidgetCounts(widgetCountMap)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function createWidget() {
    setCreatingWidget(true)
    try {
      const pb = getPocketBase()
      await pb.collection("widgets").create(
        {
          name: "My Widget",
          user: pb.authStore.record?.id,
          questions: DEFAULT_QUESTIONS,
          active: true,
        },
        { requestKey: null }
      )
      loadData()
    } finally {
      setCreatingWidget(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Widgets section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Widgets</h1>
        <Button onClick={createWidget} disabled={creatingWidget}>
          {creatingWidget ? "Creating\u2026" : "New Widget"}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <Skeleton key={n} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : widgets.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-muted-foreground">
              No widgets yet
            </CardTitle>
            <CardDescription>
              Create a widget to start collecting inquiries from your website.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {widgets.map((w) => (
            <WidgetCard
              key={w.id}
              widget={w}
              inquiryCount={widgetCounts[w.id] ?? 0}
              onUpdated={loadData}
              onDeleted={loadData}
            />
          ))}
        </div>
      )}

      <Separator />

      {/* Forms section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Forms</h1>
        <CreateFormDialog onCreated={loadData} />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-muted-foreground">No forms yet</CardTitle>
            <CardDescription>
              You haven&apos;t created any forms yet. Click &ldquo;New Form&rdquo; to
              get started.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {forms.map((f) => (
            <FormCard
              key={f.id}
              form={f}
              submissionCount={counts[f.id] ?? 0}
              pbUrl={PB_URL}
              onUpdated={loadData}
              onDeleted={loadData}
            />
          ))}
        </div>
      )}
    </div>
  )
}
