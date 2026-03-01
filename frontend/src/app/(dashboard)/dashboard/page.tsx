"use client"

import { useEffect, useState, useCallback } from "react"
import { getPocketBase } from "@/lib/pocketbase-browser"
import CreateFormDialog from "@/components/create-form-dialog"
import FormCard from "@/components/form-card"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface FormRecord {
  id: string
  name: string
  created: string
}

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090"

export default function DashboardPage() {
  const [forms, setForms] = useState<FormRecord[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const loadForms = useCallback(async () => {
    setLoading(true)
    try {
      const pb = getPocketBase()
      const result = await pb.collection("forms").getFullList<FormRecord>({
        sort: "-created",
        requestKey: null, // disable auto-cancellation
      })
      setForms(result)

      // Fetch submission counts in parallel
      const countMap: Record<string, number> = {}
      await Promise.all(
        result.map(async (f) => {
          const c = await pb.collection("submissions").getList(1, 1, {
            filter: `form="${f.id}"`,
            requestKey: null,
          })
          countMap[f.id] = c.totalItems
        })
      )
      setCounts(countMap)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadForms()
  }, [loadForms])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Forms</h1>
        <CreateFormDialog onCreated={loadForms} />
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
              onUpdated={loadForms}
              onDeleted={loadForms}
            />
          ))}
        </div>
      )}
    </div>
  )
}
