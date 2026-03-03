import Link from "next/link"
import TableOfContents from "@/components/docs/table-of-contents"
import MarkdownRenderer from "@/components/docs/markdown-renderer"
import type { DocData } from "@/lib/markdown"

interface DocPageProps {
  locale: string
  doc: DocData
  tocTitle: string
  backLabel: string
}

export default function DocPage({
  locale,
  doc,
  tocTitle,
  backLabel,
}: DocPageProps) {
  return (
    <div className="lg:flex lg:gap-10">
      <article className="min-w-0 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {doc.title.replace(/ — FormHandler$/, "")}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{doc.subtitle}</p>
        </div>

        <div className="mb-10 lg:hidden">
          <TableOfContents items={doc.toc} title={tocTitle} />
        </div>

        <MarkdownRenderer content={doc.content} />

        <div className="border-t pt-6">
          <Link
            href={`/${locale}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {backLabel}
          </Link>
        </div>
      </article>

      <aside className="hidden shrink-0 lg:block">
        <div className="sticky top-20 w-56 xl:w-64">
          <TableOfContents
            items={doc.toc}
            title={tocTitle}
            variant="sidebar"
          />
        </div>
      </aside>
    </div>
  )
}
