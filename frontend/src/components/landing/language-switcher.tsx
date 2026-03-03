import Link from "next/link"
import { cn } from "@/lib/utils"

interface LanguageSwitcherProps {
  locale: string
}

export default function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <Link
        href="/en"
        className={cn(
          "px-2 py-1 rounded-md transition-colors",
          locale === "en"
            ? "font-semibold text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </Link>
      <span className="text-muted-foreground/50">|</span>
      <Link
        href="/zh"
        className={cn(
          "px-2 py-1 rounded-md transition-colors",
          locale === "zh"
            ? "font-semibold text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        中文
      </Link>
    </div>
  )
}
