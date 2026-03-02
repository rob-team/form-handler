"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const PB_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090"
const WIDGET_URL =
  process.env.NEXT_PUBLIC_WIDGET_URL ?? "http://localhost:8080"

interface Props {
  widgetId: string
}

export default function EmbedCodeSnippet({ widgetId }: Props) {
  const [copied, setCopied] = useState(false)

  const embedCode = `<script>
  (function(w, d, s) {
    w.FormHandler = w.FormHandler || {};
    w.FormHandler.widgetId = "${widgetId}";
    w.FormHandler.apiBase = "${PB_URL}";
    var f = d.createElement(s), t = d.getElementsByTagName(s)[0];
    f.async = true;
    f.src = "${WIDGET_URL}/widget.js";
    t.parentNode.insertBefore(f, t);
  })(window, document, "script");
</script>`

  async function copyCode() {
    await navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embed Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Copy and paste this code into your website&apos;s HTML, just before
          the closing <code>&lt;/body&gt;</code> tag.
        </p>
        <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
          {embedCode}
        </pre>
        <Button size="sm" variant="outline" onClick={copyCode}>
          {copied ? "Copied!" : "Copy Embed Code"}
        </Button>
      </CardContent>
    </Card>
  )
}
