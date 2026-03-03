"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface TocItem {
  id: string
  label: string
}

interface TableOfContentsProps {
  items: TocItem[]
  title: string
  variant?: "inline" | "sidebar"
}

export default function TableOfContents({
  items,
  title,
  variant = "inline",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items])

  if (variant === "sidebar") {
    return (
      <nav>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <ul className="space-y-1 border-l">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "-ml-px block border-l-2 py-1 pl-4 text-sm transition-colors",
                  activeId === item.id
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <nav className="rounded-lg border bg-muted/30 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "text-sm transition-colors",
                activeId === item.id
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
