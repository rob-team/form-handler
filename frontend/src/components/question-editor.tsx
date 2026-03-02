"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export interface Question {
  id: string
  label: string
  type: "text" | "email" | "single-select"
  required: boolean
  options: string[] | null
}

interface Props {
  questions: Question[]
  onChange: (questions: Question[]) => void
}

export default function QuestionEditor({ questions, onChange }: Props) {
  const [editingOptions, setEditingOptions] = useState<string | null>(null)

  function addQuestion() {
    const nextId = `q${Date.now()}`
    onChange([
      ...questions,
      { id: nextId, label: "", type: "text", required: true, options: null },
    ])
  }

  function removeQuestion(id: string) {
    if (questions.length <= 1) return // FR-019: at least 1 question
    onChange(questions.filter((q) => q.id !== id))
  }

  function updateQuestion(id: string, updates: Partial<Question>) {
    onChange(
      questions.map((q) => {
        if (q.id !== id) return q
        const updated = { ...q, ...updates }
        // When switching to single-select, initialize options if empty
        if (updated.type === "single-select" && !updated.options) {
          updated.options = ["Option 1", "Option 2"]
        }
        // When switching away from single-select, clear options
        if (updated.type !== "single-select") {
          updated.options = null
        }
        return updated
      })
    )
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= questions.length) return
    const updated = [...questions]
    ;[updated[index], updated[target]] = [updated[target], updated[index]]
    onChange(updated)
  }

  function updateOption(questionId: string, optIndex: number, value: string) {
    onChange(
      questions.map((q) => {
        if (q.id !== questionId || !q.options) return q
        const opts = [...q.options]
        opts[optIndex] = value
        return { ...q, options: opts }
      })
    )
  }

  function addOption(questionId: string) {
    onChange(
      questions.map((q) => {
        if (q.id !== questionId || !q.options) return q
        return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
      })
    )
  }

  function removeOption(questionId: string, optIndex: number) {
    onChange(
      questions.map((q) => {
        if (q.id !== questionId || !q.options || q.options.length <= 1) return q
        return { ...q, options: q.options.filter((_, i) => i !== optIndex) }
      })
    )
  }

  return (
    <div className="space-y-3">
      {questions.map((q, idx) => (
        <Card key={q.id}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground mt-2 shrink-0">
                #{idx + 1}
              </span>
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Question label"
                  value={q.label}
                  onChange={(e) =>
                    updateQuestion(q.id, { label: e.target.value })
                  }
                  aria-label={`Question ${idx + 1} label`}
                />
                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    value={q.type}
                    onChange={(e) =>
                      updateQuestion(q.id, {
                        type: e.target.value as Question["type"],
                      })
                    }
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    aria-label={`Question ${idx + 1} type`}
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="single-select">Single Select</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) =>
                        updateQuestion(q.id, { required: e.target.checked })
                      }
                    />
                    Required
                  </label>
                </div>

                {/* Options editor for single-select */}
                {q.type === "single-select" && q.options && (
                  <div className="space-y-1 pl-2 border-l-2 border-muted">
                    <Label className="text-xs text-muted-foreground">
                      Options
                    </Label>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex gap-1 items-center">
                        <Input
                          value={opt}
                          onChange={(e) =>
                            updateOption(q.id, optIdx, e.target.value)
                          }
                          className="h-7 text-xs"
                          placeholder={`Option ${optIdx + 1}`}
                          onFocus={() => setEditingOptions(q.id)}
                        />
                        {q.options!.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => removeOption(q.id, optIdx)}
                          >
                            &times;
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => addOption(q.id)}
                    >
                      + Add option
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-0.5 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1"
                  disabled={idx === 0}
                  onClick={() => moveQuestion(idx, -1)}
                  aria-label="Move up"
                >
                  &uarr;
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1"
                  disabled={idx === questions.length - 1}
                  onClick={() => moveQuestion(idx, 1)}
                  aria-label="Move down"
                >
                  &darr;
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1 text-destructive"
                  disabled={questions.length <= 1}
                  onClick={() => removeQuestion(q.id)}
                  aria-label="Remove question"
                >
                  &times;
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
        + Add Question
      </Button>
    </div>
  )
}
