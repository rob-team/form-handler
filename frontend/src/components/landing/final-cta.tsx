import Link from "next/link"
import { Button } from "@/components/ui/button"

interface FinalCtaProps {
  title: string
  subtitle: string
  cta: string
}

export default function FinalCta({ title, subtitle, cta }: FinalCtaProps) {
  return (
    <section className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center space-y-6">
        <h2 className="text-2xl font-bold md:text-3xl">
          {title}
        </h2>
        <p className="text-muted-foreground">
          {subtitle}
        </p>
        <div className="pt-2">
          <Button asChild size="lg" className="text-base px-8 h-12">
            <Link href="/login">{cta}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
