import type { Chess } from 'chess.js'
import type { PieceCode, Square } from './board'
import { loadPosition } from './position'

export interface ScanMove {
  from: Square
  to: Square
  /** Square of the captured piece; differs from `to` only for en passant */
  capturedSquare?: Square
  piece: PieceCode
  san: string
}

export function legalMoves(chess: Chess): ScanMove[] {
  return chess.moves({ verbose: true }).map((move) => ({
    from: move.from,
    to: move.to,
    capturedSquare: move.captured ? (move.isEnPassant() ? `${move.to[0]}${move.from[1]}` : move.to) : undefined,
    piece: `${move.color}${move.piece.toUpperCase()}` as PieceCode,
    san: move.san,
  }))
}

export const givesCheck = (move: ScanMove) => /[+#]$/.test(move.san)

export function checkingMovesFrom(fen: string, square: Square): ScanMove[] {
  return legalMoves(loadPosition(fen)).filter((move) => move.from === square && givesCheck(move))
}

export function capturesOf(fen: string, square: Square): ScanMove[] {
  return legalMoves(loadPosition(fen)).filter((move) => move.capturedSquare === square)
}

export function findCheckingSquares(fen: string): Square[] {
  return [...new Set(legalMoves(loadPosition(fen)).filter(givesCheck).map((move) => move.from))]
}

export function findCapturableSquares(fen: string): Square[] {
  return [...new Set(legalMoves(loadPosition(fen)).flatMap((move) => move.capturedSquare ?? []))]
}
