import Link from "next/link"
import { type ReactNode } from "react"

interface ServiceCardProps {
  icon: ReactNode
  title: string
  description: string
  benefits: string[]
  ctaText: string
  ctaHref: string
}

export default function ServiceCard({
  icon,
  title,
  description,
  benefits,
  ctaText,
  ctaHref,
}: ServiceCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 md:p-8 space-y-4 flex flex-col">
      <div className="text-3xl">{icon}</div>
      <h3 className="text-xl font-semibold md:text-2xl">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      <ul className="space-y-2 flex-1">
        {benefits.map((benefit, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 shrink-0 text-primary mt-0.5"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <div className="pt-2">
        <Link
          href={ctaHref}
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          {ctaText}
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 ml-1"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </div>
  )
}
