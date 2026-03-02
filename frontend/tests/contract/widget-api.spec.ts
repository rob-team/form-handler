import { test, expect } from "@playwright/test"

// ---------------------------------------------------------------------------
// Widget Public API Contract Tests  CT-W001 through CT-W011
// ---------------------------------------------------------------------------
//
// Tests for the public (unauthenticated) widget endpoints:
//   GET  /api/widget/{widgetId}
//   POST /api/widget/{widgetId}/submit
//
// The test user and widget are created once in beforeAll.

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

async function setupTestWidget(
  request: Parameters<typeof test.beforeAll>[0] extends (args: {
    request: infer R
  }) => unknown
    ? R
    : never
) {
  const email = `ct-widget-${Date.now()}@test.com`
  const password = "Password123!"
  await request.post(`${PB}/api/collections/users/records`, {
    data: { email, password, passwordConfirm: password },
  })
  const loginRes = await request.post(
    `${PB}/api/collections/users/auth-with-password`,
    { data: { identity: email, password } }
  )
  const loginBody = await loginRes.json()
  const token: string = loginBody.token
  const userId: string = loginBody.record.id

  // Create an active widget
  const widgetRes = await request.post(
    `${PB}/api/collections/widgets/records`,
    {
      headers: { Authorization: token },
      data: {
        name: "CT Widget",
        user: userId,
        button_text: "Contact Us",
        greeting: "Hello! How can we help?",
        questions: DEFAULT_QUESTIONS,
        active: true,
      },
    }
  )
  const widget = await widgetRes.json()

  // Create an inactive widget
  const inactiveRes = await request.post(
    `${PB}/api/collections/widgets/records`,
    {
      headers: { Authorization: token },
      data: {
        name: "Inactive Widget",
        user: userId,
        questions: DEFAULT_QUESTIONS,
        active: false,
      },
    }
  )
  const inactiveWidget = await inactiveRes.json()

  return {
    token,
    userId,
    widgetId: widget.id as string,
    inactiveWidgetId: inactiveWidget.id as string,
  }
}

let authToken: string
let testUserId: string
let testWidgetId: string
let inactiveWidgetId: string

test.beforeAll(async ({ request }) => {
  const setup = await setupTestWidget(request)
  authToken = setup.token
  testUserId = setup.userId
  testWidgetId = setup.widgetId
  inactiveWidgetId = setup.inactiveWidgetId
})

// ---------------------------------------------------------------------------
// GET /api/widget/{widgetId} — Widget Config
// ---------------------------------------------------------------------------

