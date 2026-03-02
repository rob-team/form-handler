import { Skeleton } from "@/components/ui/skeleton"

export default function WidgetDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-full" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <Skeleton key={n} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
