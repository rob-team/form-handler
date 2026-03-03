import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HeroProps {
  headline: string
  subheadline: string
  cta: string
}

export default function Hero({ headline, subheadline, cta }: HeroProps) {
  return (
    <section className="px-4 py-20 md:py-32 text-center">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          {headline}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
          {subheadline}
        </p>
        <div className="pt-4">
          <Button asChild size="lg" className="text-base px-8 h-12">
            <Link href="/login">{cta}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
