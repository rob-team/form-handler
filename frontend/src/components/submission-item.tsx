import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Submission {
  id: string
  data: Record<string, unknown>
  created: string
}

interface Props {
  submission: Submission
  index: number
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export default function SubmissionItem({ submission, index }: Props) {
  const entries = Object.entries(submission.data ?? {})

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            #{index}
          </Badge>
          <CardDescription className="text-xs">
            {formatDate(submission.created)}
          </CardDescription>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No fields submitted.</p>
        ) : (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {entries.map(([key, value]) => (
              <>
                <dt key={`dt-${key}`} className="font-medium text-muted-foreground truncate">
                  {key}
                </dt>
                <dd key={`dd-${key}`} className="break-words">{renderValue(value)}</dd>
              </>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}
