import type { TocItem } from "@/components/docs/table-of-contents"

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function extractToc(content: string): TocItem[] {
  const items: TocItem[] = []
  const regex = /^## (.+)$/gm
  let match
  while ((match = regex.exec(content)) !== null) {
    const label = match[1].trim()
    items.push({ id: slugify(label), label })
  }
  return items
}
