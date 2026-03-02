import { h } from "preact"

interface Props {
  buttonText: string
  isOpen: boolean
  onClick: () => void
}

export default function ChatBubble({ buttonText, isOpen, onClick }: Props) {
  return (
    <button
      class="fh-bubble"
      onClick={onClick}
      aria-label={isOpen ? "Close inquiry form" : buttonText}
      role="button"
    >
      {isOpen ? (
        <span class="fh-bubble-close">&times;</span>
      ) : (
        <svg class="fh-bubble-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
        </svg>
      )}
    </button>
  )
}
