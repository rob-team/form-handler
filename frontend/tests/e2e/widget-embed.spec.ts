import { test, expect } from "@playwright/test"

const PB = "http://127.0.0.1:8090"

const DEFAULT_QUESTIONS = [
  {
    id: "q1",
    label: "Which country are you from?",
    type: "text",
    required: true,
    options: null,
  },
  {
    id: "q2",
    label: "Company Name",
    type: "text",
    required: true,
    options: null,
  },
  {
    id: "q3",
    label: "Purchase Quantity",
    type: "single-select",
    required: true,
    options: ["< 100 pcs", "100-500 pcs", "500-1000 pcs", "1000+ pcs"],
  },
  {
    id: "q5",
    label: "Business Email",
    type: "email",
    required: true,
    options: null,
  },
]

async function createWidgetViaAPI(
  request: Parameters<typeof test.beforeAll>[0] extends (args: {
    request: infer R
  }) => unknown
    ? R
    : never
) {
  const email = `e2e-embed-${Date.now()}@test.com`
  const password = "Password123!"
  await request.post(`${PB}/api/collections/users/records`, {
    data: { email, password, passwordConfirm: password },
  })
  const loginRes = await request.post(
    `${PB}/api/collections/users/auth-with-password`,
    { data: { identity: email, password } }
  )
  const { token, record } = await loginRes.json()

  const widgetRes = await request.post(
    `${PB}/api/collections/widgets/records`,
    {
      headers: { Authorization: token },
      data: {
        name: "E2E Test Widget",
        user: record.id,
        button_text: "Send Inquiry",
        greeting: "Hello! Please answer a few questions.",
        questions: DEFAULT_QUESTIONS,
        active: true,
      },
    }
  )
  const widget = await widgetRes.json()
  return { widgetId: widget.id as string, token }
}

// ---------------------------------------------------------------------------
// E2E — Widget Embed and Conversational Form
// ---------------------------------------------------------------------------
// NOTE: These tests require the widget.js to be served and a test HTML page.
// In CI, these would be set up via a fixture. For now, we test the API flow
// that backs the widget's conversational form.
// ---------------------------------------------------------------------------

test.describe("Widget Embed API Flow", () => {
  test.describe.configure({ mode: "serial" })

  let widgetId: string
  let authToken: string

  test.beforeAll(async ({ request }) => {
    const setup = await createWidgetViaAPI(request)
    widgetId = setup.widgetId
    authToken = setup.token
  })

  test("GET widget config returns questions for active widget", async ({
    request,
  }) => {
    const res = await request.get(`${PB}/api/widget/${widgetId}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.questions).toHaveLength(DEFAULT_QUESTIONS.length)
    expect(body.button_text).toBe("Send Inquiry")
    expect(body.greeting).toContain("Hello")
  })

  test("Submit complete inquiry through widget endpoint", async ({
    request,
  }) => {
    const responses = [
      {
        question_id: "q1",
        question_label: "Which country are you from?",
        answer: "Germany",
      },
      {
        question_id: "q2",
        question_label: "Company Name",
        answer: "Test GmbH",
      },
      {
        question_id: "q3",
        question_label: "Purchase Quantity",
        answer: "100-500 pcs",
      },
      {
        question_id: "q5",
        question_label: "Business Email",
        answer: "test@example.com",
      },
    ]

    const res = await request.post(`${PB}/api/widget/${widgetId}/submit`, {
      data: { responses, page_url: "https://example.com/test" },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.id).toBeDefined()
  })

  test("Submitted inquiry is visible to widget owner", async ({ request }) => {
    const res = await request.get(
      `${PB}/api/collections/inquiries/records`,
      {
        headers: { Authorization: authToken },
        params: {
          filter: `widget="${widgetId}"`,
          sort: "-created",
          perPage: "1",
        },
      }
    )
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.totalItems).toBeGreaterThan(0)
    const inquiry = body.items[0]
    const responses =
      typeof inquiry.responses === "string"
        ? JSON.parse(inquiry.responses)
        : inquiry.responses
    expect(responses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ question_id: "q1", answer: "Germany" }),
      ])
    )
  })
})
