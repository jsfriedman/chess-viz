import { Chess, type Square as ChessSquare } from 'chess.js'
import type { Color, PieceCode, PieceType, Square } from './board'

export const pieceValues: Readonly<Record<PieceType, number>> = {
  P: 1,
  N: 3,
  B: 3,
  R: 5,
  Q: 9,
  K: 100,
}

export interface BoardPiece {
  square: Square
  piece: PieceCode
}

export function loadPosition(fen: string): Chess {
  try {
    return new Chess(fen)
  } catch (error) {
    throw new Error(`Invalid FEN "${fen}": ${(error as Error).message}`)
  }
}

export function pieceAt(chess: Chess, square: Square): PieceCode | undefined {
  const found = chess.get(square as ChessSquare)
  return found ? (`${found.color}${found.type.toUpperCase()}` as PieceCode) : undefined
}

export function valueOf(piece: PieceCode): number {
  return pieceValues[piece[1] as PieceType]
}

export function colorOf(piece: PieceCode): Color {
  return piece[0] as Color
}

export function opponentOf(color: Color): Color {
  return color === 'w' ? 'b' : 'w'
}

export function piecesAttacking(chess: Chess, square: Square, color: Color): BoardPiece[] {
  return chess
    .attackers(square as ChessSquare, color)
    .map((from) => ({ square: from, piece: pieceAt(chess, from)! }))
    .sort((first, second) => valueOf(first.piece) - valueOf(second.piece))
}

export function occupiedSquares(chess: Chess): Square[] {
  return chess
    .board()
    .flat()
    .flatMap((cell) => (cell ? [cell.square] : []))
}
