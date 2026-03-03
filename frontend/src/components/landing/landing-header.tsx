import Link from "next/link"
import Logo from "@/components/logo"
import LanguageSwitcher from "@/components/landing/language-switcher"
import { Button } from "@/components/ui/button"

interface LandingHeaderProps {
  locale: string
  servicesLabel: string
  contactLabel: string
  loginLabel: string
}

export default function LandingHeader({
  locale,
  servicesLabel,
  contactLabel,
  loginLabel,
}: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Logo href={`/${locale}`} />

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a
            href="#services"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {servicesLabel}
          </a>
          <a
            href="#contact"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {contactLabel}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <Button asChild variant="outline" size="sm">
            <Link href="/login">{loginLabel}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
