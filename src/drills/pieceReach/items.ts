import { allSquares, placementToFen, type Color, type PieceCode, type PieceType, type Placement, type Square } from '@/chess/board'
import { opponentOf } from '@/chess/position'
import { pathDistances, reachableSquares } from '@/chess/reach'
import type { Difficulty } from '../difficulty'
import { pick, sample, type Random } from '../random'

export const pieceReachModes = ['reach', 'path'] as const
export type PieceReachMode = (typeof pieceReachModes)[number]

export const pieceTypes = ['K', 'Q', 'R', 'B', 'N', 'P'] as const satisfies readonly PieceType[]

export interface ReachItem {
  mode: 'reach'
  fen: string
  square: Square
}

export interface PathItem {
  mode: 'path'
  fen: string
  start: Square
  target: Square
}

export type PieceReachItem = ReachItem | PathItem

interface ReachLevel {
  friends: number
  enemies: number
}

const reachLevels: Readonly<Record<Difficulty, ReachLevel>> = {
  1: { friends: 0, enemies: 0 },
  2: { friends: 2, enemies: 0 },
  3: { friends: 3, enemies: 1 },
  4: { friends: 2, enemies: 3 },
  5: { friends: 3, enemies: 5 },
}

type PathPiece = Exclude<PieceType, 'P'>

interface PathLevel {
  blockers: number
  distances: Readonly<Record<PathPiece, readonly number[]>>
}

const sliderDistances = (distances: readonly number[]) => ({ Q: distances, R: distances, B: distances })

const pathLevels: Readonly<Record<Difficulty, PathLevel>> = {
  1: { blockers: 0, distances: { N: [2], K: [2, 3], ...sliderDistances([2]) } },
  2: { blockers: 4, distances: { N: [3], K: [3, 4], ...sliderDistances([2]) } },
  3: { blockers: 8, distances: { N: [3, 4], K: [4, 5], ...sliderDistances([2, 3]) } },
  4: { blockers: 12, distances: { N: [4, 5], K: [4, 5, 6], ...sliderDistances([3]) } },
  5: { blockers: 16, distances: { N: [4, 5, 6], K: [5, 6, 7], ...sliderDistances([3, 4]) } },
}

const companionTypes: readonly PieceType[] = ['P', 'P', 'P', 'N', 'B', 'R']
const pawnSquares = allSquares.filter((square) => square[1] !== '1' && square[1] !== '8')
const maxAttempts = 100

const isPathPiece = (type: PieceType): type is PathPiece => type !== 'P'

function squaresFor(piece: PieceCode): readonly Square[] {
  return piece[1] === 'P' ? pawnSquares : allSquares
}

function openSquaresFor(piece: PieceCode, placement: Placement, pool: readonly Square[]): Square[] {
  const allowed = squaresFor(piece)
  return pool.filter((square) => !placement[square] && allowed.includes(square))
}

// Squares where a companion changes what the piece can reach: its lines, plus a pawn's capture diagonals
function influenceSquares(piece: PieceCode, square: Square): Square[] {
  if (piece[1] !== 'P') return reachableSquares({ [square]: piece }, square)
  const enemyProbe: PieceCode = `${opponentOf(piece[0] as Color)}P`
  const rank = Number(square[1]) + (piece[0] === 'w' ? 1 : -1)
  const diagonals = [-1, 1].map((step) => `${String.fromCharCode(square.charCodeAt(0) + step)}${rank}`)
  const probe = Object.fromEntries(diagonals.map((diagonal) => [diagonal, enemyProbe]))
  return reachableSquares({ ...probe, [square]: piece }, square)
}

function attempt<T>(generate: () => T | undefined): T {
  for (let tries = 0; tries < maxAttempts; tries += 1) {
    const item = generate()
    if (item) return item
  }
  throw new Error('Could not generate a piece reach item')
}

function tryReachItem(type: PieceType, level: ReachLevel, random: Random): ReachItem | undefined {
  const color: Color = random() < 0.5 ? 'w' : 'b'
  const piece: PieceCode = `${color}${type}`
  const square = pick(squaresFor(piece), random)
  const lines = influenceSquares(piece, square)
  // Kings never face enemies, where moving into check would matter
  const enemies = type === 'K' ? 0 : level.enemies

  const companionColors: Color[] = [
    ...Array.from({ length: level.friends }, () => color),
    ...Array.from({ length: enemies }, () => opponentOf(color)),
  ]
  // Every other companion lands in the piece's lines so it actually blocks or can be captured
  const placement = companionColors.reduce<Placement>(
    (current, companionColor, index) => {
      const companion: PieceCode = `${companionColor}${pick(companionTypes, random)}`
      const inLine = openSquaresFor(companion, current, index % 2 === 0 ? lines : allSquares)
      const options = inLine.length > 0 ? inLine : openSquaresFor(companion, current, allSquares)
      return { ...current, [pick(options, random)]: companion }
    },
    { [square]: piece },
  )

  if (reachableSquares(placement, square).length === 0) return undefined
  return { mode: 'reach', fen: placementToFen(placement), square }
}

function tryPathItem(type: PathPiece, level: PathLevel, random: Random): PathItem | undefined {
  const piece: PieceCode = `w${type}`
  const start = pick(allSquares, random)
  const blockers = sample(
    pawnSquares.filter((square) => square !== start),
    level.blockers,
    random,
  )
  const reachable = [...pathDistances(piece, start, new Set(blockers))].filter(([, distance]) => distance > 0)
  const wanted = reachable.filter(([, distance]) => level.distances[type].includes(distance))
  // Open boards rarely let a queen need 3+ moves, so settle for the longest route available
  const longest = Math.max(0, ...reachable.map(([, distance]) => distance))
  const targets = wanted.length > 0 ? wanted : reachable.filter(([, distance]) => distance === longest && distance >= 2)
  if (targets.length === 0) return undefined

  const placement: Placement = Object.fromEntries([
    [start, piece],
    ...blockers.map((square) => [square, 'wP']),
  ])
  return { mode: 'path', fen: placementToFen(placement), start, target: pick(targets, random)[0] }
}

export function generateReachItem(type: PieceType, difficulty: Difficulty, random: Random = Math.random): ReachItem {
  return attempt(() => tryReachItem(type, reachLevels[difficulty], random))
}

export function generatePathItem(type: PathPiece, difficulty: Difficulty, random: Random = Math.random): PathItem {
  return attempt(() => tryPathItem(type, pathLevels[difficulty], random))
}

// Pawns have no Path exercise, so a pawn-only selection plays Reach throughout
export function generateSession(
  modes: readonly PieceReachMode[],
  pieces: readonly PieceType[],
  difficulty: Difficulty,
  count: number,
  random: Random = Math.random,
): PieceReachItem[] {
  if (modes.length === 0) throw new Error('Pick at least one mode')
  if (pieces.length === 0) throw new Error('Pick at least one piece')
  const pathPieces = pieces.filter(isPathPiece)
  return Array.from({ length: count }, (_, index) => {
    const mode = modes[index % modes.length]
    return mode === 'path' && pathPieces.length > 0
      ? generatePathItem(pick(pathPieces, random), difficulty, random)
      : generateReachItem(pick(pieces, random), difficulty, random)
  })
}
