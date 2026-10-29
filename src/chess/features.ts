import type { Square as ChessSquare } from 'chess.js'
import type { PieceType, Square } from './board'
import { analyzeHanging, type HangingAnalysis } from './hanging'
import { colorOf, loadPosition, occupiedSquares, opponentOf, pieceAt } from './position'
import { givesCheck, legalMoves, type ScanMove } from './scan'

// Patterns beginners tend to miss when scanning a board
export const positionTags = [
  'backward',
  'long-range',
  'knight',
  'pinned',
  'en-passant',
  'x-ray',
  'king-cannot-recapture',
] as const
export type PositionTag = (typeof positionTags)[number]

export interface PositionProfile {
  pieceCount: number
  inCheck: boolean
  checks: number
  captures: number
  hanging: number
  // Attacked but safe: pieces that look hanging and aren't
  decoys: number
  tags: PositionTag[]
}

const sliders: readonly PieceType[] = ['B', 'R', 'Q']
const longRangeDistance = 4

const rankOf = (square: Square) => Number(square[1])
const fileOf = (square: Square) => square.charCodeAt(0)
const distance = (from: Square, to: Square) =>
  Math.max(Math.abs(fileOf(from) - fileOf(to)), Math.abs(rankOf(from) - rankOf(to)))

function isBackward(move: ScanMove): boolean {
  if (move.piece[1] === 'P') return false
  const rankChange = rankOf(move.to) - rankOf(move.from)
  return colorOf(move.piece) === 'w' ? rankChange < 0 : rankChange > 0
}

function moveTags(moves: readonly ScanMove[]): PositionTag[] {
  return [
    moves.some(isBackward) && 'backward',
    moves.some((move) => sliders.includes(move.piece[1] as PieceType) && distance(move.from, move.to) >= longRangeDistance) &&
      'long-range',
    moves.some((move) => move.piece[1] === 'N') && 'knight',
    moves.some((move) => move.capturedSquare !== undefined && move.capturedSquare !== move.to) && 'en-passant',
  ].filter((tag): tag is PositionTag => tag !== false)
}

// An attacker with another attacker lined up behind it
function hasHiddenAttacker(fen: string, analysis: HangingAnalysis): boolean {
  const side = opponentOf(colorOf(analysis.target.piece))
  const visible = new Set(analysis.attackers.map((attacker) => attacker.square))
  return analysis.attackers.some((attacker) => {
    const board = loadPosition(fen)
    board.remove(attacker.square as ChessSquare)
    return board.attackers(analysis.target.square as ChessSquare, side).some((square) => !visible.has(square))
  })
}

export function profilePosition(fen: string): PositionProfile {
  const chess = loadPosition(fen)
  const toMove = chess.turn()
  const moves = legalMoves(chess)
  const checkMoves = moves.filter(givesCheck)
  const captureMoves = moves.filter((move) => move.capturedSquare !== undefined)
  const squares = occupiedSquares(chess)
  const analyses = squares.flatMap((square) => analyzeHanging(fen, square) ?? [])
  const hanging = analyses.filter((analysis) => analysis.hanging)

  const pinned = squares
    .filter((square) => colorOf(pieceAt(chess, square)!) === opponentOf(toMove))
    .some((square) =>
      chess
        .attackers(square as ChessSquare, toMove)
        .filter((from) => pieceAt(chess, from)?.[1] !== 'K')
        .some((from) => !captureMoves.some((move) => move.from === from && move.capturedSquare === square)),
    )

  const tags: PositionTag[] = [
    ...moveTags([...checkMoves, ...captureMoves]),
    ...(pinned && !chess.inCheck() ? (['pinned'] as const) : []),
    ...(hanging.some((analysis) => hasHiddenAttacker(fen, analysis)) ? (['x-ray'] as const) : []),
    ...(hanging.some((analysis) => analysis.kingCannotRecapture) ? (['king-cannot-recapture'] as const) : []),
  ]

  return {
    pieceCount: squares.length,
    inCheck: chess.inCheck(),
    checks: new Set(checkMoves.map((move) => move.from)).size,
    captures: new Set(captureMoves.map((move) => move.capturedSquare)).size,
    hanging: hanging.length,
    decoys: analyses.filter((analysis) => analysis.attackers.length > 0 && !analysis.hanging && analysis.target.piece[1] !== 'K')
      .length,
    tags: positionTags.filter((tag) => tags.includes(tag)),
  }
}

const maxCountedAnswers = 8
const maxCountedDecoys = 4

// Raw difficulty; the pipeline turns it into 1–5 tiers by quantile
export function difficultyScore(profile: PositionProfile): number {
  const answers = Math.min(profile.checks + profile.captures + profile.hanging, maxCountedAnswers)
  return (
    profile.pieceCount * 0.1 + answers * 0.5 + profile.tags.length + Math.min(profile.decoys, maxCountedDecoys) * 0.4
  )
}
