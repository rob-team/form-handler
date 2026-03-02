import { h } from "preact"
import { useState } from "preact/hooks"
import type { Question } from "../lib/api"
import SelectOptions from "./SelectOptions"

interface Props {
  question: Question
  currentAnswer: string
  onAnswer: (answer: string) => void
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function QuestionStep({ question, currentAnswer, onAnswer }: Props) {
  const [inputValue, setInputValue] = useState(currentAnswer || "")
  const [error, setError] = useState("")

  function handleSubmit() {
    const val = inputValue.trim()

    if (question.required && !val) {
      setError("This field is required.")
      return
    }

    if (question.type === "email" && val && !isValidEmail(val)) {
      setError("Please enter a valid email address.")
      return
    }

    setError("")
    onAnswer(val)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (question.type === "single-select" && question.options) {
    return (
      <SelectOptions
        options={question.options}
        selected={currentAnswer || null}
        onSelect={(val) => {
          setError("")
          onAnswer(val)
        }}
      />
    )
  }

  return (
    <div class="fh-input-area">
      {error && <div class="fh-error">{error}</div>}
      <div class="fh-input-row">
        <input
          class={`fh-input${error ? " fh-input-error" : ""}`}
          type={question.type === "email" ? "email" : "text"}
          placeholder={
            question.type === "email"
              ? "your@email.com"
              : "Type your answer..."
          }
          value={inputValue}
          onInput={(e) => {
            setInputValue((e.target as HTMLInputElement).value)
            if (error) setError("")
          }}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button
          class="fh-send-btn"
          onClick={handleSubmit}
          disabled={question.required && !inputValue.trim()}
          aria-label="Send"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
