interface UseCasesProps {
  title: string
  items: string[]
  bestForLabel: string
  bestForItems: string[]
}

export default function UseCases({ title, items, bestForLabel, bestForItems }: UseCasesProps) {
  return (
    <section className="px-4 py-12 md:py-16 bg-muted/30">
      <div className="mx-auto max-w-3xl space-y-8">
        <h2 className="text-2xl font-bold text-center md:text-3xl">
          {title}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((item, i) => (
            <span
              key={i}
              className="rounded-full border bg-background px-4 py-2 text-sm"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="text-center space-y-3 pt-4">
          <p className="font-medium">{bestForLabel}</p>
          <ul className="space-y-1.5 inline-block text-left">
            {bestForItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="shrink-0 text-primary mt-0.5">&#x2714;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
