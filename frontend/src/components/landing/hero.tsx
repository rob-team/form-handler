import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HeroProps {
  headline: string
  subheadline: string
  cta: string
}

export default function Hero({ headline, subheadline, cta }: HeroProps) {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground md:text-xl">
            {subheadline}
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="text-base px-8 h-12">
              <Link href="/login">{cta}</Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
          <Image
            src="/hero.jpg"
            alt="FormHandler services — Contact form and Live Chat widget"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  )
}
