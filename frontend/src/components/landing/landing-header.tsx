"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Menu, X } from "lucide-react"
import Logo from "@/components/logo"
import LanguageSwitcher from "@/components/landing/language-switcher"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

interface LandingHeaderProps {
  locale: string
  featuresLabel: string
  faqLabel: string
  loginLabel: string
  docsLabel?: string
  formEndpointsDocsLabel?: string
  inquiryWidgetDocsLabel?: string
}

export default function LandingHeader({
  locale,
  featuresLabel,
  faqLabel,
  loginLabel,
  docsLabel,
  formEndpointsDocsLabel,
  inquiryWidgetDocsLabel,
}: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Logo href={`/${locale}`} />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a
            href={`/${locale}#solution`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {featuresLabel}
          </a>
          <a
            href={`/${locale}#faq`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {faqLabel}
          </a>
          {docsLabel && formEndpointsDocsLabel && inquiryWidgetDocsLabel && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground outline-none">
                {docsLabel}
                <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/docs/form-endpoints`}>
                    {formEndpointsDocsLabel}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/docs/inquiry-widget`}>
                    {inquiryWidgetDocsLabel}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <a
            href="https://github.com/rob-team/form-handler"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">{loginLabel}</Link>
          </Button>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="ml-1 text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav className="border-t bg-background px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            <a
              href={`/${locale}#solution`}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {featuresLabel}
            </a>
            <a
              href={`/${locale}#faq`}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {faqLabel}
            </a>
            {docsLabel && formEndpointsDocsLabel && inquiryWidgetDocsLabel && (
              <>
                <div className="my-1 border-t" />
                <span className="px-3 pb-1 pt-2 text-sm font-semibold text-muted-foreground">
                  {docsLabel}
                </span>
                <Link
                  href={`/${locale}/docs/form-endpoints`}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2.5 pl-6 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {formEndpointsDocsLabel}
                </Link>
                <Link
                  href={`/${locale}/docs/inquiry-widget`}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2.5 pl-6 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {inquiryWidgetDocsLabel}
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
