import { parsePlacement, type Square } from '@/chess/board'
import { knightMoves, shortestKnightPath } from '@/chess/reach'
import type { KnightPathItem } from './items'

export type KnightPathVerdict = 'shortest' | 'longer' | 'illegal-hop' | 'blocked' | 'unfinished'

export interface KnightPathGrade {
  verdict: KnightPathVerdict
  solution: readonly Square[]
  // Index into the path of the first bad hop, for illegal-hop and blocked
  problemIndex?: number
}

export function blockedSquares(item: KnightPathItem): ReadonlySet<Square> {
  return new Set(Object.keys(parsePlacement(item.fen)).filter((square) => square !== item.start))
}

export function gradeKnightPath(item: KnightPathItem, path: readonly Square[]): KnightPathGrade {
  const blocked = blockedSquares(item)
  const solution = shortestKnightPath(item.start, item.target, blocked, path) ?? []

  const illegalIndex = path.findIndex((square, index) => !knightMoves(path[index - 1] ?? item.start).includes(square))
  if (illegalIndex >= 0) return { verdict: 'illegal-hop', solution, problemIndex: illegalIndex }

  const blockedIndex = path.findIndex((square) => blocked.has(square))
  if (blockedIndex >= 0) return { verdict: 'blocked', solution, problemIndex: blockedIndex }

  if (path.at(-1) !== item.target) return { verdict: 'unfinished', solution }
  return { verdict: path.length === solution.length ? 'shortest' : 'longer', solution }
}
