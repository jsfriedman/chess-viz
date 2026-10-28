import { files, type PieceType, type Placement, type Square } from './board'

type Offset = readonly [fileStep: number, rankStep: number]

const straightOffsets: readonly Offset[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const diagonalOffsets: readonly Offset[] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]
const knightOffsets: readonly Offset[] = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
]

const movement: Readonly<Record<Exclude<PieceType, 'P'>, { offsets: readonly Offset[]; slides: boolean }>> = {
  N: { offsets: knightOffsets, slides: false },
  B: { offsets: diagonalOffsets, slides: true },
  R: { offsets: straightOffsets, slides: true },
  Q: { offsets: [...straightOffsets, ...diagonalOffsets], slides: true },
  K: { offsets: [...straightOffsets, ...diagonalOffsets], slides: false },
}

function offsetSquare(square: Square, [fileStep, rankStep]: Offset): Square | undefined {
  const fileIndex = files.indexOf(square[0] as (typeof files)[number]) + fileStep
  const rank = Number(square[1]) + rankStep
  const inside = fileIndex >= 0 && fileIndex < 8 && rank >= 1 && rank <= 8
  return inside ? `${files[fileIndex]}${rank}` : undefined
}

function ray(placement: Placement, from: Square, offset: Offset, slides: boolean): Square[] {
  const next = offsetSquare(from, offset)
  if (!next) return []
  if (placement[next] || !slides) return [next]
  return [next, ...ray(placement, next, offset, slides)]
}

// Squares the piece can move to, ignoring checks and pins; pawns are not supported
export function reachableSquares(placement: Placement, square: Square): Square[] {
  const piece = placement[square]
  if (!piece || piece[1] === 'P') return []
  const { offsets, slides } = movement[piece[1] as Exclude<PieceType, 'P'>]
  return offsets
    .flatMap((offset) => ray(placement, square, offset, slides))
    .filter((target) => placement[target]?.[0] !== piece[0])
}

export function knightMoves(square: Square): Square[] {
  return knightOffsets.flatMap((offset) => offsetSquare(square, offset) ?? [])
}

export function knightDistances(from: Square, blocked: ReadonlySet<Square>): ReadonlyMap<Square, number> {
  const distances = new Map<Square, number>([[from, 0]])
  const queue: Square[] = [from]
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index]!
    const distance = distances.get(current)! + 1
    for (const next of knightMoves(current)) {
      if (blocked.has(next) || distances.has(next)) continue
      distances.set(next, distance)
      queue.push(next)
    }
  }
  return distances
}

// Follows `preferred` hop by hop while it stays on a shortest path, so feedback matches the user's attempt
export function shortestKnightPath(
  start: Square,
  target: Square,
  blocked: ReadonlySet<Square>,
  preferred: readonly Square[] = [],
): Square[] | undefined {
  const distanceToTarget = knightDistances(target, blocked)
  const total = distanceToTarget.get(start)
  if (total === undefined) return undefined

  return Array.from({ length: total }).reduce<Square[]>((path, _, step) => {
    const current = path.at(-1) ?? start
    const remaining = total - step - 1
    const candidates = knightMoves(current).filter(
      (square) => !blocked.has(square) && distanceToTarget.get(square) === remaining,
    )
    const preferredSquare = preferred[step]
    const next = preferredSquare && candidates.includes(preferredSquare) ? preferredSquare : candidates[0]!
    return [...path, next]
  }, [])
}
