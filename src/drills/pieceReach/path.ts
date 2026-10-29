import { parsePlacement, type PieceCode, type Square } from '@/chess/board'
import { canMove, shortestPath } from '@/chess/reach'
import type { PathItem } from './items'

export type PathVerdict = 'shortest' | 'longer' | 'illegal-hop' | 'blocked' | 'unfinished'

export interface PathGrade {
  verdict: PathVerdict
  solution: readonly Square[]
  // Index into the path of the first bad hop, for illegal-hop and blocked
  problemIndex?: number
}

export function pathPiece(item: PathItem): PieceCode {
  return parsePlacement(item.fen)[item.start]!
}

export function blockedSquares(item: PathItem): ReadonlySet<Square> {
  return new Set(Object.keys(parsePlacement(item.fen)).filter((square) => square !== item.start))
}

export function gradePath(item: PathItem, path: readonly Square[]): PathGrade {
  const piece = pathPiece(item)
  const blocked = blockedSquares(item)
  const solution = shortestPath(piece, item.start, item.target, blocked, path) ?? []

  const blockedIndex = path.findIndex((square) => blocked.has(square))
  const illegalIndex = path.findIndex((square, index) => !canMove(piece, path[index - 1] ?? item.start, square, blocked))
  if (blockedIndex >= 0 && blockedIndex === illegalIndex) return { verdict: 'blocked', solution, problemIndex: blockedIndex }
  if (illegalIndex >= 0) return { verdict: 'illegal-hop', solution, problemIndex: illegalIndex }

  if (path.at(-1) !== item.target) return { verdict: 'unfinished', solution }
  return { verdict: path.length === solution.length ? 'shortest' : 'longer', solution }
}
