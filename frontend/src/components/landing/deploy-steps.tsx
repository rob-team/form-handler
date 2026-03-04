interface DeployStepsProps {
  sectionTitle: string
  title: string
  items: string[]
  conclusion: string
}

export default function DeploySteps({ sectionTitle, title, items, conclusion }: DeployStepsProps) {
  return (
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">
            {sectionTitle}
          </p>
          <h2 className="text-2xl font-bold md:text-3xl">
            {title}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background text-lg font-bold">
                {i + 1}
              </div>
              <p className="font-medium">{item}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-muted-foreground">
          {conclusion}
        </p>
      </div>
    </section>
  )
}
