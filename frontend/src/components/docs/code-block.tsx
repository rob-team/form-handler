"use client"

import { useState, useCallback } from "react"
import { Check, Copy } from "lucide-react"
import { Highlight, themes } from "prism-react-renderer"

interface CodeBlockProps {
  code: string
  language?: string
}

export default function CodeBlock({ code, language = "" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // noop
    }
  }, [code])

  return (
    <div className="group relative overflow-hidden rounded-lg">
      {language && (
        <div className="flex items-center justify-between bg-[#1e1e2e] px-4 py-2 text-xs text-gray-400">
          <span>{language}</span>
        </div>
      )}
      <div className="relative">
        <Highlight theme={themes.vsDark} code={code} language={language || "text"}>
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className="overflow-x-auto p-4 text-sm leading-relaxed"
              style={{ ...style, margin: 0, borderRadius: language ? 0 : undefined }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 rounded-md bg-white/10 p-1.5 text-gray-400 opacity-0 transition-opacity hover:bg-white/20 hover:text-gray-200 group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}
