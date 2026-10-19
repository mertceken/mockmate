import { Link, Route, Routes } from 'react-router-dom'
import NewSessionPage from './pages/NewSessionPage'
import InterviewPage from './pages/InterviewPage'
import ReportPage from './pages/ReportPage'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            MockMate
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Routes>
          <Route path="/" element={<NewSessionPage />} />
          <Route path="/sessions/:id" element={<InterviewPage />} />
          <Route path="/sessions/:id/report" element={<ReportPage />} />
          <Route
            path="*"
            element={<p className="text-slate-600">Page not found. <Link to="/" className="text-indigo-600 underline">Go home</Link></p>}
          />
        </Routes>
      </main>
    </div>
  )
}