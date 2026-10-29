import { files, type Color, type PieceCode, type PieceType, type Placement, type Square } from './board'

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

const pawnDirection = (color: Color) => (color === 'w' ? 1 : -1)
const pawnStartRank = (color: Color) => (color === 'w' ? '2' : '7')

function pawnTargets(color: Color, square: Square, placement: Placement): Square[] {
  const direction = pawnDirection(color)
  const oneStep = offsetSquare(square, [0, direction])
  const twoSteps = offsetSquare(square, [0, 2 * direction])
  const pushes =
    oneStep && !placement[oneStep]
      ? [oneStep, ...(square[1] === pawnStartRank(color) && twoSteps && !placement[twoSteps] ? [twoSteps] : [])]
      : []
  const captures = ([-1, 1] as const)
    .flatMap((fileStep) => offsetSquare(square, [fileStep, direction]) ?? [])
    .filter((target) => placement[target] && placement[target][0] !== color)
  return [...pushes, ...captures]
}

// Rays grouped by direction; pawns get one group per target
function targetGroups(piece: PieceCode, square: Square, placement: Placement): Square[][] {
  const color = piece[0] as Color
  if (piece[1] === 'P') return pawnTargets(color, square, placement).map((target) => [target])
  const { offsets, slides } = movement[piece[1] as Exclude<PieceType, 'P'>]
  return offsets
    .map((offset) => ray(placement, square, offset, slides).filter((target) => placement[target]?.[0] !== color))
    .filter((group) => group.length > 0)
}

// Squares the piece can move to, ignoring checks, pins, castling and en passant
export function reachableSquares(placement: Placement, square: Square): Square[] {
  const piece = placement[square]
  return piece ? targetGroups(piece, square, placement).flat() : []
}

// The farthest reachable square in each direction, for drawing a piece's lines
export function reachEndpoints(placement: Placement, square: Square): Square[] {
  const piece = placement[square]
  return piece ? targetGroups(piece, square, placement).map((group) => group.at(-1)!) : []
}

function blockerPlacement(piece: PieceCode, blocked: ReadonlySet<Square>): Placement {
  const blocker: PieceCode = `${piece[0] as Color}P`
  return Object.fromEntries([...blocked].map((square) => [square, blocker]))
}

export function pathDistances(piece: PieceCode, from: Square, blocked: ReadonlySet<Square>): ReadonlyMap<Square, number> {
  const placement = blockerPlacement(piece, blocked)
  const distances = new Map<Square, number>([[from, 0]])
  const queue: Square[] = [from]
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index]!
    const distance = distances.get(current)! + 1
    for (const next of targetGroups(piece, current, placement).flat()) {
      if (distances.has(next)) continue
      distances.set(next, distance)
      queue.push(next)
    }
  }
  return distances
}

export function canMove(piece: PieceCode, from: Square, to: Square, blocked: ReadonlySet<Square>): boolean {
  return targetGroups(piece, from, blockerPlacement(piece, blocked)).flat().includes(to)
}

// Follows `preferred` hop by hop while it stays on a shortest path, so feedback matches the user's attempt.
// Searches back from the target, which is sound because non-pawn movement is symmetric.
export function shortestPath(
  piece: PieceCode,
  start: Square,
  target: Square,
  blocked: ReadonlySet<Square>,
  preferred: readonly Square[] = [],
): Square[] | undefined {
  const distanceToTarget = pathDistances(piece, target, blocked)
  const total = distanceToTarget.get(start)
  if (total === undefined) return undefined
  const placement = blockerPlacement(piece, blocked)

  return Array.from({ length: total }).reduce<Square[]>((path, _, step) => {
    const current = path.at(-1) ?? start
    const remaining = total - step - 1
    const candidates = targetGroups(piece, current, placement)
      .flat()
      .filter((square) => distanceToTarget.get(square) === remaining)
    const preferredSquare = preferred[step]
    const next = preferredSquare && candidates.includes(preferredSquare) ? preferredSquare : candidates[0]!
    return [...path, next]
  }, [])
}
