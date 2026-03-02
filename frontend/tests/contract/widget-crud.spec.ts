import { test, expect } from "@playwright/test"

// ---------------------------------------------------------------------------
// Widget CRUD Contract Tests  CT-WC001 through CT-WC008
// ---------------------------------------------------------------------------

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
    id: "q5",
    label: "Business Email",
    type: "email",
    required: true,
    options: null,
  },
]

async function registerAndLogin(
  request: Parameters<typeof test.beforeAll>[0] extends (args: {
    request: infer R
  }) => unknown
    ? R
    : never,
  prefix: string
) {
  const email = `${prefix}-${Date.now()}@test.com`
  const password = "Password123!"
  await request.post(`${PB}/api/collections/users/records`, {
    data: { email, password, passwordConfirm: password },
  })
  const loginRes = await request.post(
    `${PB}/api/collections/users/auth-with-password`,
    { data: { identity: email, password } }
  )
  const body = await loginRes.json()
  return { token: body.token as string, userId: body.record.id as string }
}

// ---------------------------------------------------------------------------
// Widget CRUD
// ---------------------------------------------------------------------------

test.describe("Widget CRUD (CT-WC001 to CT-WC008)", () => {
  let tokenA: string
  let userIdA: string
  let tokenB: string

  test.beforeAll(async ({ request }) => {
    const userA = await registerAndLogin(request, "ct-wc-a")
    tokenA = userA.token
    userIdA = userA.userId

    const userB = await registerAndLogin(request, "ct-wc-b")
    tokenB = userB.token
  })

  test("CT-WC001: create widget with default questions returns 200", async ({
    request,
  }) => {
    const res = await request.post(`${PB}/api/collections/widgets/records`, {
      headers: { Authorization: tokenA },
      data: {
        name: "Test Widget",
        user: userIdA,
        questions: DEFAULT_QUESTIONS,
        active: true,
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty("id")
    expect(body.name).toBe("Test Widget")
    expect(body.active).toBe(true)
  })

  test("CT-WC002: list widgets returns only owner's widgets", async ({
    request,
  }) => {
    // Create a widget for user A
    await request.post(`${PB}/api/collections/widgets/records`, {
      headers: { Authorization: tokenA },
      data: {
        name: "Owner Widget",
        user: userIdA,
        questions: DEFAULT_QUESTIONS,
        active: true,
      },
    })

    // User A should see their widgets
    const resA = await request.get(`${PB}/api/collections/widgets/records`, {
      headers: { Authorization: tokenA },
    })
    expect(resA.status()).toBe(200)
    const bodyA = await resA.json()
    expect(
      bodyA.items.every((w: { user: string }) => w.user === userIdA)
    ).toBe(true)

    // User B should not see user A's widgets
    const resB = await request.get(`${PB}/api/collections/widgets/records`, {
      headers: { Authorization: tokenB },
    })
    expect(resB.status()).toBe(200)
    const bodyB = await resB.json()
    expect(bodyB.totalItems).toBe(0)
  })

  test("CT-WC003: update widget questions returns 200", async ({ request }) => {
    const createRes = await request.post(
      `${PB}/api/collections/widgets/records`,
      {
        headers: { Authorization: tokenA },
        data: {
          name: "Update Test",
          user: userIdA,
          questions: DEFAULT_QUESTIONS,
          active: true,
        },
      }
    )
    const widget = await createRes.json()

    const updatedQuestions = [
      ...DEFAULT_QUESTIONS,
      {
        id: "q99",
        label: "New Question",
        type: "text",
        required: false,
        options: null,
      },
    ]

    const updateRes = await request.patch(
      `${PB}/api/collections/widgets/records/${widget.id}`,
      {
        headers: { Authorization: tokenA },
        data: { questions: updatedQuestions },
      }
    )
    expect(updateRes.status()).toBe(200)
    const updated = await updateRes.json()
    const questions =
      typeof updated.questions === "string"
        ? JSON.parse(updated.questions)
        : updated.questions
    expect(questions).toHaveLength(DEFAULT_QUESTIONS.length + 1)
  })

  test("CT-WC004: delete widget cascades to inquiries", async ({ request }) => {
    // Create widget
    const createRes = await request.post(
      `${PB}/api/collections/widgets/records`,
      {
        headers: { Authorization: tokenA },
        data: {
          name: "Cascade Test",
          user: userIdA,
          questions: DEFAULT_QUESTIONS,
          active: true,
        },
      }
    )
    const widget = await createRes.json()

    // Submit an inquiry via the public endpoint
    await request.post(`${PB}/api/widget/${widget.id}/submit`, {
      data: {
        responses: [
          {
            question_id: "q1",
            question_label: "Test Q",
            answer: "Test A",
          },
        ],
      },
    })

    // Verify inquiry exists
    const inquiriesRes = await request.get(
      `${PB}/api/collections/inquiries/records`,
      {
        headers: { Authorization: tokenA },
        params: { filter: `widget="${widget.id}"` },
      }
    )
    const inquiries = await inquiriesRes.json()
    expect(inquiries.totalItems).toBeGreaterThan(0)

    // Delete the widget
    const deleteRes = await request.delete(
      `${PB}/api/collections/widgets/records/${widget.id}`,
      { headers: { Authorization: tokenA } }
    )
    expect(deleteRes.status()).toBe(204)

    // Verify inquiries were cascade-deleted (returns 0 or empty)
    const afterRes = await request.get(
      `${PB}/api/collections/inquiries/records`,
      {
        headers: { Authorization: tokenA },
        params: { filter: `widget="${widget.id}"` },
      }
    )
    const afterBody = await afterRes.json()
    expect(afterBody.totalItems).toBe(0)
  })

  test("CT-WC005: unauthenticated create returns 400/403", async ({
    request,
  }) => {
    const res = await request.post(`${PB}/api/collections/widgets/records`, {
      data: {
        name: "Unauthorized",
        questions: DEFAULT_QUESTIONS,
        active: true,
      },
    })
    // PocketBase returns 400 when createRule fails
    expect([400, 403]).toContain(res.status())
  })

  test("CT-WC006: unauthenticated list returns empty", async ({ request }) => {
    const res = await request.get(`${PB}/api/collections/widgets/records`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.totalItems).toBe(0)
  })

  test("CT-WC007: non-owner cannot update widget", async ({ request }) => {
    const createRes = await request.post(
      `${PB}/api/collections/widgets/records`,
      {
        headers: { Authorization: tokenA },
        data: {
          name: "Non-owner Test",
          user: userIdA,
          questions: DEFAULT_QUESTIONS,
          active: true,
        },
      }
    )
    const widget = await createRes.json()

    const updateRes = await request.patch(
      `${PB}/api/collections/widgets/records/${widget.id}`,
      {
        headers: { Authorization: tokenB },
        data: { name: "Hacked" },
      }
    )
    expect([403, 404]).toContain(updateRes.status())
  })

  test("CT-WC008: non-owner cannot delete widget", async ({ request }) => {
    const createRes = await request.post(
      `${PB}/api/collections/widgets/records`,
      {
        headers: { Authorization: tokenA },
        data: {
          name: "Non-owner Delete",
          user: userIdA,
          questions: DEFAULT_QUESTIONS,
          active: true,
        },
      }
    )
    const widget = await createRes.json()

    const deleteRes = await request.delete(
      `${PB}/api/collections/widgets/records/${widget.id}`,
      { headers: { Authorization: tokenB } }
    )
    expect([403, 404]).toContain(deleteRes.status())
  })
})
