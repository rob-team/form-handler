import { Shield } from "lucide-react"

interface TechSecurityProps {
  title: string
  items: string[]
  compatibility: string
}

export default function TechSecurity({ title, items, compatibility }: TechSecurityProps) {
  return (
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <h2 className="text-2xl font-bold text-center md:text-3xl">
          {title}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Shield className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-center text-sm text-muted-foreground">
          {compatibility}
        </p>
      </div>
    </section>
  )
}
