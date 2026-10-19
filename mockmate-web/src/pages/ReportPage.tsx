import { Link, Navigate, useParams } from 'react-router-dom'
import { useSession } from '../api/hooks'
import FeedbackCard from '../components/FeedbackCard'
import Spinner from '../components/Spinner'
import { barClasses, scoreTone, toneClasses } from '../lib/score'
import type { Answer, Question } from '../types/api'

type AnsweredQuestion = Question & { answer: Answer }

function Chips({ title, items, chipClass }: { title: string; items: string[]; chipClass: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Nothing to show yet.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className={`rounded-full border px-3 py-1 text-xs font-medium ${chipClass}`}>
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReportPage() {
  const { id = '' } = useParams()
  const { data: session, isPending, isError, error } = useSession(id)

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <Spinner className="h-5 w-5" /> Loading report...
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

  if (session.status !== 'Completed') {
    return <Navigate to={`/sessions/${session.id}`} replace />
  }

  const questions = [...session.questions].sort((a, b) => a.order - b.order)
  const answered = questions.filter((q): q is AnsweredQuestion => q.answer !== null)
  const skippedCount = questions.length - answered.length


  const scoresByTopic = new Map<string, number[]>()
  for (const q of answered) {
    scoresByTopic.set(q.topic, [...(scoresByTopic.get(q.topic) ?? []), q.answer.score])
  }
  const topicScores = [...scoresByTopic.entries()]
    .map(([topic, scores]) => ({ topic, avg: scores.reduce((sum, s) => sum + s, 0) / scores.length }))
    .sort((a, b) => b.avg - a.avg)

  const overall = session.overallScore ?? 0
  const report = session.report

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Interview report</h1>
          <p className="mt-1 text-sm text-slate-600">
            {session.position} · {session.level}
            {session.completedAt && ` · ${new Date(session.completedAt).toLocaleDateString()}`}
          </p>
          <p className="text-xs text-slate-500">{session.techStack}</p>
        </div>

        <div className={`rounded-xl border px-5 py-3 text-center ${toneClasses[scoreTone(overall)]}`}>
          <div className="text-3xl font-bold">{overall.toFixed(1)}</div>
          <div className="text-xs">out of 10</div>
        </div>
      </div>

      {skippedCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          You answered {answered.length} of {questions.length} questions. Skipped questions are not
          included in the score.
        </div>
      )}

      {report && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Summary</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{report.summary}</p>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">Score by topic</h2>
        <div className="mt-4 space-y-3">
          {topicScores.map(({ topic, avg }) => (
            <div key={topic}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">{topic}</span>
                <span className="font-medium text-slate-900">{avg.toFixed(1)}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${barClasses[scoreTone(avg)]}`}
                  style={{ width: `${Math.max((avg / 10) * 100, 3)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Chips
              title="Strong areas"
              items={report.strongAreas}
              chipClass="border-emerald-200 bg-emerald-50 text-emerald-800"
            />
            <Chips
              title="Needs work"
              items={report.weakAreas}
              chipClass="border-red-200 bg-red-50 text-red-800"
            />
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">What to study next</h2>
            <ul className="mt-3 space-y-2">
              {report.recommendations.map((rec) => (
                <li key={rec} className="flex gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section>
        <h2 className="mb-3 font-semibold">Question details</h2>
        <div className="space-y-3">
          {questions.map((q) => (
            <details key={q.id} className="group rounded-xl border border-slate-200 bg-white">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                <span className="text-sm font-medium text-slate-500">Q{q.order}</span>
                <span className="flex-1 text-sm font-medium">{q.text}</span>
                {q.answer ? (
                  <span
                    className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${toneClasses[scoreTone(q.answer.score)]}`}
                  >
                    {q.answer.score}/10
                  </span>
                ) : (
                  <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    Skipped
                  </span>
                )}
              </summary>

              <div className="space-y-3 border-t border-slate-100 p-4">
                <p className="text-xs text-slate-500">
                  {q.topic} · {q.category} · {q.difficulty}
                </p>
                {q.answer ? (
                  <>
                    <div className="rounded-lg bg-slate-100 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Your answer
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{q.answer.text}</p>
                    </div>
                    <FeedbackCard answer={q.answer} />
                  </>
                ) : (
                  <p className="text-sm text-slate-500">You did not answer this question.</p>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      <Link
        to="/"
        className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Start a new interview
      </Link>
    </div>
  )
}