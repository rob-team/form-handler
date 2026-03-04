interface PainPointsProps {
  title: string
  intro: string
  items: string[]
  conclusion: string
}

export default function PainPoints({ title, intro, items, conclusion }: PainPointsProps) {
  return (
    <section className="px-4 py-12 md:py-16 bg-muted/30">
      <div className="mx-auto max-w-3xl space-y-8">
        <h2 className="text-2xl font-bold text-center md:text-3xl">
          {title}
        </h2>
        <p className="text-muted-foreground text-center">
          {intro}
        </p>
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-muted-foreground">
              <span className="shrink-0 text-destructive">&#x2716;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-center font-medium pt-4">
          {conclusion}
        </p>
      </div>
    </section>
  )
}
