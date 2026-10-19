export type ScoreTone = 'good' | 'average' | 'poor'

export function scoreTone(score: number): ScoreTone {
  if (score >= 7) return 'good'
  if (score >= 5) return 'average'
  return 'poor'
}

export const toneClasses: Record<ScoreTone, string> = {
  good: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  average: 'bg-amber-100 text-amber-800 border-amber-200',
  poor: 'bg-red-100 text-red-800 border-red-200',
}

export const barClasses: Record<ScoreTone, string> = {
  good: 'bg-emerald-500',
  average: 'bg-amber-500',
  poor: 'bg-red-500',
}