test.describe("GET /api/widget/{widgetId}", () => {
  test("CT-W001: active widget returns config with public fields only", async ({
    request,
  }) => {
    const res = await request.get(`${PB}/api/widget/${testWidgetId}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.id).toBe(testWidgetId)
    expect(body.button_text).toBe("Contact Us")
    expect(body.greeting).toBe("Hello! How can we help?")
    expect(body.questions).toHaveLength(DEFAULT_QUESTIONS.length)
    expect(body.questions[0]).toHaveProperty("id", "q1")
    expect(body.questions[0]).toHaveProperty("label")
    expect(body.questions[0]).toHaveProperty("type")
  })

  test("CT-W002: response excludes internal fields (user, telegram_chat_id)", async ({
    request,
  }) => {
    const res = await request.get(`${PB}/api/widget/${testWidgetId}`)
    const body = await res.json()
    expect(body).not.toHaveProperty("user")
    expect(body).not.toHaveProperty("telegram_chat_id")
    expect(body).not.toHaveProperty("active")
    expect(body).not.toHaveProperty("created")
    expect(body).not.toHaveProperty("updated")
  })

  test("CT-W003: inactive widget returns 404", async ({ request }) => {
    const res = await request.get(`${PB}/api/widget/${inactiveWidgetId}`)
    expect(res.status()).toBe(404)
    const body = await res.json()
    expect(body.code).toBe(404)
  })

  test("CT-W004: non-existent widget returns 404", async ({ request }) => {
    const res = await request.get(`${PB}/api/widget/doesnotexist000`)
    expect(res.status()).toBe(404)
    const body = await res.json()
    expect(body.code).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// POST /api/widget/{widgetId}/submit — Inquiry Submission
// ---------------------------------------------------------------------------

test.describe("POST /api/widget/{widgetId}/submit", () => {
  const VALID_RESPONSES = [
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
      question_id: "q5",
      question_label: "Business Email",
      answer: "test@example.com",
    },
  ]

  test("CT-W005: valid submission returns 200 with inquiry id", async ({
    request,
  }) => {
    const res = await request.post(
      `${PB}/api/widget/${testWidgetId}/submit`,
      {
        data: {
          responses: VALID_RESPONSES,
          page_url: "https://example.com/products",
        },
      }
    )
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.id).toBeDefined()
    expect(typeof body.id).toBe("string")
  })

  test("CT-W006: inquiry record is created with correct metadata", async ({
    request,
  }) => {
    const submitRes = await request.post(
      `${PB}/api/widget/${testWidgetId}/submit`,
      {
        data: {
          responses: VALID_RESPONSES,
          page_url: "https://example.com/about",
        },
      }
    )
    const { id: inquiryId } = await submitRes.json()

    // Fetch the inquiry as the widget owner
    const detailRes = await request.get(
      `${PB}/api/collections/inquiries/records/${inquiryId}`,
      { headers: { Authorization: authToken } }
    )
    expect(detailRes.status()).toBe(200)
    const inquiry = await detailRes.json()
    expect(inquiry.widget).toBe(testWidgetId)
    expect(inquiry.page_url).toBe("https://example.com/about")
    // responses should be stored (as JSON string or parsed)
    const responses =
      typeof inquiry.responses === "string"
        ? JSON.parse(inquiry.responses)
        : inquiry.responses
    expect(responses).toHaveLength(VALID_RESPONSES.length)
    expect(responses[0].question_label).toBe("Which country are you from?")
    expect(responses[0].answer).toBe("Germany")
  })

  test("CT-W007: empty responses array returns 400", async ({ request }) => {
    const res = await request.post(
      `${PB}/api/widget/${testWidgetId}/submit`,
      { data: { responses: [] } }
    )
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(400)
  })

  test("CT-W008: missing responses field returns 400", async ({ request }) => {
    const res = await request.post(
      `${PB}/api/widget/${testWidgetId}/submit`,
      { data: { page_url: "https://example.com" } }
    )
    expect(res.status()).toBe(400)
  })

  test("CT-W009: response with missing required fields returns 400", async ({
    request,
  }) => {
    const res = await request.post(
      `${PB}/api/widget/${testWidgetId}/submit`,
      {
        data: {
          responses: [{ question_id: "q1" }], // missing question_label and answer
        },
      }
    )
    expect(res.status()).toBe(400)
  })

  test("CT-W010: submit to non-existent widget returns 404", async ({
    request,
  }) => {
    const res = await request.post(
      `${PB}/api/widget/doesnotexist000/submit`,
      { data: { responses: VALID_RESPONSES } }
    )
    expect(res.status()).toBe(404)
  })

  test("CT-W011: submit to inactive widget returns 404", async ({
    request,
  }) => {
    const res = await request.post(
      `${PB}/api/widget/${inactiveWidgetId}/submit`,
      { data: { responses: VALID_RESPONSES } }
    )
    expect(res.status()).toBe(404)
  })

  test("CT-W012: inquiry is saved even if Telegram would fail", async ({
    request,
  }) => {
    // Submit to a widget without Telegram configured — should still save
    const res = await request.post(
      `${PB}/api/widget/${testWidgetId}/submit`,
      {
        data: {
          responses: VALID_RESPONSES,
          page_url: "https://example.com/telegram-test",
        },
      }
    )
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.id).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// POST /api/widget/{widgetId}/telegram-test — Telegram Test Endpoint
// ---------------------------------------------------------------------------

test.describe("POST /api/widget/{widgetId}/telegram-test", () => {
  test("CT-W013: unauthenticated request returns 401", async ({ request }) => {
    const res = await request.post(
      `${PB}/api/widget/${testWidgetId}/telegram-test`
    )
    expect(res.status()).toBe(401)
  })

  test("CT-W014: non-owner returns 403", async ({ request }) => {
    // Register a different user
    const email = `ct-tg-other-${Date.now()}@test.com`
    const password = "Password123!"
    await request.post(`${PB}/api/collections/users/records`, {
      data: { email, password, passwordConfirm: password },
    })
    const loginRes = await request.post(
      `${PB}/api/collections/users/auth-with-password`,
      { data: { identity: email, password } }
    )
    const { token: otherToken } = await loginRes.json()

    const res = await request.post(
      `${PB}/api/widget/${testWidgetId}/telegram-test`,
      { headers: { Authorization: otherToken } }
    )
    expect(res.status()).toBe(403)
  })

  test("CT-W015: widget without chat ID returns 400", async ({ request }) => {
    // testWidgetId has no telegram_chat_id configured
    const res = await request.post(
      `${PB}/api/widget/${testWidgetId}/telegram-test`,
      { headers: { Authorization: authToken } }
    )
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.message).toContain("chat ID")
  })
})

// ---------------------------------------------------------------------------
// POST /api/widget/{widgetId}/visit — Visitor Tracking
// ---------------------------------------------------------------------------

test.describe("POST /api/widget/{widgetId}/visit", () => {
  test("CT-W016: valid visit is recorded (200)", async ({ request }) => {
    const res = await request.post(
      `${PB}/api/widget/${testWidgetId}/visit`,
      { data: { page_url: "https://example.com/products" } }
    )
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test("CT-W017: visitor_record created with metadata", async ({ request }) => {
    // Record a visit
    await request.post(`${PB}/api/widget/${testWidgetId}/visit`, {
      data: { page_url: "https://example.com/ct-w017" },
    })

    // Fetch visitor_records as the owner
    const res = await request.get(
      `${PB}/api/collections/visitor_records/records`,
      {
        headers: { Authorization: authToken },
        params: {
          filter: `widget="${testWidgetId}" && page_url="https://example.com/ct-w017"`,
          sort: "-created",
        },
      }
    )
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.totalItems).toBeGreaterThan(0)
    const record = body.items[0]
    expect(record.widget).toBe(testWidgetId)
    expect(record.page_url).toBe("https://example.com/ct-w017")
    expect(record).toHaveProperty("visitor_ip")
    expect(record).toHaveProperty("country")
  })

  test("CT-W018: visit to non-existent widget returns 404", async ({
    request,
  }) => {
    const res = await request.post(
      `${PB}/api/widget/doesnotexist000/visit`,
      { data: { page_url: "https://example.com" } }
    )
    expect(res.status()).toBe(404)
  })

  test("CT-W019: visit to inactive widget returns 404", async ({
    request,
  }) => {
    const res = await request.post(
      `${PB}/api/widget/${inactiveWidgetId}/visit`,
      { data: { page_url: "https://example.com" } }
    )
    expect(res.status()).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// GET /api/widget/{widgetId}/stats — Widget Statistics
// ---------------------------------------------------------------------------

test.describe("GET /api/widget/{widgetId}/stats", () => {
  test("CT-W020: returns stats for widget owner", async ({ request }) => {
    // Ensure at least one visit exists
    await request.post(`${PB}/api/widget/${testWidgetId}/visit`, {
      data: { page_url: "https://example.com/stats-test" },
    })

    const res = await request.get(
      `${PB}/api/widget/${testWidgetId}/stats`,
      { headers: { Authorization: authToken } }
    )
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty("total_visits")
    expect(body).toHaveProperty("unique_visitors")
    expect(body).toHaveProperty("total_inquiries")
    expect(body).toHaveProperty("top_countries")
    expect(typeof body.total_visits).toBe("number")
    expect(body.total_visits).toBeGreaterThan(0)
    expect(Array.isArray(body.top_countries)).toBe(true)
  })

  test("CT-W021: unauthenticated request returns 401", async ({ request }) => {
    const res = await request.get(
      `${PB}/api/widget/${testWidgetId}/stats`
    )
    expect(res.status()).toBe(401)
  })

  test("CT-W022: non-owner returns 403", async ({ request }) => {
    const email = `ct-stats-other-${Date.now()}@test.com`
    const password = "Password123!"
    await request.post(`${PB}/api/collections/users/records`, {
      data: { email, password, passwordConfirm: password },
    })
    const loginRes = await request.post(
      `${PB}/api/collections/users/auth-with-password`,
      { data: { identity: email, password } }
    )
    const { token: otherToken } = await loginRes.json()

    const res = await request.get(
      `${PB}/api/widget/${testWidgetId}/stats`,
      { headers: { Authorization: otherToken } }
    )
    expect(res.status()).toBe(403)
  })
})
