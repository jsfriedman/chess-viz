import { allSquares, placementToFen, type Color, type PieceCode, type PieceType, type Placement, type Square } from '@/chess/board'
import { opponentOf } from '@/chess/position'
import { knightDistances, reachableSquares } from '@/chess/reach'
import { pick, sample, type Random } from '../random'

export const pieceReachModes = ['reach', 'knight-path'] as const
export type PieceReachMode = (typeof pieceReachModes)[number]

export const difficulties = [1, 2, 3, 4, 5] as const
export type Difficulty = (typeof difficulties)[number]

export interface ReachItem {
  mode: 'reach'
  fen: string
  square: Square
}

export interface KnightPathItem {
  mode: 'knight-path'
  fen: string
  start: Square
  target: Square
}

export type PieceReachItem = ReachItem | KnightPathItem

interface ReachLevel {
  pieces: readonly PieceType[]
  friends: number
  enemies: number
}

// Kings only appear without enemies, where moving into check can't come up
const reachLevels: Readonly<Record<Difficulty, ReachLevel>> = {
  1: { pieces: ['N', 'B', 'R'], friends: 0, enemies: 0 },
  2: { pieces: ['N', 'B', 'R', 'Q', 'K'], friends: 0, enemies: 0 },
  3: { pieces: ['N', 'B', 'R', 'Q', 'K'], friends: 3, enemies: 0 },
  4: { pieces: ['N', 'B', 'R', 'Q'], friends: 2, enemies: 2 },
  5: { pieces: ['N', 'B', 'R', 'Q'], friends: 3, enemies: 4 },
}

interface KnightPathLevel {
  distances: readonly number[]
  blockers: number
}

const knightPathLevels: Readonly<Record<Difficulty, KnightPathLevel>> = {
  1: { distances: [2], blockers: 0 },
  2: { distances: [3], blockers: 0 },
  3: { distances: [4, 5], blockers: 0 },
  4: { distances: [3, 4], blockers: 5 },
  5: { distances: [4, 5, 6], blockers: 10 },
}

const companionTypes: readonly PieceType[] = ['P', 'P', 'P', 'N', 'B', 'R']
const pawnSquares = allSquares.filter((square) => square[1] !== '1' && square[1] !== '8')
const maxAttempts = 100

function openSquaresFor(piece: PieceCode, placement: Placement, pool: readonly Square[]): Square[] {
  return pool.filter((square) => !placement[square] && (piece[1] !== 'P' || pawnSquares.includes(square)))
}

function attempt<T>(generate: () => T | undefined): T {
  for (let tries = 0; tries < maxAttempts; tries += 1) {
    const item = generate()
    if (item) return item
  }
  throw new Error('Could not generate a piece reach item')
}

function tryReachItem(level: ReachLevel, random: Random): ReachItem | undefined {
  const color: Color = random() < 0.5 ? 'w' : 'b'
  const piece: PieceCode = `${color}${pick(level.pieces, random)}`
  const square = pick(allSquares, random)
  const openReach = reachableSquares({ [square]: piece }, square)

  const companionColors: Color[] = [
    ...Array.from({ length: level.friends }, () => color),
    ...Array.from({ length: level.enemies }, () => opponentOf(color)),
  ]
  // Every other companion lands in the piece's lines so it actually blocks or can be captured
  const placement = companionColors.reduce<Placement>(
    (current, companionColor, index) => {
      const companion: PieceCode = `${companionColor}${pick(companionTypes, random)}`
      const inLine = openSquaresFor(companion, current, index % 2 === 0 ? openReach : allSquares)
      const options = inLine.length > 0 ? inLine : openSquaresFor(companion, current, allSquares)
      return { ...current, [pick(options, random)]: companion }
    },
    { [square]: piece },
  )

  if (reachableSquares(placement, square).length === 0) return undefined
  return { mode: 'reach', fen: placementToFen(placement), square }
}

function tryKnightPathItem(level: KnightPathLevel, random: Random): KnightPathItem | undefined {
  const start = pick(allSquares, random)
  const blockers = sample(
    pawnSquares.filter((square) => square !== start),
    level.blockers,
    random,
  )
  const distances = knightDistances(start, new Set(blockers))
  const targets = [...distances].filter(([, distance]) => level.distances.includes(distance)).map(([square]) => square)
  if (targets.length === 0) return undefined

  const placement: Placement = Object.fromEntries([
    [start, 'wN'],
    ...blockers.map((square) => [square, 'wP']),
  ])
  return { mode: 'knight-path', fen: placementToFen(placement), start, target: pick(targets, random) }
}

export function generateReachItem(difficulty: Difficulty, random: Random = Math.random): ReachItem {
  return attempt(() => tryReachItem(reachLevels[difficulty], random))
}

export function generateKnightPathItem(difficulty: Difficulty, random: Random = Math.random): KnightPathItem {
  return attempt(() => tryKnightPathItem(knightPathLevels[difficulty], random))
}

export function generateSession(
  modes: readonly PieceReachMode[],
  difficulty: Difficulty,
  count: number,
  random: Random = Math.random,
): PieceReachItem[] {
  if (modes.length === 0) throw new Error('Pick at least one mode')
  return Array.from({ length: count }, (_, index) =>
    modes[index % modes.length] === 'reach'
      ? generateReachItem(difficulty, random)
      : generateKnightPathItem(difficulty, random),
  )
}
