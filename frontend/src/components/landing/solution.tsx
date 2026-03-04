import { Check } from "lucide-react"

interface SolutionFeature {
  title: string
  description: string
  items: string[]
  summary: string
}

interface SolutionProps {
  title: string
  subtitle: string
  features: SolutionFeature[]
}

export default function Solution({ title, subtitle, features }: SolutionProps) {
  return (
    <section id="solution" className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold md:text-3xl">
            {title}
          </h2>
          <p className="text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Check className="h-5 w-5 text-primary shrink-0" />
                {feature.title}
              </h3>
              {feature.description && (
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              )}
              {feature.items.length > 0 && (
                <ul className="space-y-1 pl-1">
                  {feature.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="shrink-0 mt-0.5">&#x2022;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm font-medium border-t pt-3">
                {feature.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
