import { h } from "preact"
import { useRef, useEffect } from "preact/hooks"
import type { Question, InquiryResponse } from "../lib/api"
import QuestionStep from "./QuestionStep"

interface Props {
  greeting: string
  questions: Question[]
  answers: InquiryResponse[]
  currentStep: number
  submitting: boolean
  submitted: boolean
  error: string
  onAnswer: (answer: string) => void
  onBack: () => void
  onSubmit: () => void
  onClose: () => void
}

export default function ChatWindow({
  greeting,
  questions,
  answers,
  currentStep,
  submitting,
  submitted,
  error,
  onAnswer,
  onBack,
  onSubmit,
  onClose,
}: Props) {
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [currentStep, answers.length, submitted])

  const allAnswered = currentStep >= questions.length

  return (
    <div class="fh-window">
      {/* Header */}
      <div class="fh-header">
        <span class="fh-header-title">Send Inquiry</span>
        <button class="fh-header-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
      </div>

      {/* Messages */}
      <div class="fh-messages" ref={messagesRef}>
        {greeting && <div class="fh-msg fh-msg-system">{greeting}</div>}

        {answers.map((a, idx) => (
          <div key={idx}>
            <div class="fh-msg fh-msg-system">{questions[idx]?.label}</div>
            <div class="fh-msg fh-msg-visitor">{a.answer}</div>
          </div>
        ))}

        {!submitted && !allAnswered && questions[currentStep] && (
          <div class="fh-msg fh-msg-system">
            {questions[currentStep].label}
            {!questions[currentStep].required && (
              <span style={{ opacity: 0.6 }}> (optional)</span>
            )}
          </div>
        )}

        {submitted && (
          <div class="fh-msg fh-msg-system">
            Thank you! Your inquiry has been submitted successfully. We&apos;ll
            get back to you soon.
          </div>
        )}
      </div>

      {/* Progress + Back */}
      {!submitted && (
        <div class="fh-progress">
          {currentStep > 0 && !allAnswered && (
            <button class="fh-back-btn" onClick={onBack} type="button">
              &larr; Back
            </button>
          )}
          {!allAnswered && (
            <span>
              {currentStep + 1} / {questions.length}
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && <div class="fh-error">{error}</div>}

      {/* Input / Submit */}
      {!submitted &&
        (allAnswered ? (
          <div class="fh-input-area">
            <button
              class="fh-submit-btn"
              onClick={onSubmit}
              disabled={submitting}
              type="button"
            >
              {submitting ? "Submitting..." : "Submit Inquiry"}
            </button>
          </div>
        ) : (
          questions[currentStep] && (
            <QuestionStep
              key={currentStep}
              question={questions[currentStep]}
              currentAnswer={answers[currentStep]?.answer ?? ""}
              onAnswer={onAnswer}
            />
          )
        ))}
    </div>
  )
}
