"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import CodeBlock from "@/components/docs/code-block"
import { slugify } from "@/lib/markdown-utils"
import type { Components } from "react-markdown"

interface MarkdownRendererProps {
  content: string
}

const stepPattern = /^(\d+)\.\s+(.+)$/

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    h2: ({ children }) => {
      const text = extractText(children)
      const id = slugify(text)
      return (
        <h2
          id={id}
          className="mb-4 mt-16 scroll-mt-20 text-2xl font-semibold tracking-tight first:mt-0"
        >
          {children}
        </h2>
      )
    },
    h3: ({ children }) => {
      const text = extractText(children)
      const match = stepPattern.exec(text)
      if (match) {
        return (
          <div className="mb-3 mt-10 flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {match[1]}
            </span>
            <h3 className="text-lg font-semibold">{match[2]}</h3>
          </div>
        )
      }
      return <h3 className="mb-3 mt-8 text-lg font-semibold">{children}</h3>
    },
    p: ({ children, node }) => {
      // Check if this paragraph contains only an image
      const hasOnlyImage =
        node?.children?.length === 1 &&
        node.children[0].type === "element" &&
        node.children[0].tagName === "img"
      if (hasOnlyImage) {
        return <>{children}</>
      }
      return <p className="mb-4 text-muted-foreground">{children}</p>
    },
    img: ({ src, alt }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || ""}
        className="mb-6 w-full rounded-lg border"
      />
    ),
    pre: ({ children }) => <>{children}</>,
    code: ({ children, className }) => {
      const match = /language-(\w+)/.exec(className || "")
      if (match) {
        const code = extractText(children).replace(/\n$/, "")
        return <CodeBlock code={code} language={match[1]} />
      }
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
          {children}
        </code>
      )
    },
    blockquote: ({ children }) => (
      <div className="my-6 rounded-lg border-l-4 border-primary bg-muted/30 p-4 [&>p]:mb-0 [&>p]:text-sm">
        {children}
      </div>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-6 list-decimal space-y-2 pl-6 text-muted-foreground">
        {children}
      </ol>
    ),
    li: ({ children }) => <li>{children}</li>,
    strong: ({ children }) => (
      <strong className="text-foreground">{children}</strong>
    ),
    hr: () => <hr className="my-16" />,
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-primary underline hover:text-primary/80"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
  }

  return (
    <div className="doc-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(extractText).join("")
  if (node && typeof node === "object" && "props" in node) {
    const el = node as { props: { children?: React.ReactNode } }
    return extractText(el.props.children)
  }
  return ""
}
