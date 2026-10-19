export type ExperienceLevel = 'Junior' | 'Mid' | 'Senior'
export type SessionStatus = 'InProgress' | 'Completed'
export type QuestionCategory = 'Technical' | 'Behavioral' | 'SystemDesign'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface CreateSessionRequest {
  position: string
  techStack: string
  level: ExperienceLevel
  questionCount: number
}

export interface SubmitAnswerRequest {
  text: string
}

export interface Answer {
  id: string
  text: string
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  idealAnswerHint: string
}

export interface Question {
  id: string
  order: number
  text: string
  topic: string
  category: QuestionCategory
  difficulty: Difficulty
  answer: Answer | null
}

export interface Report {
  summary: string
  strongAreas: string[]
  weakAreas: string[]
  recommendations: string[]
}

export interface Session {
  id: string
  position: string
  techStack: string
  level: ExperienceLevel
  status: SessionStatus
  startedAt: string
  completedAt: string | null
  overallScore: number | null
  questions: Question[]
  report: Report | null
}