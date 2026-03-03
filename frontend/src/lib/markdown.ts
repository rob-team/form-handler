import fs from "fs"
import path from "path"
import matter from "gray-matter"
import type { TocItem } from "@/components/docs/table-of-contents"
import { extractToc } from "@/lib/markdown-utils"

export interface DocData {
  title: string
  description: string
  subtitle: string
  content: string
  toc: TocItem[]
}

export function loadDoc(locale: string, slug: string): DocData {
  const filePath = path.join(
    process.cwd(),
    "src",
    "content",
    "docs",
    locale,
    `${slug}.md`
  )
  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return {
    title: data.title ?? "",
    description: data.description ?? "",
    subtitle: data.subtitle ?? "",
    content,
    toc: extractToc(content),
  }
}
