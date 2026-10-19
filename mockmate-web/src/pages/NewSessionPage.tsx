import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateSession } from '../api/hooks'
import type { ExperienceLevel } from '../types/api'

interface Preset {
  label: string
  position: string
  techStack: string
  level: ExperienceLevel
}

const LEVELS: ExperienceLevel[] = ['Junior', 'Mid', 'Senior']
const QUESTION_COUNTS = [3, 5, 7, 10]

const PRESETS: Preset[] = [
  {
    label: 'Junior .NET Developer',
    position: 'Junior .NET Developer',
    techStack: 'C#, ASP.NET Core, Entity Framework Core, SQL Server',
    level: 'Junior',
  },
  {
    label: 'Full Stack Engineer',
    position: 'Full Stack Engineer',
    techStack: 'C#, ASP.NET Core, React, TypeScript, SQL Server',
    level: 'Mid',
  },
  {
    label: 'Junior Frontend Developer',
    position: 'Junior Frontend Developer',
    techStack: 'React, TypeScript, JavaScript, HTML, CSS, REST APIs',
    level: 'Junior',
  },
  {
    label: 'Junior Business Analyst',
    position: 'Junior Business Analyst',
    techStack: 'SQL, Excel, Jira, Power BI, UML, BPMN, Agile/Scrum',
    level: 'Junior',
  },
]

export default function NewSessionPage() {
  const navigate = useNavigate()
  const createSession = useCreateSession()

  const [position, setPosition] = useState('')
  const [techStack, setTechStack] = useState('')
  const [level, setLevel] = useState<ExperienceLevel>('Junior')
  const [questionCount, setQuestionCount] = useState(5)

  const isLoading = createSession.isPending
  const isValid = position.trim().length > 0 && techStack.trim().length > 0

  function applyPreset(preset: Preset) {
    setPosition(preset.position)
    setTechStack(preset.techStack)
    setLevel(preset.level)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValid || isLoading) return

    createSession.mutate(
      { position: position.trim(), techStack: techStack.trim(), level, questionCount },
      { onSuccess: (session) => navigate(`/sessions/${session.id}`) },
    )
  }

const inputClass =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ' +
  'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60'

  return (
    <div>
      <h1 className="text-2xl font-semibold">New interview</h1>
      <p className="mt-1 text-sm text-slate-600">
        Choose a position and tech stack. The AI will prepare questions for you.
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <fieldset disabled={isLoading} className="space-y-5">
          <div>
            <span className="block text-sm font-medium text-slate-700">Quick start</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs
                             text-slate-700 hover:border-indigo-400 hover:text-indigo-600
                             disabled:opacity-60"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-slate-700">
              Position
            </label>
            <input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              maxLength={200}
              placeholder="e.g. Junior .NET Developer"
              className={`mt-1 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor="techStack" className="block text-sm font-medium text-slate-700">
              Tech stack
            </label>
            <input
              id="techStack"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              maxLength={500}
              placeholder="e.g. C#, ASP.NET Core, EF Core, SQL Server"
              className={`mt-1 ${inputClass}`}
            />
            <p className="mt-1 text-xs text-slate-500">Separate technologies with commas.</p>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700">Experience level</span>
            <div className="mt-2 inline-flex overflow-hidden rounded-lg border border-slate-300">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={level === l}
                  onClick={() => setLevel(l)}
                  className={`px-4 py-2 text-sm disabled:opacity-60 ${
                    level === l
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="questionCount" className="block text-sm font-medium text-slate-700">
              Number of questions
            </label>
            <select
              id="questionCount"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className={`mt-1 w-32 ${inputClass}`}
            >
              {QUESTION_COUNTS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm
                       font-medium text-white hover:bg-indigo-700
                       disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            {isLoading ? 'Preparing your interview...' : 'Start interview'}
          </button>
        </fieldset>
      </form>

      {isLoading && (
        <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">
          The AI is writing your questions. This can take up to a minute, please keep this page open.
        </div>
      )}

      {createSession.isError && (
        <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {createSession.error.message}
        </div>
      )}
    </div>
  )
}