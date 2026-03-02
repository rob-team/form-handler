import { h } from "preact"
import { useState, useEffect } from "preact/hooks"
import ChatBubble from "./components/ChatBubble"
import ChatWindow from "./components/ChatWindow"
import {
  fetchWidgetConfig,
  submitInquiry,
  recordVisit,
  type WidgetConfig,
  type InquiryResponse,
} from "./lib/api"

interface Props {
  widgetId: string
}

type State = "loading" | "ready" | "error"

export default function App({ widgetId }: Props) {
  const [state, setState] = useState<State>("loading")
  const [config, setConfig] = useState<WidgetConfig | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [answers, setAnswers] = useState<InquiryResponse[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchWidgetConfig(widgetId)
      .then((cfg) => {
        setConfig(cfg)
        setState("ready")
        // Fire-and-forget: record this page visit
        recordVisit(widgetId, window.location.href)
      })
      .catch(() => {
        setState("error")
      })
  }, [widgetId])

  if (state === "loading" || state === "error" || !config) {
    // Don't render anything while loading or on error
    return null
  }

  function handleToggle() {
    setIsOpen(!isOpen)
  }

  function handleAnswer(answer: string) {
    const q = config!.questions[currentStep]
    const response: InquiryResponse = {
      question_id: q.id,
      question_label: q.label,
      answer,
    }

    const newAnswers = [...answers]
    newAnswers[currentStep] = response
    setAnswers(newAnswers)
    setCurrentStep(currentStep + 1)
    setError("")
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError("")
    try {
      // Filter out any gaps in answers array
      const validAnswers = answers.filter(Boolean)
      await submitInquiry(widgetId, validAnswers, window.location.href)
      setSubmitted(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Submission failed. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div class="fh-root">
      <ChatBubble
        buttonText={config.button_text || "Send Inquiry"}
        isOpen={isOpen}
        onClick={handleToggle}
      />
      {isOpen && (
        <ChatWindow
          greeting={config.greeting}
          questions={config.questions}
          answers={answers}
          currentStep={currentStep}
          submitting={submitting}
          submitted={submitted}
          error={error}
          onAnswer={handleAnswer}
          onBack={handleBack}
          onSubmit={handleSubmit}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
