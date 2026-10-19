import { useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useCompleteSession, useSession, useSubmitAnswer } from '../api/hooks'
import AnswerForm from '../components/AnswerForm'
import FeedbackCard from '../components/FeedbackCard'
import Spinner from '../components/Spinner'

function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">{children}</span>
}

export default function InterviewPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const { data: session, isPending, isError, error } = useSession(id)
  const submitAnswer = useSubmitAnswer(id)
  const completeSession = useCompleteSession(id)
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <Spinner className="h-5 w-5" /> Loading interview...
      </div>
    )
  }

  if (isError) {
    return (
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error.message}{' '}
        <Link to="/" className="font-medium underline">
          Start a new interview
        </Link>
      </div>
    )
  }

  if (session.status === 'Completed') {
    return <Navigate to={`/sessions/${session.id}/report`} replace />
  }

  const questions = [...session.questions].sort((a, b) => a.order - b.order)
  const answeredCount = questions.filter((q) => q.answer).length
  const firstUnanswered = questions.find((q) => !q.answer)
  const current =
    questions.find((q) => q.order === selectedOrder) ?? firstUnanswered ?? questions[questions.length - 1]
  const nextUnanswered = questions.find((q) => !q.answer && q.id !== current.id)
  const allAnswered = answeredCount === questions.length

  function selectQuestion(order: number) {
    submitAnswer.reset()
    setSelectedOrder(order)
  }

  function handleSubmitAnswer(text: string) {
    // Cevap kaydedilince "ilk cevaplanmamış soru" değişir; geri bildirimi görebilmek için sorunun üstünde kal
    setSelectedOrder(current.order)
    submitAnswer.mutate({ questionId: current.id, text })
  }

function handleFinish() {
  const remaining = questions.length - answeredCount
  if (remaining > 0 && !window.confirm(`You have ${remaining} unanswered question(s). Finish anyway?`)) {
    return
  }
  completeSession.mutate(undefined, {
    onSuccess: () => navigate(`/sessions/${id}/report`),
  })
}

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">{session.position}</h1>
          <p className="text-sm text-slate-600">
            {session.level} · {session.techStack}
          </p>
        </div>
        <span className="text-sm text-slate-600">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {questions.map((q) => {
          const isCurrent = q.id === current.id
          const style = isCurrent
            ? 'border-indigo-600 bg-indigo-600 text-white'
            : q.answer
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-400'
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => selectQuestion(q.order)}
              disabled={submitAnswer.isPending || completeSession.isPending}
              aria-label={`Question ${q.order}`}
              aria-current={isCurrent}
              className={`h-9 w-9 rounded-full border text-sm font-medium disabled:opacity-60 ${style}`}
            >
              {q.order}
            </button>
          )
        })}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-slate-500">
            Question {current.order} of {questions.length}
          </span>
          <Badge>{current.topic}</Badge>
          <Badge>{current.category}</Badge>
          <Badge>{current.difficulty}</Badge>
        </div>
        <p className="mt-3 text-lg font-medium">{current.text}</p>
      </div>

      {current.answer ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your answer</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{current.answer.text}</p>
          </div>

          <FeedbackCard answer={current.answer} />

          {nextUnanswered && (
            <button
              type="button"
              onClick={() => selectQuestion(nextUnanswered.order)}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Next question →
            </button>
          )}
        </div>
      ) : (
        <AnswerForm
          key={current.id}
          isSubmitting={submitAnswer.isPending}
          error={submitAnswer.isError ? submitAnswer.error.message : null}
          onSubmit={handleSubmitAnswer}
        />
      )}

      <div className="mt-8 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={handleFinish}
          disabled={answeredCount === 0 || completeSession.isPending || submitAnswer.isPending}
          className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium
                      disabled:cursor-not-allowed disabled:opacity-60 ${
                        allAnswered
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
        >
          {completeSession.isPending && <Spinner />}
          {completeSession.isPending ? 'Generating your report...' : 'Finish interview'}
        </button>
        {answeredCount === 0 && (
          <p className="mt-2 text-xs text-slate-500">Answer at least one question to finish.</p>
        )}
        {completeSession.isError && (
          <div role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {completeSession.error.message}
          </div>
        )}
      </div>
    </div>
  )
}