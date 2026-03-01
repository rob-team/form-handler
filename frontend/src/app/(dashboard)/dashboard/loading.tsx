import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((n) => (
          <Skeleton key={n} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
