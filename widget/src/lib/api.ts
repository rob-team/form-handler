export interface Question {
  id: string
  label: string
  type: "text" | "email" | "single-select"
  required: boolean
  options: string[] | null
}

export interface WidgetConfig {
  id: string
  button_text: string
  greeting: string
  questions: Question[]
}

export interface InquiryResponse {
  question_id: string
  question_label: string
  answer: string
}

export interface SubmitResult {
  success: boolean
  id: string
}

let _apiBase = ""

export function setApiBase(base: string) {
  _apiBase = base.replace(/\/$/, "")
}

export async function fetchWidgetConfig(
  widgetId: string
): Promise<WidgetConfig> {
  const res = await fetch(`${_apiBase}/api/widget/${widgetId}`)
  if (!res.ok) {
    throw new Error(`Widget not found (${res.status})`)
  }
  return res.json()
}

export async function submitInquiry(
  widgetId: string,
  responses: InquiryResponse[],
  pageUrl: string
): Promise<SubmitResult> {
  const res = await fetch(`${_apiBase}/api/widget/${widgetId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ responses, page_url: pageUrl }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Submission failed (${res.status})`)
  }
  return res.json()
}

export async function recordVisit(
  widgetId: string,
  pageUrl: string
): Promise<void> {
  try {
    await fetch(`${_apiBase}/api/widget/${widgetId}/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_url: pageUrl }),
    })
  } catch {
    // Fire-and-forget — do not block widget rendering
  }
}
