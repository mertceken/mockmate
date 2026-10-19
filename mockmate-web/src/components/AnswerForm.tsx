import { useState, type FormEvent, type KeyboardEvent } from 'react'
import Spinner from './Spinner'

const MAX_LENGTH = 10000

interface Props {
  isSubmitting: boolean
  error: string | null
  onSubmit: (text: string) => void
}

export default function AnswerForm({ isSubmitting, error, onSubmit }: Props) {
  const [text, setText] = useState('')
  const canSubmit = text.trim().length > 0 && !isSubmitting

  function submit() {
    if (canSubmit) onSubmit(text.trim())
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        maxLength={MAX_LENGTH}
        rows={8}
        placeholder="Answer as you would in a real interview..."
        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none
                   focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-500">
        <span>Ctrl + Enter to submit</span>
        <span>
          {text.length}/{MAX_LENGTH}
        </span>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm
                   font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Spinner />}
        {isSubmitting ? 'Evaluating...' : 'Submit answer'}
      </button>

      {isSubmitting && (
        <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">
          The AI is evaluating your answer. This can take up to a minute.
        </div>
      )}

      {error && (
        <div role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </form>
  )
}