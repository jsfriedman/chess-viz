import type { Chess, Square as ChessSquare } from 'chess.js'
import type { Color, PieceCode, Square } from './board'
import {
  colorOf,
  loadPosition,
  occupiedSquares,
  opponentOf,
  pieceAt,
  piecesAttacking,
  valueOf,
  type BoardPiece,
} from './position'

export interface ExchangeCapture {
  capturer: BoardPiece
  captured: PieceCode
  notation: string
}

export type HangingReason = 'not-attacked' | 'undefended' | 'wins-material' | 'even-trade' | 'loses-material'

export interface HangingAnalysis {
  target: BoardPiece
  attackers: readonly BoardPiece[]
  defenders: readonly BoardPiece[]
  hanging: boolean
  reason: HangingReason
  /** Best line for both sides, always starting with the attacker's first capture */
  line: readonly ExchangeCapture[]
  /** Material the attacking side nets by starting the exchange */
  net: number
  kingCannotRecapture: boolean
}

function captureNotation(capturer: BoardPiece, square: Square): string {
  const prefix = capturer.piece[1] === 'P' ? capturer.square[0] : capturer.piece[1]
  return `${prefix}x${square}`
}

function movePiece(board: Chess, from: Square, to: Square, piece: PieceCode) {
  board.remove(from as ChessSquare)
  board.remove(to as ChessSquare)
  board.put({ type: piece[1]!.toLowerCase() as 'p', color: colorOf(piece) }, to as ChessSquare)
}

// Plays out every capture on the square, cheapest capturer first, revealing x-ray attackers as pieces leave
function simulateExchange(chess: Chess, square: Square, firstSide: Color) {
  const board = loadPosition(chess.fen())
  const sequence: ExchangeCapture[] = []
  let side = firstSide
  let kingCannotRecapture = false

  for (;;) {
    const occupant = pieceAt(board, square)!
    const capturer = piecesAttacking(board, square, side)[0]
    if (!capturer) break

    movePiece(board, capturer.square, square, capturer.piece)
    if (capturer.piece[1] === 'K' && piecesAttacking(board, square, opponentOf(side)).length > 0) {
      kingCannotRecapture = true
      break
    }
    sequence.push({ capturer, captured: occupant, notation: captureNotation(capturer, square) })
    side = opponentOf(side)
  }

  return { sequence, kingCannotRecapture }
}

function evaluateExchange(sequence: readonly ExchangeCapture[]) {
  const gains = sequence.map((capture) => valueOf(capture.captured))
  // bestFrom[depth]: what the side to capture at that depth can secure, given either side may stop
  const bestFrom = gains.reduceRight<number[]>((later, gain) => [Math.max(0, gain - (later[0] ?? 0)), ...later], [])
  const continues = (depth: number) => gains[depth]! - (bestFrom[depth + 1] ?? 0) > 0
  let lineLength = Math.min(1, sequence.length)
  while (lineLength < sequence.length && continues(lineLength)) lineLength += 1
  return {
    line: sequence.slice(0, lineLength),
    net: sequence.length === 0 ? 0 : gains[0]! - (bestFrom[1] ?? 0),
  }
}

function analyze(chess: Chess, square: Square): HangingAnalysis | undefined {
  const piece = pieceAt(chess, square)
  if (!piece) return undefined
  const color = colorOf(piece)
  const target = { square, piece }
  const attackers = piecesAttacking(chess, square, opponentOf(color))
  const defenders = piecesAttacking(chess, square, color)
  const notAttacked = { target, attackers, defenders, hanging: false, line: [], net: 0, kingCannotRecapture: false }

  if (attackers.length === 0 || piece[1] === 'K') return { ...notAttacked, reason: 'not-attacked' }

  const { sequence, kingCannotRecapture } = simulateExchange(chess, square, opponentOf(color))
  const { line, net } = evaluateExchange(sequence)
  const base = { target, attackers, defenders, line, net, hanging: net > 0 }
  const lineReachedEnd = line.length === sequence.length

  if (net > 0) {
    const reason = defenders.length === 0 ? 'undefended' : 'wins-material'
    return { ...base, reason, kingCannotRecapture: kingCannotRecapture && lineReachedEnd }
  }
  return { ...base, reason: net === 0 ? 'even-trade' : 'loses-material', kingCannotRecapture: false }
}

export function analyzeHanging(fen: string, square: Square): HangingAnalysis | undefined {
  return analyze(loadPosition(fen), square)
}

export function findHangingSquares(fen: string): Square[] {
  const chess = loadPosition(fen)
  return occupiedSquares(chess).filter((square) => analyze(chess, square)?.hanging)
}
