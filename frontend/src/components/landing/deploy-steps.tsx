interface DeployStepsProps {
  sectionTitle: string
  title: string
  items: string[]
  conclusion: string
}

export default function DeploySteps({ sectionTitle, title, items, conclusion }: DeployStepsProps) {
  const stepEmojis = ["1️⃣", "2️⃣", "3️⃣"]

  return (
    <section className="px-4 py-16 md:py-24">
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
              <div className="text-3xl">{stepEmojis[i]}</div>
              <p className="font-medium">{item}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-muted-foreground pt-4">
          {conclusion}
        </p>
      </div>
    </section>
  )
}
