import { h } from "preact"

interface Props {
  options: string[]
  selected: string | null
  onSelect: (value: string) => void
}

export default function SelectOptions({ options, selected, onSelect }: Props) {
  return (
    <div class="fh-options">
      {options.map((opt) => (
        <button
          key={opt}
          class={`fh-option-btn${selected === opt ? " fh-selected" : ""}`}
          onClick={() => onSelect(opt)}
          type="button"
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
