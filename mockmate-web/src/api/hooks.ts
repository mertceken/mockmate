import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionsApi } from './sessions'

export function useSession(id: string) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionsApi.get(id),
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: (session) => queryClient.setQueryData(['session', session.id], session),
  })
}

export function useSubmitAnswer(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ questionId, text }: { questionId: string; text: string }) =>
      sessionsApi.submitAnswer(sessionId, questionId, { text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
  })
}

export function useCompleteSession(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => sessionsApi.complete(sessionId),
    onSuccess: (session) => queryClient.setQueryData(['session', sessionId], session),
  })
}