import type { Answer } from '../types/api'
import { scoreTone, toneClasses } from '../lib/score'

function ListSection({ title, items, dotClass }: { title: string; items: string[]; dotClass: string }) {
  if (items.length === 0) return null
  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-slate-700">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FeedbackCard({ answer }: { answer: Answer }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span
          className={`rounded-lg border px-3 py-1 text-lg font-semibold ${toneClasses[scoreTone(answer.score)]}`}
        >
          {answer.score}/10
        </span>
        <h3 className="font-medium">AI feedback</h3>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-700">{answer.feedback}</p>

      <ListSection title="Strengths" items={answer.strengths} dotClass="bg-emerald-500" />
      <ListSection title="To improve" items={answer.improvements} dotClass="bg-amber-500" />

      {answer.idealAnswerHint && (
        <div className="mt-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900">
          <span className="font-medium">A strong answer would include: </span>
          {answer.idealAnswerHint}
        </div>
      )}
    </div>
  )
}