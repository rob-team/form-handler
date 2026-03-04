import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HeroProps {
  headline: string
  subheadline: string
  tagline: string
  cta: string
}

export default function Hero({ headline, subheadline, tagline, cta }: HeroProps) {
  return (
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground md:text-xl whitespace-pre-line">
            {subheadline}
          </p>
          <p className="text-sm text-muted-foreground">
            {tagline}
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="text-base px-8 h-12">
              <Link href="/login">{cta}</Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Image
            src="/hero.jpg"
            alt="FormHandler — Structured inquiry system for B2B export websites"
            width={800}
            height={600}
            className="w-auto max-h-[400px] rounded-xl shadow-lg"
            priority
          />
        </div>
      </div>
    </section>
  )
}
