import type { Square } from '@/chess/board'
import type { SquareMark } from '@/components/ChessBoard.vue'

export type GradedMark = Extract<SquareMark, 'correct' | 'wrong' | 'missed'>

export interface Tally {
  found: number
  total: number
  wrong: number
}

export function selectionMarks(selected: ReadonlySet<Square>): Record<Square, SquareMark> {
  return Object.fromEntries([...selected].map((square) => [square, 'selected' as const]))
}

export function gradeSelection(answer: ReadonlySet<Square>, selected: ReadonlySet<Square>): Record<Square, GradedMark> {
  return Object.fromEntries(
    [...new Set([...answer, ...selected])].map((square): [Square, GradedMark] => {
      if (!answer.has(square)) return [square, 'wrong']
      return [square, selected.has(square) ? 'correct' : 'missed']
    }),
  )
}

export function tallyMarks(marks: Readonly<Record<Square, GradedMark>>, total: number): Tally {
  const values = Object.values(marks)
  return {
    found: values.filter((mark) => mark === 'correct').length,
    total,
    wrong: values.filter((mark) => mark === 'wrong').length,
  }
}
