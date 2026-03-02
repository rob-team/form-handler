import { h, render } from "preact"
import App from "./App"
import { setApiBase } from "./lib/api"
// CSS is imported as a string via esbuild's text loader
import widgetCSS from "./styles/widget.css"

declare global {
  interface Window {
    FormHandler?: {
      widgetId?: string
      apiBase?: string
    }
  }
}

function init() {
  const cfg = window.FormHandler
  if (!cfg || !cfg.widgetId) {
    console.error("[FormHandler] Missing widgetId in window.FormHandler config")
    return
  }

  const widgetId = cfg.widgetId
  const apiBase = cfg.apiBase || ""
  setApiBase(apiBase)

  // Create a host element
  const host = document.createElement("div")
  host.id = "formhandler-widget"
  document.body.appendChild(host)

  // Attach closed Shadow DOM for CSS isolation
  const shadow = host.attachShadow({ mode: "closed" })

  // Inject styles into Shadow DOM
  const style = document.createElement("style")
  style.textContent = widgetCSS
  shadow.appendChild(style)

  // Create a mount point inside the shadow
  const mountPoint = document.createElement("div")
  shadow.appendChild(mountPoint)

  // Mount Preact app
  render(h(App, { widgetId }), mountPoint)
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}
