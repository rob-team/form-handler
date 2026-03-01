import Link from "next/link"

interface LogoProps {
  size?: "sm" | "lg"
  href?: string
}

export default function Logo({ size = "sm", href = "/dashboard" }: LogoProps) {
  const isLarge = size === "lg"

  const content = (
    <span className={`inline-flex items-center gap-2 ${isLarge ? "gap-3" : ""}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={isLarge ? "w-9 h-9" : "w-6 h-6"}
      >
        <rect
          x="2"
          y="6"
          width="28"
          height="20"
          rx="3"
          className="stroke-foreground"
          strokeWidth="2"
        />
        <path
          d="M2 11L14.83 18.26a2 2 0 0 0 2.34 0L30 11"
          className="stroke-foreground"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`font-semibold tracking-tight ${isLarge ? "text-2xl" : "text-lg"}`}
      >
        Form<span className="text-muted-foreground font-normal">Handler</span>
      </span>
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
