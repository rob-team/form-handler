interface LandingFooterProps {
  copyright: string
}

export default function LandingFooter({ copyright }: LandingFooterProps) {
  return (
    <footer className="border-t py-8 text-center text-sm text-muted-foreground">
      <p>{copyright}</p>
    </footer>
  )
}
