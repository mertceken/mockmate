import { request } from './client'
import type { Answer, CreateSessionRequest, Session, SubmitAnswerRequest } from '../types/api'

export const sessionsApi = {
  create: (body: CreateSessionRequest) =>
    request<Session>('/api/sessions', { method: 'POST', body: JSON.stringify(body) }),

  get: (id: string) => request<Session>(`/api/sessions/${id}`),

  submitAnswer: (sessionId: string, questionId: string, body: SubmitAnswerRequest) =>
    request<Answer>(`/api/sessions/${sessionId}/questions/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  complete: (id: string) => request<Session>(`/api/sessions/${id}/complete`, { method: 'POST' }),
}